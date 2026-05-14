# 🚀 Deploying MyRideNepal to Vercel

Your MyRideNepal marketplace is ready to deploy to Vercel! Here are the deployment options:

---

## Option 1: Deploy via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy to Production
```bash
vercel --prod
```

The CLI will:
- ✅ Detect your TanStack Start project
- ✅ Build your application
- ✅ Deploy to production
- ✅ Provide your live URL

---

## Option 2: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Visit: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `myride-nepal-marketplace` repository
4. Click "Import"

### Step 3: Configure Environment Variables
Add these environment variables in the Vercel dashboard:

```env
VITE_SUPABASE_URL=https://rcypkqctgonotawnajqb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
SUPABASE_URL=https://rcypkqctgonotawnajqb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get these values:**
1. Visit: https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/api
2. Copy the API URL and Keys
3. Paste them into Vercel's environment variables section

### Step 4: Deploy
Click "Deploy" and wait for the build to complete!

---

## Option 3: Manual Deployment

### Step 1: Build Locally
```bash
npm run build
```

### Step 2: Test Build
```bash
npm run start
```

### Step 3: Deploy
```bash
vercel --prod
```

---

## ⚙️ Vercel Configuration

Your project already has the right structure for Vercel. TanStack Start is automatically detected.

### Automatic Detection
Vercel will automatically:
- ✅ Detect TanStack Start framework
- ✅ Use Node.js 18+ runtime
- ✅ Build with `npm run build`
- ✅ Serve with serverless functions
- ✅ Enable edge functions if needed

### Build Settings (Auto-configured)
```
Framework Preset: TanStack Start
Build Command: npm run build
Output Directory: .vinxi/output
Install Command: npm install
Node Version: 18.x
```

---

## 🔒 Post-Deployment Checklist

### 1. Verify Environment Variables
After deployment, check that all env vars are set:
```bash
vercel env ls
```

### 2. Test Critical Flows
- [ ] Visit your live URL
- [ ] Test user registration/login
- [ ] Create a test listing
- [ ] Check admin panel access
- [ ] Verify image uploads work

### 3. Set Up Custom Domain (Optional)
```bash
vercel domains add yourdomain.com
```

Or use the Vercel dashboard to add a custom domain.

### 4. Enable Vercel Analytics (Optional)
```bash
npm install @vercel/analytics
```

Then add to your root component:
```tsx
import { Analytics } from '@vercel/analytics/react';

export function Root() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## 🐛 Troubleshooting

### Build Fails with "Missing environment variables"
**Solution:** Add all required env vars in Vercel dashboard under Settings → Environment Variables

### "Cannot find module" Error
**Solution:** Ensure all dependencies are in `package.json` and run `npm install` before deploying

### 404 on Routes
**Solution:** Vercel should auto-detect TanStack Start. If not, add a `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".vinxi/output",
  "framework": "tanstack-start"
}
```

### Serverless Function Timeout
**Solution:** Upgrade to Vercel Pro for longer function timeouts (10s → 60s)

---

## 📊 Expected Deployment Results

### Build Time
- First build: ~2-3 minutes
- Subsequent builds: ~1-2 minutes (with cache)

### Performance
- Cold start: <500ms
- Warm requests: <100ms
- Global CDN: Edge caching enabled
- Lighthouse Score: 90+ (expected)

### Resources Used
- Serverless Functions: Yes (auto-managed)
- Edge Functions: No (not needed yet)
- Static Assets: Yes (optimized automatically)
- Image Optimization: Available (use Vercel Image Optimization)

---

## 🎯 Recommended Vercel Settings

### Production
- **Auto-deploy on push:** ✅ Enabled
- **Preview deployments:** ✅ Enabled for PRs
- **Environment variables:** Production + Preview
- **Build & Development Settings:** Auto-detected

### Performance
- **Compression:** Gzip/Brotli (automatic)
- **Caching:** Aggressive (automatic)
- **CDN:** Global (automatic)
- **Functions Region:** Auto (or specify your region)

---

## 🔐 Security Notes

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variables UI
- ✅ Separate production and preview variables
- ✅ Service role key should only be in production

### CORS Settings
Your Supabase project should allow your Vercel domain:
1. Visit: https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/api
2. Add your Vercel domain to allowed origins
3. Format: `https://your-app.vercel.app`

---

## 📞 Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel rm [deployment-url]

# View project settings
vercel inspect [deployment-url]
```

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Live URL is accessible
- ✅ Users can sign up and login
- ✅ Listings can be created
- ✅ Images upload successfully
- ✅ Admin panel works
- ✅ All pages load correctly

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **TanStack Start Docs:** https://tanstack.com/start
- **Supabase Docs:** https://supabase.com/docs
- **Your Project:** https://github.com/huntersam-ttl/myride-nepal-marketplace

---

**Deployment Confidence:** 🟢 High  
**Estimated Time:** 10-15 minutes  
**Difficulty:** ⭐⭐ Easy
