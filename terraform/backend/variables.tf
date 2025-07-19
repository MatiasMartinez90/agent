# Project configuration
variable "project_name" {
  description = "Project name for unique resource naming"
  type        = string
  default     = "template-app"
}

# Variables para Google OAuth (deben ser definidas)
variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

# Variables para URLs de callback
variable "production_callback_url" {
  description = "Production callback URL for OAuth (custom domain)"
  type        = string
  default     = "https://demo.localhost.com"
}

variable "cloudfront_callback_url" {
  description = "CloudFront callback URL for OAuth"
  type        = string
  default     = ""
}

variable "production_logout_url" {
  description = "Production logout URL for OAuth"
  type        = string
  default     = "https://demo.localhost.com"
}

# Variables para PostgreSQL RDS
variable "db_host" {
  description = "PostgreSQL RDS endpoint"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "proyecto_demo"
}

variable "db_user" {
  description = "PostgreSQL database user"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "PostgreSQL database port"
  type        = string
  default     = "5432"
}

variable "from_email" {
  description = "Email address for sending welcome emails"
  type        = string
  default     = "noreply@demo.localhost.com"
}