# Monitoring — Prometheus & Grafana

Stack de surveillance du portfolio déployé sur Minikube.

## Prérequis

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
```

## Installation

```bash
helm install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f monitoring/values.yaml
```

## Vérifier l'installation

```bash
kubectl get pods -n monitoring
```

Résultat attendu — tous les pods en Running :
```
alertmanager-prometheus-stack-...   2/2   Running
prometheus-prometheus-stack-...     2/2   Running
prometheus-stack-grafana-...        3/3   Running
prometheus-stack-kube-prom-operator  1/1  Running
prometheus-stack-kube-state-metrics  1/1  Running
prometheus-stack-prometheus-node-exporter  1/1  Running
```

## Accès aux interfaces

```bash
# Grafana (port 3000)
kubectl port-forward service/prometheus-stack-grafana 3000:80 -n monitoring --address=0.0.0.0 &

# Prometheus (port 9092)
kubectl port-forward service/prometheus-stack-kube-prom-prometheus 9092:9090 -n monitoring --address=0.0.0.0 &
```

- Grafana : http://localhost:3000 — admin / admin123
- Prometheus : http://localhost:9092

## Dashboards Grafana recommandés

Importer depuis Dashboards → Import → entrer l'ID :

| ID | Nom | Description |
|---|---|---|
| 315 | Kubernetes cluster monitoring | Vue globale du cluster |
| 1860 | Node Exporter Full | CPU, RAM, disque du serveur |
| 6417 | Kubernetes pods | État détaillé des pods |

## Composants installés

| Composant | Rôle |
|---|---|
| Prometheus | Collecte et stocke les métriques |
| Grafana | Visualisation des métriques |
| AlertManager | Gestion et routage des alertes |
| node-exporter | Métriques CPU/RAM/disque du nœud |
| kube-state-metrics | Métriques des objets Kubernetes |
| Prometheus Operator | Gère Prometheus via des CRDs Kubernetes |
