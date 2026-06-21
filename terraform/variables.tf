# variables.tf
# Ce fichier déclare toutes les variables utilisées dans main.tf
# Une variable = une valeur paramétrable qu'on peut changer sans toucher au code principal

variable "namespace" {
  description = "Namespace Kubernetes où déployer l'application"
  type        = string
  default     = "portfolio-tf"
  # On utilise "portfolio-tf" pour ne pas écraser le namespace "portfolio" existant
}

variable "backend_image" {
  description = "Image Docker du backend"
  type        = string
  default     = "sowmariama/portfolio-backend:v1"
}

variable "frontend_image" {
  description = "Image Docker du frontend"
  type        = string
  default     = "sowmariama/portfolio-frontend:v1"
}

variable "backend_replicas" {
  description = "Nombre de pods backend"
  type        = number
  default     = 1
}

variable "frontend_replicas" {
  description = "Nombre de pods frontend"
  type        = number
  default     = 1
}

variable "mongo_uri" {
  description = "URI de connexion MongoDB Atlas"
  type        = string
  sensitive   = true
  # sensitive = true : Terraform masque cette valeur dans les logs
}
