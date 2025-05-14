#!/bin/bash

# Update packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker and Docker Compose if not already installed
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io
  sudo usermod -aG docker $USER
  echo "Docker installed successfully"
fi

if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "Docker Compose installed successfully"
fi

# Pull latest changes (if using git)
# git pull origin main

# Build and start containers
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

echo "Deployment completed successfully!" 