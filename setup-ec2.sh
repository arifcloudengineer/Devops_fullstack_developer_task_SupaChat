#!/bin/bash
# Run this ONCE on a fresh Ubuntu 22.04 EC2 instance
# Usage: bash setup-ec2.sh

set -e
echo "=== SupaChat EC2 Setup ==="

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Install docker-compose standalone
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install git
sudo apt-get install -y git curl

# Clone repo (replace with your repo URL)
cd ~
git clone https://github.com/YOUR_USERNAME/supachat.git
cd supachat

# Create .env from example
cp .env.example .env
echo ""
echo "=== IMPORTANT: Edit .env with your real values ==="
echo "nano .env"
echo ""
echo "Then run: docker-compose up -d"
echo ""
echo "=== EC2 Setup Complete ==="
