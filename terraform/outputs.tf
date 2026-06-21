# outputs.tf
# Ce fichier définit ce que Terraform affiche après un "terraform apply"
# Utile pour récupérer des informations sur ce qui a été créé

output "namespace" {
  description = "Namespace Kubernetes créé par Terraform"
  value       = kubernetes_namespace.portfolio.metadata[0].name
}

output "backend_service" {
  description = "Nom du service backend"
  value       = kubernetes_service.backend.metadata[0].name
}

output "frontend_service" {
  description = "Nom du service frontend"
  value       = kubernetes_service.frontend.metadata[0].name
}

output "frontend_nodeport" {
  description = "Port externe du frontend (NodePort)"
  value       = kubernetes_service.frontend.spec[0].port[0].node_port
}

output "acces_frontend" {
  description = "Commande pour accéder au frontend"
  value       = "kubectl port-forward service/frontend 9091:80 -n ${kubernetes_namespace.portfolio.metadata[0].name} --address=0.0.0.0"
}
