# WordCloud Generator - Vercel Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Vercel account
- GitHub repository
- Node.js 18+ (for local testing)

### 1. Environment Variables Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_APP_URL`: Your frontend domain

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

### 3. Environment Variables in Vercel Dashboard

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=WordCloud Generator
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_WORD_CLOUD_MAX_WORDS=200
```

### 4. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 📁 Project Structure for Deployment

```
frontend/
├── .env.example          # Environment variables template
├── vercel.json          # Vercel configuration
├── next.config.ts       # Next.js configuration with optimizations
├── package.json         # Dependencies and scripts
└── src/
    ├── app/
    └── components/
```

## ⚡ Performance Optimizations

### Included Optimizations:
- **Image Optimization**: WebP/AVIF formats, caching
- **Bundle Splitting**: Vendor chunks separation
- **Compression**: Gzip/Brotli compression
- **Security Headers**: XSS protection, CSRF prevention
- **CSS Optimization**: Minification and tree-shaking
- **Package Optimization**: Selective imports for large libraries

### Build Performance:
- SWC minification enabled
- Standalone output for faster cold starts
- Optimized webpack configuration

## 🔒 Security Features

- Content Security Policy headers
- XSS Protection
- CSRF Protection
- Secure referrer policy
- Frame options protection

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**
   ```bash
   # Check TypeScript errors
   npx tsc --noEmit
   
   # Check ESLint errors
   npx eslint src --ext .ts,.tsx
   ```

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side
   - Check Vercel dashboard environment variables
   - Redeploy after adding new variables

3. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend
   - Ensure API is accessible from Vercel's servers

4. **Performance Issues**
   - Check bundle analyzer: `npm run build && npx @next/bundle-analyzer`
   - Optimize images and assets
   - Review network requests in DevTools

## 📊 Monitoring

### Vercel Analytics
Enable in Vercel Dashboard → Project → Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error tracking

## 🔄 CI/CD Pipeline

Vercel automatically:
- Builds on every push to main branch
- Creates preview deployments for PRs
- Runs build checks and tests
- Deploys to production on merge

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] TypeScript compilation passes
- [ ] ESLint checks pass
- [ ] Build completes successfully
- [ ] API endpoints accessible
- [ ] Custom domain configured (if needed)
- [ ] Analytics enabled
- [ ] Performance optimizations verified

## 🆘 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review build output
3. Test locally with `npm run build && npm start`
4. Contact support with specific error messages

---

**Happy Deploying! 🎉**