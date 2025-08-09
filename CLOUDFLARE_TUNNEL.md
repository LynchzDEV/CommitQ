# CommitQ Cloudflare Tunnel Deployment Guide

This guide explains how to deploy CommitQ using Cloudflare Tunnel for secure external access without exposing ports directly to the internet.

## Overview

Cloudflare Tunnel creates an encrypted connection from your server to Cloudflare's edge network, allowing secure access to your application without opening firewall ports or exposing your server's IP address.

## Benefits of Cloudflare Tunnel

- **Security**: No exposed ports (80/443) on your server
- **DDoS Protection**: Cloudflare's edge network protects against attacks  
- **SSL/TLS**: Automatic SSL certificate management
- **Performance**: Global CDN with edge caching
- **Real IP Preservation**: Client IPs are properly forwarded
- **WebSocket Support**: Full support for Socket.IO connections

## Prerequisites

1. Domain registered with Cloudflare as your DNS provider
2. Cloudflare account with tunnel access
3. Docker and Docker Compose installed
4. CommitQ application ready for deployment

## Setup Instructions

### Step 1: Create Cloudflare Tunnel

1. Install cloudflared on your local machine:
```bash
# macOS
brew install cloudflared

# Linux (Ubuntu/Debian)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. Authenticate with Cloudflare:
```bash
cloudflared tunnel login
```

3. Create a new tunnel:
```bash
cloudflared tunnel create commitq
```

4. Copy the tunnel ID from the output and note the credentials file location.

### Step 2: Configure DNS

Add a CNAME record in Cloudflare DNS dashboard:
- **Type**: CNAME
- **Name**: your-subdomain (e.g., commitq)
- **Target**: your-tunnel-id.cfargotunnel.com
- **Proxy status**: Proxied (orange cloud)

### Step 3: Get Tunnel Token

1. In Cloudflare dashboard, go to Zero Trust > Access > Tunnels
2. Find your tunnel and click "Configure"
3. Add a public hostname:
   - **Subdomain**: your-subdomain
   - **Domain**: your-domain.com
   - **Service**: HTTP, localhost:80
4. Copy the tunnel token from the installation command

### Step 4: Deploy with Docker Compose

1. Create a `.env` file in your project directory:
```bash
# Copy your tunnel token here
CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token-here
```

2. Deploy using the Cloudflare-optimized configuration:
```bash
# Deploy with Cloudflare Tunnel
docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d

# Or with production settings
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudflare.yml up -d
```

3. Verify the deployment:
```bash
# Check all services are running
docker compose ps

# Check tunnel connection
docker compose logs cloudflared

# Test health endpoint
curl http://localhost/health
```

## Configuration Files

### docker-compose.cloudflare.yml
This override file:
- Removes exposed ports from nginx (not needed with tunnel)
- Adds the cloudflared service
- Uses Cloudflare-optimized nginx configuration

### nginx.cloudflare.conf
This nginx configuration:
- Configures Cloudflare IP ranges for real IP restoration
- Uses CF-Connecting-IP header for client IPs
- Adds Cloudflare-specific headers to upstream requests
- Optimizes logging for Cloudflare environment

## Network Flow

```
Internet → Cloudflare Edge → Tunnel → nginx:80 → commitq:3000
```

1. **Client** makes request to your-domain.com
2. **Cloudflare Edge** receives request, applies security rules
3. **Tunnel** forwards request through encrypted connection
4. **nginx** receives request on port 80 (internal)
5. **CommitQ App** processes request on port 3000 (internal)

## Monitoring and Troubleshooting

### Check Tunnel Status
```bash
# View tunnel logs
docker compose logs -f cloudflared

# Check tunnel health
cloudflared tunnel info commitq
```

### Common Issues

1. **Tunnel not connecting**:
   - Verify tunnel token is correct
   - Check network connectivity
   - Review cloudflared logs

2. **WebSocket connections failing**:
   - Ensure Cloudflare proxy is enabled (orange cloud)
   - Verify nginx WebSocket configuration
   - Check for firewall blocking websockets

3. **Real IP not preserved**:
   - Update Cloudflare IP ranges in nginx.cloudflare.conf
   - Verify CF-Connecting-IP header is being used

### Health Checks

The setup includes comprehensive health checks:
- Docker health checks for all services
- nginx health endpoint at `/health`
- Application health endpoint at `/api/health`

## Security Considerations

1. **Firewall**: With Cloudflare Tunnel, you can block all inbound traffic on ports 80/443
2. **SSL/TLS**: Cloudflare handles SSL termination with automatic certificate renewal
3. **Rate Limiting**: Both Cloudflare and nginx provide rate limiting
4. **Real IP**: Client IPs are properly preserved for accurate rate limiting

## Alternative: Token-less Configuration

If you prefer file-based configuration instead of tokens:

1. Create a config file:
```bash
cp cloudflared-config.yml /etc/cloudflared/config.yml
```

2. Modify docker-compose.cloudflare.yml:
```yaml
cloudflared:
  image: cloudflare/cloudflared:latest
  command: tunnel --no-autoupdate run
  volumes:
    - /etc/cloudflared:/etc/cloudflared:ro
```

## Performance Optimization

### Cloudflare Settings
- Enable "Auto Minify" for CSS, HTML, JS
- Configure "Browser Cache TTL" appropriately
- Enable "Always Use HTTPS"
- Configure "Security Level" based on your needs

### nginx Caching
The current nginx configuration includes basic caching. For better performance with Cloudflare:
- Let Cloudflare handle most static content caching
- Use nginx for application-specific caching logic
- Configure appropriate Cache-Control headers

## Backup Access

In case of Cloudflare issues, you can temporarily expose ports:

```bash
# Emergency: expose ports directly
docker compose -f docker-compose.yml up -d

# Remember to configure your firewall appropriately
```

## Cost Considerations

- Cloudflare Tunnel is free for most use cases
- Bandwidth costs may apply for high-traffic applications
- Consider Cloudflare's pricing tiers for additional features

## Support and Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [nginx Real IP Module](https://nginx.org/en/docs/http/ngx_http_realip_module.html)
- [Docker Compose Override Files](https://docs.docker.com/compose/multiple-compose-files/)