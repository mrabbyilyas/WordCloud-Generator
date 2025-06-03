# 🚀 Vercel Deployment Guide

This guide will help you deploy the WordCloud Generator frontend to Vercel.

## 📋 Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) (optional but recommended)
- Git repository (GitHub, GitLab, or Bitbucket)

## 🔧 Environment Variables

Before deploying, you need to configure the following environment variables in Vercel:

### Required Variables:
```bash
NEXT_PUBLIC_API_URL=https://mrabbyilyas-wordcloud-generator.hf.space
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=WordCloud Generator
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Generate beautiful word clouds from your text
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

### Optional Variables:
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_WORD_CLOUD_MAX_WORDS=200
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 🚀 Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to preview:**
   ```bash
   vercel
   ```

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure build settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add environment variables:**
   - Go to Project Settings → Environment Variables
   - Add all the required variables listed above

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

## 🔍 Verification

After deployment, verify that:

1. ✅ The application loads correctly
2. ✅ Word cloud generation works
3. ✅ API calls to the backend are successful
4. ✅ All environment variables are properly set
5. ✅ No console errors in browser dev tools

## 🛠️ Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes: `npx tsc --noEmit`
   - Fix ESLint warnings: `npx eslint src --ext .ts,.tsx --fix`

2. **API calls fail:**
   - Verify `NEXT_PUBLIC_API_URL` is correctly set
   - Check CORS settings on your backend
   - Ensure the backend API is accessible from Vercel

3. **Environment variables not working:**
   - Make sure variables start with `NEXT_PUBLIC_` for client-side access
   - Redeploy after adding new environment variables

## 📊 Performance Optimizations

The project includes several optimizations for Vercel:

- ✅ Image optimization with WebP/AVIF formats
- ✅ Bundle splitting and tree-shaking
- ✅ Compression enabled
- ✅ Security headers configured
- ✅ Package imports optimized
- ✅ Static generation where possible

## 🔒 Security Features

- Content Security Policy headers
- XSS Protection
- CSRF Protection
- Secure referrer policy
- Content type validation

## 📝 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## 🔄 Continuous Deployment

With GitHub integration, every push to your main branch will automatically trigger a new deployment.

## 📞 Support

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel Dashboard
3. Check the [Next.js deployment guide](https://nextjs.org/docs/deployment)

---

**Happy Deploying! 🎉**