# main.tf
# Ce fichier décrit TOUTE l'infrastructure qu'on veut créer
# Terraform va lire ce fichier et créer exactement ce qui est décrit

# ============================================================
# TERRAFORM BLOCK
# Déclare la version de Terraform et les providers nécessaires
# Un provider = un plugin qui permet à Terraform de parler
# à une plateforme (Kubernetes, AWS, Azure, etc.)
# ============================================================
terraform {
  required_version = ">= 1.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
      # ~> 2.0 signifie : version 2.x (2.0, 2.1, 2.2... mais pas 3.0)
    }
  }
}

# ============================================================
# PROVIDER CONFIGURATION
# On dit à Terraform comment se connecter à notre cluster K8s
# Il utilise le même kubeconfig que kubectl
# ============================================================
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
  # config_context : si tu as plusieurs clusters, on précise lequel utiliser
}

# ============================================================
# RESOURCE 1 : NAMESPACE
# Equivalent de : kubectl create namespace portfolio-tf
# Un namespace isole les ressources d'un projet
# ============================================================
resource "kubernetes_namespace" "portfolio" {
  metadata {
    name = var.namespace
    # var.namespace = la variable définie dans variables.tf (valeur: "portfolio-tf")

    labels = {
      app         = "portfolio"
      managed_by  = "terraform"
      # On ajoute un label pour savoir que c'est Terraform qui gère ça
    }
  }
}

# ============================================================
# RESOURCE 2 : SECRET
# Stocke la MONGO_URI de façon sécurisée dans Kubernetes
# Equivalent de : kubectl create secret generic...
# ============================================================
resource "kubernetes_secret" "mongo_uri" {
  metadata {
    name      = "portfolio-secret"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
    # On référence le namespace créé juste au-dessus
    # Terraform comprend automatiquement qu'il doit créer le namespace D'ABORD
  }

  data = {
    MONGO_URI = var.mongo_uri
    # var.mongo_uri vient du fichier terraform.tfvars (jamais committé)
  }

  type = "Opaque"
}

# ============================================================
# RESOURCE 3 : DEPLOYMENT BACKEND
# Equivalent de : kubectl apply -f k8s/backend-deployment.yaml
# Un Deployment gère le cycle de vie des pods
# ============================================================
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
    labels = {
      app = "backend"
    }
  }

  spec {
    replicas = var.backend_replicas
    # var.backend_replicas = 1 par défaut, mais on peut faire "2" facilement

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name              = "backend"
          image             = var.backend_image
          image_pull_policy = "Always"

          port {
            container_port = 5000
          }

          # Variables d'environnement injectées dans le conteneur
          env {
            name  = "PORT"
            value = "5000"
          }

          # MONGO_URI vient du Secret Kubernetes (pas en clair ici)
          env {
            name = "MONGO_URI"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.mongo_uri.metadata[0].name
                key  = "MONGO_URI"
              }
            }
          }

          # readinessProbe : Kubernetes attend que le backend réponde
          # avant d'envoyer du trafic vers lui
          readiness_probe {
            http_get {
              path = "/"
              port = 5000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }

          # livenessProbe : si le backend ne répond plus, Kubernetes le redémarre
          liveness_probe {
            http_get {
              path = "/"
              port = 5000
            }
            initial_delay_seconds = 20
            period_seconds        = 10
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
              # 100m = 0.1 CPU (millicores)
            }
            limits = {
              memory = "256Mi"
              cpu    = "300m"
            }
          }
        }
      }
    }
  }
}

# ============================================================
# RESOURCE 4 : SERVICE BACKEND (ClusterIP)
# Expose le backend UNIQUEMENT à l'intérieur du cluster
# Le frontend appellera "backend:5000" grâce au DNS Kubernetes
# ============================================================
resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
      # Ce service route le trafic vers les pods qui ont ce label
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
    # ClusterIP = accessible uniquement en interne au cluster
  }
}

# ============================================================
# RESOURCE 5 : DEPLOYMENT FRONTEND
# ============================================================
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = var.frontend_replicas

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name              = "frontend"
          image             = var.frontend_image
          image_pull_policy = "Always"

          port {
            container_port = 80
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }

          resources {
            requests = {
              memory = "64Mi"
              cpu    = "50m"
            }
            limits = {
              memory = "128Mi"
              cpu    = "150m"
            }
          }
        }
      }
    }
  }
}

# ============================================================
# RESOURCE 6 : SERVICE FRONTEND (NodePort)
# Expose le frontend à l'extérieur du cluster
# NodePort = un port fixe sur le nœud Minikube
# ============================================================
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30081
      # 30081 (pas 30080 qui est déjà pris par le namespace "portfolio")
    }

    type = "NodePort"
  }
}
