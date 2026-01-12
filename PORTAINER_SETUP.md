# Portainer Stack Setup Guide

Quick guide for deploying Financial Forecast app in Portainer.

## Step 1: Build the Docker Image

On your NAS or development machine, build the image:

```bash
docker build -t financial-forecast:latest .
```

Or if you're using a registry:

```bash
docker build -t your-registry/financial-forecast:latest .
docker push your-registry/financial-forecast:latest
```

## Step 2: Create Stack in Portainer

1. **Open Portainer** → Go to **Stacks**
2. Click **Add stack**
3. Name: `financial-forecast`
4. **Copy and paste** the contents of `docker-compose.portainer.yml`

## Step 3: Update Volume Path

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

## Step 4: Deploy

1. Click **Deploy the stack**
2. Wait for the container to start (check logs if needed)
3. Access at `http://your-nas-ip:3001`

## Step 5: Verify

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

To update the application:

1. **Rebuild image**:
   ```bash
   docker build -t financial-forecast:latest .
   ```

2. **In Portainer**: 
   - Go to **Stacks** → `financial-forecast`
   - Click **Editor**
   - Click **Update the stack**

Or use watchtower (if configured) - it will auto-update when you rebuild the image.

## Backup

Backup your data directory:
```bash
tar -czf financial-forecast-backup-$(date +%Y%m%d).tar.gz /your/path/financial-forecast/data
```

Restore:
```bash
tar -xzf financial-forecast-backup-YYYYMMDD.tar.gz -C /
```
