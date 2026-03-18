output "public_ip" {
  description = "Static Elastic IP address of the server"
  value       = aws_eip.app.public_ip
}

output "domain_url" {
  description = "Public URL via Cloudflare DNS"
  value       = "https://${local.fqdn}"
}

output "fqdn" {
  description = "Fully-qualified domain name pointing to the instance"
  value       = local.fqdn
}

output "app_url_ip" {
  description = "Direct IP fallback URL (useful before DNS propagates)"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ~/.ssh/facetime ubuntu@${aws_eip.app.public_ip}"
}

output "websocket_url" {
  description = "WebSocket signaling URL"
  value       = "ws://${local.fqdn}:4000"
}

output "cloudflare_record_id" {
  description = "Cloudflare DNS record ID (useful for manual inspection)"
  value       = cloudflare_record.app.id
}

