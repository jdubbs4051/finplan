# Docker Deployment Guide

This guide explains how to deploy the Financial Forecast app using Docker and Docker Compose, particularly for use with Portainer stacks on your NAS.

## Prerequisites

- Docker installed on your NAS
- Portainer installed (optional, for web-based management)
- Basic knowledge of Docker and Docker Compose

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone or copy the project** to your NAS:
   ```bash
   git clone <your-repo-url>
   cd planning
   ```

2. **Create data directory**:
   ```bash
   mkdir -p data
   ```

3. **Build and start the container**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Open your browser and navigate to `http://your-nas-ip:3001`

### Option 2: Using Portainer Stacks

**Two methods available:**

#### Method A: Build from Source (Recommended)
1. **Upload project** to your NAS (via Git clone, SMB, FTP, etc.)
2. **In Portainer**:
   - Go to **Stacks** → **Add stack**
   - Name it `financial-forecast`
   - Paste the contents of `docker-compose.portainer.yml`
   - Make sure the stack is created in the project directory
   - Update the volume path to your NAS storage location
   - Click **Deploy the stack** (Portainer will build automatically)

#### Method B: Use Pre-built Image from Registry
1. **Build and push** the image to a registry:
   ```bash
   docker build -t your-registry/financial-forecast:latest .
   docker push your-registry/financial-forecast:latest
   ```

2. **In Portainer**:
   - Go to **Stacks** → **Add stack**
   - Name it `financial-forecast`
   - Paste the contents of `docker-compose.portainer.registry.yml`
   - Update the `image:` line with your registry path
   - Update the volume path to your NAS storage location
   - Click **Deploy the stack**

See `PORTAINER_SETUP.md` for detailed instructions.

## Configuration

### Environment Variables

You can customize the following environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (default: production)

Example in docker-compose.yml:
```yaml
environment:
  - PORT=3001
  - NODE_ENV=production
```

### Port Mapping

Default port is `3001`. To change it:

```yaml
ports:
  - "8080:3001"  # Access on port 8080 instead
```

### Data Persistence

Data is stored in `./data` directory (relative to docker-compose.yml) or the path specified in the volume mount.

**For Portainer**, update the volume path:
```yaml
volumes:
  - /your/nas/path/financial-forecast/data:/app/server/data
```

## Building the Image

### Build locally:
```bash
docker build -t financial-forecast:latest .
```

### Build with specific tag:
```bash
docker build -t financial-forecast:v1.0.0 .
```

## Updating the Application

1. **Pull latest changes** (if using git):
   ```bash
   git pull
   ```

2. **Rebuild the image**:
   ```bash
   docker-compose build
   ```

3. **Restart the container**:
   ```bash
   docker-compose up -d
   ```

Or in Portainer: **Stacks** → Select stack → **Editor** → Update → **Update the stack**

## Troubleshooting

### Check container logs:
```bash
docker-compose logs -f financial-forecast
```

### Check container status:
```bash
docker-compose ps
```

### Access container shell:
```bash
docker-compose exec financial-forecast sh
```

### Verify data persistence:
```bash
ls -la ./data/
# Should show accounts.json and profile.json
```

### Health Check

The container includes a health check endpoint. Verify it's working:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

## Backup and Restore

### Backup data:
```bash
# Copy data directory
cp -r ./data ./data-backup-$(date +%Y%m%d)
```

### Restore data:
```bash
# Stop container
docker-compose down

# Restore data
cp -r ./data-backup-YYYYMMDD ./data

# Start container
docker-compose up -d
```

## Security Considerations

1. **Firewall**: Only expose port 3001 if needed, or use a reverse proxy
2. **Reverse Proxy**: Consider using Nginx or Traefik in front of the app
3. **HTTPS**: Use a reverse proxy with SSL certificates (Let's Encrypt)
4. **Network**: Use Docker networks to isolate the application

## Reverse Proxy Example (Nginx)

```nginx
server {
    listen 80;
    server_name financial-forecast.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Support

For issues or questions, please check:
- Application logs: `docker-compose logs`
- Container health: Check Portainer dashboard
- Data directory permissions: Ensure Docker has read/write access
