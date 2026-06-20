#!/bin/bash
# deploy-all.sh — Déploiement complet du portfolio sur Minikube
# Usage: bash k8s/deploy-all.sh

set -e

echo "==> Démarrage Minikube..."
minikube start --driver=docker

echo "==> Correction DNS CoreDNS (Google DNS 8.8.8.8)..."
kubectl apply -f k8s/coredns-patch.yaml
kubectl rollout restart deployment/coredns -n kube-system
kubectl rollout status deployment/coredns -n kube-system

echo "==> Création du namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "⚠️  IMPORTANT : crée le secret MONGO_URI avant de continuer :"
echo "   kubectl create secret generic portfolio-secret -n portfolio \\"
echo "     --from-literal=MONGO_URI=\"mongodb+srv://USER:PASS@cluster0.xxx.mongodb.net/portfolio?appName=Cluster0\""
echo ""
read -p "Secret créé ? (o/n) : " reponse
if [[ "$reponse" != "o" ]]; then
  echo "Arrêt. Crée le secret puis relance le script."
  exit 1
fi

echo "==> Déploiement Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

echo "==> Déploiement Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

echo "==> Attente démarrage des pods..."
kubectl rollout status deployment/backend -n portfolio
kubectl rollout status deployment/frontend -n portfolio

echo ""
echo "==> État final :"
kubectl get all -n portfolio

echo ""
echo "==> URL du frontend :"
minikube service frontend -n portfolio --url
