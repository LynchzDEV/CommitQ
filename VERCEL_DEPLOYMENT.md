# Vercel Deployment Guide

This guide explains how to deploy the Real-time Queue Management System to Vercel with full real-time functionality.

## Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `commitq` (or your preferred name)
   - Directory? `./` (current directory)

## Architecture Changes for Vercel

This application has been specifically optimized for Vercel's serverless architecture:

### ✅ What Works on Vercel

- **Server-Sent Events (SSE)** - For real-time updates from server to client
- **HTTP API Routes** - For client to server communication
- **Automatic reconnection** - If SSE connection drops
- **Serverless functions** - All API routes work as serverless functions

### ❌ What Doesn't Work on Vercel

- **WebSocket connections** - Vercel doesn't support persistent WebSocket connections
- **Socket.IO** - Requires persistent server connections
- **Long-running processes** - Serverless functions have execution time limits

## Real-time Communication Flow

```
Client Browser ←--→ Vercel Serverless Functions
     ↑                          ↓
     |                          |
     ↓                          ↑
SSE Stream ←--→ In-Memory Queue State
```

1. **Client to Server**: HTTP POST requests to `/api/events`
2. **Server to Client**: Server-Sent Events stream from `/api/events`
3. **State Management**: In-memory queue state maintained in serverless function
4. **Broadcasting**: All connected SSE clients receive updates instantly

## Environment Configuration

No environment variables are required for basic functionality. The application works out of the box.

## Custom Domain Setup

1. **Add Domain in Vercel Dashboard**:
   - Go to your project in Vercel dashboard
   - Navigate to "Settings" → "Domains"
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP

## Performance Optimization

The application is optimized for Vercel with:

- **Static Generation**: Homepage pre-rendered at build time
- **API Route Optimization**: Efficient serverless function execution
- **Minimal Bundle Size**: Only essential dependencies included
- **SSE Connection Pooling**: Efficient real-time connection management

## Monitoring and Debugging

### Check Deployment Status
```bash
vercel ls
```

### View Function Logs
```bash
vercel logs <deployment-url>
```

### Local Development
```bash
npm run dev
# or
vercel dev
```

## Troubleshooting

### Connection Issues

**Problem**: "🔴 Disconnected" status showing
**Solution**: 
- Check that `/api/events` endpoint is accessible
- Verify browser supports Server-Sent Events
- Clear browser cache and reload

**Problem**: Real-time updates not working
**Solution**:
- Check browser developer tools for SSE connection errors
- Ensure ad blockers aren't blocking event streams
- Try in incognito/private browsing mode

### API Errors

**Problem**: "Internal server error" when adding to queue
**Solution**:
- Check Vercel function logs: `vercel logs`
- Ensure API request format matches expected structure
- Verify serverless function timeout settings

### Build Failures

**Problem**: Build fails during deployment
**Solution**:
- Check that all dependencies are in `package.json`
- Ensure TypeScript types are correct
- Review build logs in Vercel dashboard

## Scaling Considerations

### Current Limitations
- **In-memory state**: Queue state resets with function cold starts
- **Single instance**: No state sharing between multiple function instances
- **Connection limits**: Vercel has limits on concurrent connections

### Production Improvements
For high-traffic production use, consider:

1. **External Database**: Store queue state in Redis/PostgreSQL
2. **Message Queue**: Use services like Upstash Redis for pub/sub
3. **CDN Optimization**: Configure Vercel's Edge Network
4. **Rate Limiting**: Add API rate limiting for abuse prevention

## Security Considerations

### Current Security
- **CORS configured**: Allows cross-origin requests
- **Input validation**: Queue names validated and sanitized
- **Error handling**: Graceful error responses

### Additional Security (Recommended)
```javascript
// Add to API routes for production
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

## Cost Optimization

### Vercel Pricing Factors
- **Function Invocations**: Each API call counts
- **Bandwidth**: Data transfer costs
- **Build Minutes**: Deployment time usage

### Optimization Tips
- Use Vercel's free tier for development/small usage
- Monitor usage in Vercel dashboard
- Implement client-side caching where appropriate
- Use edge caching for static assets

## Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

### Getting Help
- Check Vercel's community forums
- Review application logs in Vercel dashboard
- Test locally with `vercel dev` to reproduce issues

## Example Deployment Commands

```bash
# Initial deployment
vercel --prod

# Update deployment
git push origin main  # Auto-deploys if connected to GitHub

# Manual deployment
vercel --prod

# Check deployment status
vercel ls

# View live logs
vercel logs --follow
```

Your queue management system is now ready for production on Vercel with full real-time capabilities!