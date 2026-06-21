# Document de Synthèse — Module Prometheus/Grafana
### Projet fil rouge : Portfolio Full-Stack (React + Express + MongoDB Atlas)
**Auteure :** Mariam Baidy Sow | **Formation :** Cloud/AWS — Orange Digital Center Dakar

---

## 7.1. Problématique (Pourquoi le monitoring ?)

### Sans monitoring : on est aveugle

L'application tourne sur Kubernetes. Mais :
- Comment savoir si un pod consomme trop de RAM ?
- Comment détecter qu'un pod redémarre en boucle à 3h du matin ?
- Comment voir si l'API backend est lente depuis 10 minutes ?
- Comment prouver que l'infrastructure tient la charge ?

Sans monitoring, on découvre les problèmes **quand les utilisateurs se plaignent**. Avec Prometheus/Grafana, on les détecte **avant** qu'ils impactent les utilisateurs.

> **Analogie :** Prometheus/Grafana c'est le tableau de bord d'une voiture. Sans lui le moteur tourne, mais tu ne sais pas si tu manques d'essence, si le moteur chauffe, ou à quelle vitesse tu roules.

---

## 7.2. Présentation

### Prometheus
Outil open source de monitoring créé par SoundCloud (2012), maintenant sous la CNCF (même organisation que Kubernetes).

- Collecte des métriques toutes les X secondes (**scraping**)
- Stocke dans une base de données temporelle (TSDB)
- Langage de requête : **PromQL**
- Système d'alertes intégré

### Grafana
Outil open source de visualisation créé en 2014.

- Se connecte à Prometheus (et autres sources)
- Crée des dashboards interactifs
- Gère les alertes avec notifications
- +3000 dashboards disponibles sur grafana.com/dashboards

> **Prometheus = la base de données de métriques. Grafana = l'interface visuelle.**

---

## 7.3. Concepts

### Target (cible)
Une source de métriques que Prometheus surveille.
```yaml
# Exemple : surveiller le backend portfolio
targets:
  - 'backend.portfolio.svc.cluster.local:5000'
```

### Modèle de données
Chaque métrique a un nom + des labels (paires clé=valeur) + une valeur + un timestamp.
```
# Format : nom{labels} valeur timestamp
http_requests_total{method="GET", status="200", handler="/api/projets"} 1542 1687000000
container_memory_usage_bytes{pod="backend-xxx", namespace="portfolio"} 134217728
```

### Métriques collectées automatiquement
- **CPU** : `container_cpu_usage_seconds_total`
- **RAM** : `container_memory_usage_bytes`
- **Pods** : `kube_pod_status_phase`
- **Redémarrages** : `kube_pod_container_status_restarts_total`
- **Réseau** : `container_network_bytes_total`

### Exporters
Agents qui exposent les métriques d'un système sur `/metrics` :
- **node-exporter** : métriques du serveur (CPU, RAM, disque, réseau)
- **kube-state-metrics** : état des objets Kubernetes

### ServiceMonitor
Objet Kubernetes qui dit à Prometheus quoi surveiller :
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: portfolio-backend
spec:
  selector:
    matchLabels:
      app: backend
  endpoints:
    - port: "5000"
      path: /metrics
      interval: 15s
```

### Alertes
Règles qui déclenchent une notification quand une condition est vraie :
```yaml
alert: PodCrashLooping
expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
for: 5m
annotations:
  summary: "Pod {{ $labels.pod }} redémarre en boucle"
```

### Options de visualisation Grafana
- **Time series** : courbes temporelles (CPU, RAM)
- **Gauge** : jauge (pourcentage utilisation)
- **Stat** : valeur unique en grand
- **Table** : données tabulaires
- **Bar chart** : comparaison entre ressources

### Sources de données (Data sources)
Grafana peut lire depuis : Prometheus, InfluxDB, Elasticsearch, MySQL, etc.

### Tableaux de bord (Dashboards)
Collections de panels organisés. Importables depuis grafana.com/dashboards.

---

## 7.4. Architecture

```
Cluster Minikube
├── Namespace: monitoring
│   ├── Prometheus
│   │   ├── Scrape toutes les 15s →
│   │   │   ├── node-exporter (métriques serveur)
│   │   │   ├── kube-state-metrics (métriques K8s)
│   │   │   └── backend portfolio (via ServiceMonitor)
│   │   └── Stocke dans TSDB (7 jours de rétention)
│   │
│   ├── Grafana
│   │   ├── Lit depuis Prometheus
│   │   ├── Dashboard: Kubernetes cluster (ID: 315)
│   │   ├── Dashboard: Node Exporter (ID: 1860)
│   │   └── Dashboard: Kubernetes pods (ID: 6417)
│   │
│   ├── AlertManager
│   │   └── Route les alertes (email, Slack, PagerDuty...)
│   │
│   ├── node-exporter (DaemonSet — 1 pod par nœud)
│   └── kube-state-metrics
│
└── Namespace: portfolio
    ├── backend (exposera /metrics avec prom-client)
    └── frontend
```

---

## 7.5. Installation

### Méthode utilisée : Helm + kube-prometheus-stack

Helm est le gestionnaire de paquets Kubernetes. Le chart `kube-prometheus-stack` installe tout le stack en une commande.

```bash
# 1. Installer Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 2. Activer metrics-server sur Minikube
minikube addons enable metrics-server

# 3. Ajouter le dépôt Prometheus Community
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 4. Créer le namespace
kubectl create namespace monitoring

# 5. Installer le stack
helm install prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=32000
```

### Résultat de l'installation

```
NAME: prometheus-stack
STATUS: deployed
REVISION: 1
```

### Pods créés

```
alertmanager-prometheus-stack-kube-prom-alertmanager-0   2/2   Running ✅
prometheus-prometheus-stack-kube-prom-prometheus-0       2/2   Running ✅
prometheus-stack-grafana-7dcb9d96dd-mjrkd                3/3   Running ✅
prometheus-stack-kube-prom-operator-c46d698cb-zxqgb      1/1   Running ✅
prometheus-stack-kube-state-metrics-7878f4bf6b-6xxhm     1/1   Running ✅
prometheus-stack-prometheus-node-exporter-7jt8d          1/1   Running ✅
```

---

## 7.6. Démo — Accès aux interfaces

### Accès depuis Windows (via port-forward)
```bash
# Grafana
kubectl port-forward service/prometheus-stack-grafana 3000:80 \
  -n monitoring --address=0.0.0.0 &

# Prometheus
kubectl port-forward service/prometheus-stack-kube-prom-prometheus 9092:9090 \
  -n monitoring --address=0.0.0.0 &
```

- **Grafana** : http://localhost:3000 — login : `admin` / `admin123`
- **Prometheus** : http://localhost:9092

### Dashboards importés dans Grafana
| ID | Nom | Ce qu'on voit |
|---|---|---|
| 315 | Kubernetes cluster monitoring | CPU/RAM du cluster, pods actifs |
| 1860 | Node Exporter Full | CPU, RAM, disque, réseau du serveur |
| 6417 | Kubernetes pods | État de chaque pod en détail |

### Exemples de requêtes PromQL
```promql
# CPU utilisé par les pods du namespace portfolio
rate(container_cpu_usage_seconds_total{namespace="portfolio"}[5m])

# RAM utilisée par le backend
container_memory_usage_bytes{pod=~"backend.*", namespace="portfolio"}

# Nombre de redémarrages des pods
kube_pod_container_status_restarts_total{namespace="portfolio"}

# Pods non Running
kube_pod_status_phase{namespace="portfolio", phase!="Running"}
```

---

## 7.7. Références

- [Documentation Prometheus](https://prometheus.io/docs/)
- [Documentation Grafana](https://grafana.com/docs/)
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
