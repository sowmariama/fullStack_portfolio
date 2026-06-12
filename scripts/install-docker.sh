#!/bin/bash
# Script d'installation Docker sur Ubuntu 24.04
# Usage: bash scripts/install-docker.sh

set -e

echo "=== Mise a jour du systeme ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installation des prerequis ==="
sudo apt install -y ca-certificates curl gnupg lsb-release

echo "=== Ajout de la cle GPG Docker ==="
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "=== Ajout du depot Docker ==="
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=== Installation de Docker ==="
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "=== Ajout de l'utilisateur au groupe docker ==="
sudo usermod -aG docker $USER

echo "=== Verification ==="
docker --version
docker compose version

echo ""
echo "INSTALLATION TERMINEE."
echo "IMPORTANT: deconnecte-toi et reconnecte-toi (ou redemarre)"
echo "pour que le groupe docker soit applique."
