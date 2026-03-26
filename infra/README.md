# Infrastructure As Code (Terraform)

This directory contains the **Terraform** blueprint to deploy the Facetime stack to AWS. It is 100% automated and capable of provisioning the VPC, firewall rules, active EC2 server, and DNS routing with a single command.

## Architecture Overview

The infrastructure relies on the following key components:

1. **AWS EC2 (Graviton ARM64)**: We utilize a cost-effective `t4g.small` ARM-based Linux instance to maximize compute performance for the C++ Mediasoup engine.
2. **AWS Systems Manager (SSM)**: Configured via an IAM Instance Profile, allowing secure, passwordless SSH execution from GitHub Actions directly to the EC2 instance.
3. **Cloudflare Flexible SSL**: We use Cloudflare to terminate HTTPS traffic on Port 443, securely proxying frontend REST and WebSocket traffic seamlessly to the EC2 container on Port 80 without managing SSL certificates on the instance.

## Deployment Setup

### 1. Requirements

- [Terraform](https://www.terraform.io/downloads.html) installed locally
- AWS CLI installed and authenticated
- Cloudflare API Token (for DNS record automation)

### 2. Configuration (`terraform.tfvars`)

Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

Update `terraform.tfvars` with your respective credentials:
- `cloudflare_api_token`
- `cloudflare_zone_id`
- `subdomain` (e.g. `app`)
- `aws_region`

### 3. Provisioning

Run the Terraform initialization to fetch AWS plugins:
```bash
terraform init
```

Preview the infrastructure modifications:
```bash
terraform plan
```

Deploy the infrastructure to the cloud!
```bash
terraform apply
```

*(Upon completion, Terraform will output the Elastic IP and ssh access commands. The EC2 `user_data` script will automatically install Docker, register system daemon services, and pull the latest DockerHub images.)*