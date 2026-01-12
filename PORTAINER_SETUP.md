# Portainer Stack Setup Guide

Quick guide for deploying Financial Forecast app in Portainer.

## Two Deployment Options

### Option A: Build from Source (Recommended)
Portainer will build the image from your source code. No registry needed.

### Option B: Use Pre-built Image from Registry
Use an image from Docker Hub, GitHub Container Registry, or your private registry.

---

## Option A: Build from Source

### Step 1: Upload Project to NAS

Upload the entire project directory to your NAS. You can:
- Use Git to clone: `git clone https://github.com/jdubbs4051/finplan.git`
- Or upload via SMB/FTP/SFTP

### Step 2: Create Stack in Portainer

1. **Open Portainer** → Go to **Stacks**
2. Click **Add stack**
3. Name: `financial-forecast`
4. **Copy and paste** the contents of `docker-compose.portainer.yml`
5. **Important**: Make sure the stack is created in the directory where you uploaded the project (or use the "Repository URL" option if using Git)

### Step 3: Update Volume Path

**IMPORTANT**: Before deploying, update the volume path in the compose file:

```yaml
volumes:
  - /path/to/your/nas/storage/financial-forecast/data:/app/server/data
```

---

## Option B: Use Registry Image

### Step 1: Build and Push Image

On your development machine or CI/CD:

```bash
# Build the image
docker build -t your-registry/financial-forecast:latest .

# Push to registry
docker push your-registry/financial-forecast:latest
```

**Registry Examples:**
- **Docker Hub**: `docker build -t username/financial-forecast:latest .`
- **GitHub Container Registry**: `docker build -t ghcr.io/username/financial-forecast:latest .`
- **Private Registry**: `docker build -t registry.example.com/financial-forecast:latest .`

### Step 2: Create Stack in Portainer

1. **Open Portainer** → Go to **Stacks**
2. Click **Add stack**
3. Name: `financial-forecast`
4. **Copy and paste** the contents of `docker-compose.portainer.registry.yml`
5. **Update the image name** in the compose file to match your registry path

### Step 3: Update Volume Path

Same as Option A - update the volume path before deploying.

### Step 4: Update Volume Path (Both Options)

**IMPORTANT**: Before deploying, update the volume path in the compose file:

```yaml
volumes:
  - /path/to/your/nas/storage/financial-forecast/data:/app/server/data
```

**Common NAS paths:**
- **Synology**: `/volume1/docker/financial-forecast/data`
- **QNAP**: `/share/Container/financial-forecast/data`
- **Generic Linux**: `/mnt/storage/financial-forecast/data` or `/opt/docker/financial-forecast/data`

**Create the directory first:**
```bash
mkdir -p /your/path/financial-forecast/data
chmod 755 /your/path/financial-forecast/data
```

### Step 5: Deploy

1. Click **Deploy the stack**
2. Wait for the container to start (check logs if needed)
3. Access at `http://your-nas-ip:3001`

### Step 6: Verify

Check health endpoint:
```bash
curl http://your-nas-ip:3001/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

## Troubleshooting

### Container won't start
- Check logs: **Containers** → `financial-forecast` → **Logs**
- Verify volume path exists and has correct permissions
- Check if port 3001 is available

### Can't access the app
- Verify port mapping: `3001:3001`
- Check firewall rules
- Try accessing via NAS IP: `http://192.168.x.x:3001`

### Data not persisting
- Verify volume mount path is correct
- Check file permissions on data directory
- Look for `accounts.json` and `profile.json` in mounted directory

## Updating

### Option A (Build from Source):
1. **Pull latest code** (if using Git):
   ```bash
   git pull
   ```

2. **In Portainer**: 
   - Go to **Stacks** → `financial-forecast`
   - Click **Editor**
   - Click **Update the stack** (Portainer will rebuild automatically)

### Option B (Registry):
1. **Rebuild and push**:
   ```bash
   docker build -t your-registry/financial-forecast:latest .
   docker push your-registry/financial-forecast:latest
   ```

2. **In Portainer**: 
   - Go to **Stacks** → `financial-forecast`
   - Click **Editor**
   - Click **Update the stack**

Or use watchtower (if configured) - it will auto-update when you push a new image.

## Backup

Backup your data directory:
```bash
tar -czf financial-forecast-backup-$(date +%Y%m%d).tar.gz /your/path/financial-forecast/data
```

Restore:
```bash
tar -xzf financial-forecast-backup-YYYYMMDD.tar.gz -C /
```
