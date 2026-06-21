# Journal DevOps — Mairam Baidy Sow
**Formation AWS re/Start — Orange Digital Center Dakar**  
**Projet fil rouge : Portfolio Full-Stack (React + Express + MongoDB Atlas)**  
**Repo : https://github.com/sowmariama/fullStack_portfolio**

---

> Ce document retrace chronologiquement tout ce qui a été fait sur le projet. Il sert à la fois de journal de bord, de support de révision et de base pour les livrables finaux.

---

## Environnement de travail

| Élément | Valeur |
|---|---|
| OS | Windows 11 + WSL2 |
| Distribution Linux | Ubuntu 24.04 |
| Shell | bash (WSL) |
| Éditeur | VS Code / Kiro |
| Docker | Docker Engine (installé dans WSL) |
| Git | Configuré avec sowmariama / sowmariame932@gmail.com |

---

## MODULE 1 — Docker ✅

### Ce qui a été fait

**Installation**
- Docker Engine installé sur WSL2/Ubuntu 24.04
- Utilisateur ajouté au groupe docker (`usermod -aG docker $USER`)

**Dockerfile Backend** (`portfolio/04-express-mongodb/Dockerfile`)
- Image de base : `node:20-alpine`
- Copie `package*.json` en premier pour optimiser le cache Docker
- `npm install --prefer-offline` pour éviter les erreurs réseau
- Démarrage avec `node app.js` sur le port 5000

**Dockerfile Frontend** (`portfolio/03-react/Dockerfile`)
- Multi-stage build :
  - Étape 1 `builder` : Node.js compile le code React → dossier `dist/`
  - Étape 2 : Nginx sert les fichiers statiques
- Image finale ~25Mo (au lieu de ~500Mo sans multi-stage)
- `nginx.conf` avec `try_files` pour le routing React (SPA)

**Docker Compose** (`docker-compose.yml`)
- Réseau personnalisé `portfolio-network` (bridge, DNS intégré)
- Backend sur port 5000, Frontend sur port 5173 (→ 80 dans le conteneur)
- Variable `MONGO_URI` injectée depuis `.env`
- `depends_on` : le frontend attend le backend

**Docker Hub**
- Images poussées :
  - `sowmariama/portfolio-backend:v1`
  - `sowmariama/portfolio-frontend:v1`

### Commandes clés utilisées

```bash
docker build -t sowmariama/portfolio-backend:v1 ./portfolio/04-express-mongodb
docker build -t sowmariama/portfolio-frontend:v1 ./portfolio/03-react
docker-compose up -d --build
docker-compose ps
docker push sowmariama/portfolio-backend:v1
docker push sowmariama/portfolio-frontend:v1
```

### Difficultés rencontrées

| Problème | Solution |
|---|---|
| Permission denied sur docker.sock | `sudo usermod -aG docker $USER && newgrp docker` |
| Image frontend trop lourde | Multi-stage build → image finale Nginx uniquement |
| Frontend ne trouve pas l'API | Réseau docker-compose personnalisé + DNS par nom de service |

---

## MODULE 2 — Jenkins ✅

### Ce qui a été fait

**Installation**
- Jenkins lancé dans un conteneur Docker sur le port 8080
- Technique Docker-outside-of-Docker (DooD) : montage du socket `/var/run/docker.sock`
- Jenkins tourne en `--user root` pour accéder au démon Docker

```bash
docker run -d \
  --name jenkins \
  --user root \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  jenkins/jenkins:lts
```

**Pipeline déclaratif** (`Jenkinsfile` à la racine)

Étapes du pipeline :
1. `Clone` — récupération du code GitHub
2. `SonarQube Backend` — analyse qualité du backend Node.js
3. `Wait for Quality Gate Backend` — bloque si le code ne passe pas
4. `SonarQube Frontend` — analyse qualité du frontend React
5. `Wait for Quality Gate Frontend`
6. `Build Backend` — `docker build` avec limite mémoire 1g
7. `Build Frontend` — `docker build` multi-stage
8. `Push to Docker Hub` — avec `retry(3)` pour la robustesse réseau
9. `Deploy` — `docker-compose down && up`

**Post-pipeline :**
- Email de succès / échec vers `mairosow91@gmail.com`
- `docker system prune -f` systématique pour libérer l'espace

**Credentials Jenkins**
- `docker-hub-credentials` (Username/Password) → Docker Hub
- `sonarqube-token` (Secret text) → SonarQube

**Webhook GitHub + ngrok**
- ngrok crée un tunnel public vers `localhost:8080`
- Webhook GitHub pointe vers `https://xxx.ngrok.io/github-webhook/`
- Chaque `git push` déclenche automatiquement le pipeline

**Notifications email**
- SMTP Gmail configuré (mot de passe d'application Google)
- Email envoyé sur succès et sur échec

### Difficultés rencontrées

| Problème | Solution |
|---|---|
| docker-compose non trouvé dans Jenkins | Vérifier que `docker compose` (v2) est disponible |
| Credentials non trouvés | Vérifier l'ID exact dans Manage Jenkins → Credentials |
| Webhook ne se déclenche pas | ngrok pour exposer Jenkins sur internet |
| OOM killed pendant le build frontend | `--memory="1g" --memory-swap="2g"` dans docker build |

---

## MODULE 3 — SonarQube ✅

### État actuel
- SonarQube `community` tourne sur le port 9000
- 2 projets analysés et **passés** : `portfolio-backend` et `portfolio-frontend`
- Connexion Jenkins ↔ SonarQube déjà configurée (credential `sonarqube-token`)

### Problème identifié et corrigé
Les builds Jenkins #5 et #7 échouaient sur le `waitForQualityGate` malgré un Quality Gate "Passé" dans SonarQube. Cause : message "branche principale vide" dans SonarQube Community Edition.

**Corrections apportées au Jenkinsfile :**
- `-Dsonar.login` remplacé par `-Dsonar.token` (paramètre déprécié dans les nouvelles versions)
- Ajout `-Dsonar.scm.disabled=true` — désactive la détection de branche SCM (non supportée en Community)
- Ajout `-Dsonar.qualitygate.wait=true` — le scanner attend lui-même le résultat du Quality Gate
- Suppression des stages `Wait for Quality Gate` séparés (devenus redondants)

### Architecture SonarQube dans le pipeline

```
Jenkins stage SonarQube Backend
    └── docker run sonarsource/sonar-scanner-cli
            ├── Analyse le code Node.js (portfolio/04-express-mongodb)
            ├── Envoie les résultats à SonarQube (localhost:9000)
            ├── Attend le Quality Gate (sonar.qualitygate.wait=true)
            └── Si KO → pipeline bloqué / Si OK → étape suivante

Jenkins stage SonarQube Frontend
    └── docker run sonarsource/sonar-scanner-cli
            ├── Analyse le code React (portfolio/03-react)
            └── Même logique Quality Gate
```

### Commit correspondant
```
fix(jenkins): correction Quality Gate SonarQube Community Edition
```

---

## MODULE 6 — Prometheus/Grafana ✅

### Installation via Helm

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=32000
```

### Composants installés (namespace monitoring)

| Pod | Rôle | Status |
|---|---|---|
| prometheus-stack-grafana | Interface visuelle | Running ✅ |
| prometheus-prometheus-stack | Collecte métriques | Running ✅ |
| alertmanager-prometheus-stack | Gestion alertes | Running ✅ |
| kube-state-metrics | Métriques K8s | Running ✅ |
| node-exporter | Métriques serveur | Running ✅ |
| prometheus-operator | Gère Prometheus | Running ✅ |

### Accès
- Grafana : `kubectl port-forward service/prometheus-stack-grafana 3000:80 -n monitoring --address=0.0.0.0 &`
- Prometheus : `kubectl port-forward service/prometheus-stack-kube-prom-prometheus 9092:9090 -n monitoring --address=0.0.0.0 &`

### Dashboards importés
- ID 315 : Kubernetes cluster monitoring
- ID 1860 : Node Exporter Full
- ID 6417 : Kubernetes pods

### Fichiers créés
- `monitoring/values.yaml` — configuration Helm versionnée
- `monitoring/servicemonitor-backend.yaml` — surveillance du backend portfolio
- `monitoring/README.md` — guide d'installation

### Installation
- Terraform v1.15.6 installé sur WSL2/Ubuntu 24.04
- Provider Kubernetes v2.38.0 téléchargé via `terraform init`

### Fichiers créés (dossier terraform/)

| Fichier | Rôle |
|---|---|
| `main.tf` | 6 ressources Kubernetes décrites en HCL |
| `variables.tf` | Variables paramétrables (namespace, images, replicas, mongo_uri) |
| `outputs.tf` | Affiche namespace, services et commande d'accès après apply |
| `terraform.tfvars.example` | Template sans secrets (committer) |
| `terraform.tfvars` | Valeurs réelles (dans .gitignore) |

### Workflow exécuté

```bash
terraform init    # Provider Kubernetes v2.38.0 téléchargé
terraform plan    # Plan: 6 to add, 0 to change, 0 to destroy
terraform apply   # Apply complete! Resources: 6 added
```

### Résultat
- Namespace `portfolio-tf` créé ✅
- Secret MONGO_URI créé (valeur masquée dans les logs) ✅
- Backend Running dans `portfolio-tf` ✅
- Frontend Running dans `portfolio-tf` ✅
- Accessible sur `http://localhost:9091` ✅

### Différence avec kubectl
Terraform gère le **state** : il sait ce qu'il a créé et peut le modifier ou le supprimer proprement avec `terraform destroy`. kubectl lui ne garde aucune mémoire.

### Installation

```bash
# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Démarrage cluster (driver Docker)
minikube start --driver=docker
```

### Versions installées
- Minikube : v1.38.1
- kubectl : v1.36.2
- Kubernetes : v1.35.1
- Node : minikube (Ready, control-plane)
- Ressources allouées : 2 CPUs, 3900MB RAM

### Manifests créés (dossier k8s/)

| Fichier | Rôle |
|---|---|
| `namespace.yaml` | Namespace `portfolio` pour isoler les ressources |
| `secret.yaml` | Template secret (ne pas committer avec vraie URI) |
| `backend-deployment.yaml` | Déploiement du backend (1 replica, probes, limites) |
| `backend-service.yaml` | Service ClusterIP — expose le backend en interne |
| `frontend-deployment.yaml` | Déploiement du frontend (1 replica, probes, limites) |
| `frontend-service.yaml` | Service NodePort 30080 — expose le frontend à l'extérieur |
| `coredns-patch.yaml` | Patch CoreDNS avec Google DNS (8.8.8.8) |
| `deploy-all.sh` | Script de déploiement complet automatisé |

### Problème rencontré et résolu — DNS Minikube

**Symptôme :** Backend en `CrashLoopBackOff` avec l'erreur :
```
Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database
from an IP that isn't whitelisted.
```

**Vraie cause :** Le DNS interne de Minikube ne résolvait pas les noms externes (`cluster0.yehwmm0.mongodb.net`). Les pods ne pouvaient pas joindre MongoDB Atlas.

**Preuve :**
```bash
kubectl run dns-test --image=busybox -- sh -c "nslookup cluster0.yehwmm0.mongodb.net"
# → wget: bad address 'ifconfig.me'  (aucune résolution DNS externe)
```

**Solution :** Patch CoreDNS pour utiliser Google DNS (8.8.8.8) comme forwarder :
```bash
kubectl patch configmap coredns -n kube-system --patch '
data:
  Corefile: |
    .:53 {
        forward . 8.8.8.8 8.8.4.4
        ...
    }
'
kubectl rollout restart deployment/coredns -n kube-system
```

**Résultat après correction :**
```
Connecté à MongoDB ✅
```

### Secret MONGO_URI — bonne pratique

Le fichier `k8s/secret.yaml` est dans `.gitignore`. Pour créer le secret :
```bash
kubectl create secret generic portfolio-secret -n portfolio \
  --from-literal=MONGO_URI="mongodb+srv://user:pass@cluster0.xxx.mongodb.net/portfolio?appName=Cluster0"
```

### État final du cluster

```
NAME                            READY   STATUS    RESTARTS
pod/backend-xxx                 1/1     Running   ✅
pod/frontend-xxx                1/1     Running   ✅

NAME               TYPE        CLUSTER-IP       PORT(S)
service/backend    ClusterIP   10.104.15.100    5000/TCP
service/frontend   NodePort    10.96.161.248    80:30080/TCP

NAME                       READY   UP-TO-DATE   AVAILABLE
deployment.apps/backend    1/1     1            1         ✅
deployment.apps/frontend   1/1     1            1         ✅
```

### Intégration Jenkins → Kubernetes

**Problème :** Jenkins (conteneur Docker) ne pouvait pas joindre l'API Kubernetes de Minikube.

**Diagnostic :**
- Jenkins sur réseau Docker `bridge` (par défaut)
- Minikube sur réseau Docker `minikube` (isolé)
- Port forwarding WSL (`127.0.0.1:32776`) non accessible depuis un conteneur

**Solution en 4 étapes :**

```bash
# 1. Installer kubectl dans Jenkins
docker exec -it jenkins bash -c "
  curl -LO 'https://dl.k8s.io/release/v1.36.2/bin/linux/amd64/kubectl'
  chmod +x kubectl && mv kubectl /usr/local/bin/
"

# 2. Connecter Jenkins au réseau Minikube
docker network connect minikube jenkins

# 3. Trouver le vrai port de l'API (8443, pas le port WSL 32776)
docker exec minikube ss -tlnp | grep apiserver
# → LISTEN *:8443

# 4. Générer kubeconfig avec IP réelle de Minikube
kubectl config view --minify --flatten | \
  sed 's|https://127.0.0.1:32776|https://192.168.49.2:8443|g' \
  > /tmp/kubeconfig-jenkins
docker cp /tmp/kubeconfig-jenkins jenkins:/root/.kube/config
```

**Vérification :**
```bash
docker exec jenkins kubectl get nodes
# → minikube   Ready   control-plane ✅
```

**Jenkinsfile — stage Deploy mis à jour :**
```groovy
stage('Deploy') {
    steps {
        sh '''
            kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${VERSION} -n portfolio
            kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${VERSION} -n portfolio
            kubectl rollout status deployment/backend -n portfolio
            kubectl rollout status deployment/frontend -n portfolio
            kubectl get pods -n portfolio
        '''
    }
}
```

### Accès permanent au frontend (sans socat)

```bash
# Port-forward stable sur port 9090
kubectl port-forward service/frontend 9090:80 -n portfolio --address=0.0.0.0 &
```
Accès depuis Windows : `http://localhost:9090`

### Architecture Kubernetes

```
                    ┌─────────────────────────────────┐
                    │     Namespace: portfolio         │
                    │                                  │
  NodePort:30080    │  ┌──────────┐    ┌───────────┐  │
  ──────────────────┼─▶│ frontend │───▶│  backend  │  │
                    │  │  Service │    │  Service  │  │
                    │  │(NodePort)│    │(ClusterIP)│  │
                    │  └────┬─────┘    └─────┬─────┘  │
                    │       │                │         │
                    │  ┌────▼─────┐    ┌─────▼─────┐  │
                    │  │ frontend │    │  backend  │  │
                    │  │   Pod    │    │    Pod    │  │
                    │  └──────────┘    └─────┬─────┘  │
                    │                        │         │
                    └────────────────────────┼─────────┘
                                             │
                                    MongoDB Atlas (cloud)
```

### Concepts utilisés
- **Namespace** : isolation des ressources du projet
- **Secret** : stockage sécurisé de MONGO_URI
- **Deployment** : gestion des pods avec rolling update
- **Service ClusterIP** : communication interne (backend)
- **Service NodePort** : exposition externe (frontend)
- **readinessProbe** : vérifie que le pod est prêt avant de router du trafic
- **livenessProbe** : redémarre le pod s'il ne répond plus
- **resources.limits** : plafond CPU/mémoire par conteneur

---

## Améliorations Frontend — Juin 2026 ✅

### Ce qui a été corrigé

| Fichier | Changement |
|---|---|
| `App.css` | Suppression du CSS mort du template Vite (~100 lignes inutiles) |
| `Hero.jsx` | Focus Cloud/AWS/DevOps, retrait mention crypto/blockchain |
| `Contact.jsx` | Formulaire fonctionnel via `mailto:`, validation des champs, suppression émoji, ajout email direct |
| `DetailProjet.jsx` | `console.error` limité au mode DEV, lint warning justifié |
| `ListeProjets.jsx` | `console.error` limité au mode DEV, hover image adouci (scale-105) |
| `AjouterProjet.jsx` | Message d'erreur utilisateur amélioré, `console.error` en DEV uniquement |
| `package.json` | `json-server` déplacé de `dependencies` vers `devDependencies` |
| `README.md` | README complet rédigé (stack, installation, structure, pipeline) |

### Commit correspondant
```
refactor(frontend): amélioration qualité code et Hero section
```

---

## État des services (dernière vérification)

```
portfolio-frontend   Up   0.0.0.0:5173->80/tcp
portfolio-backend    Up   0.0.0.0:5000->5000/tcp
jenkins              Up   0.0.0.0:8080->8080/tcp
sonarqube            Up   0.0.0.0:9000->9000/tcp  ✅
```

**SonarQube projets :**
- `portfolio-backend` (Interface d'administration) → Quality Gate : Passé ✅
- `portfolio-frontend` (Interface utilisateur) → Quality Gate : Passé ✅

---

*Dernière mise à jour : Juin 2026*
