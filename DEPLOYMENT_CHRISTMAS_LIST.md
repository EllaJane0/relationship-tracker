# Deploying Christmas List Sharer to Vercel

This guide will help you deploy the Christmas List app from the `experimental` branch as a **separate Vercel project** without affecting your existing app on `main`.

## Prerequisites

- Vercel account (https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- Supabase project with migrations run
- Stripe account with product/price created

## Deployment Steps

### 1. Push the experimental branch to GitHub

```bash
git push origin experimental
```

This uploads your Christmas List code to GitHub on the `experimental` branch.

### 2. Deploy to Vercel via Dashboard (Recommended)

**Option A: Create New Project in Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **IMPORTANT**: In "Configure Project":
   - Set **Project Name** to something like `christmas-list-sharer` (different from your existing project)
   - Under "Git Branch", select **experimental** instead of main
   - This creates a completely separate project
4. Click "Deploy"

**Option B: Deploy via CLI**

```bash
# Make sure you're on experimental branch
git checkout experimental

# Deploy to Vercel (will create new project)
vercel --prod

# When prompted:
# "Set up and deploy?" → Yes
# "Which scope?" → Select your account
# "Link to existing project?" → No
# "What's your project's name?" → christmas-list-sharer
# "In which directory is your code located?" → ./
```

### 3. Configure Environment Variables

After deployment, go to your Vercel project settings and add these environment variables:

**Required Variables:**

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk_key
STRIPE_SECRET_KEY=your_stripe_sk_key
EXPO_PUBLIC_STRIPE_PRICE_ID=your_stripe_price_id
EXPO_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

**Where to find these:**
- **Supabase**: Project Settings → API → URL and anon/public key
- **Stripe**: Developers → API Keys → Publishable and Secret keys
- **Stripe Price ID**: Products → Your subscription product → Price ID
- **App URL**: Your Vercel deployment URL (set after first deployment)

### 4. Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or use the Vercel dashboard: Deployments → Click menu → Redeploy

### 5. Run Supabase Migrations

Make sure your Supabase database has the Christmas List tables:

```bash
# In Supabase SQL Editor, run:
supabase/migrations/001_create_christmas_list_tables.sql
supabase/migrations/002_create_rls_policies.sql
```

Or use the Supabase CLI if you have it installed:

```bash
supabase db push
```

## Project Structure

You now have TWO separate Vercel projects:

1. **Original App** (from `main` branch)
   - Your relationship tracker app
   - Not affected by this deployment

2. **Christmas List App** (from `experimental` branch)
   - Separate project name
   - Separate environment variables
   - Separate domain (e.g., christmas-list-sharer.vercel.app)
   - Uses its own Supabase tables

## How the Metadata Extraction Works

### Local Development
- Uses `server/metadata-server.js` running on port 3001
- Start with: `node server/metadata-server.js`

### Production (Vercel)
- Uses `api/extract-metadata.ts` serverless function
- Automatically deployed with your app
- Accessible at `https://your-domain.vercel.app/api/extract-metadata`

## Updating the Deployment

To update your Christmas List app after making changes:

```bash
# Make sure you're on experimental branch
git checkout experimental

# Commit your changes
git add .
git commit -m "Your update message"

# Push to GitHub
git push origin experimental

# Deploy to Vercel
vercel --prod
```

Vercel will automatically detect changes and redeploy if you have GitHub integration enabled.

## Keeping Both Apps Separate

### To work on the original app:
```bash
git checkout main
# Make changes
git commit -m "Update original app"
git push origin main
# Deploy will happen automatically if main is connected
```

### To work on Christmas List app:
```bash
git checkout experimental
# Make changes
git commit -m "Update Christmas List"
git push origin experimental
# Redeploy with: vercel --prod
```

## Troubleshooting

### Issue: Metadata extraction not working
- Check that `EXPO_PUBLIC_APP_URL` is set correctly in Vercel environment variables
- Verify the `/api/extract-metadata` endpoint is accessible: `https://your-domain.vercel.app/api/extract-metadata`

### Issue: Authentication not working
- Verify Supabase environment variables are correct
- Check that Supabase URL is added to Vercel's allowed domains
- Add your Vercel domain to Supabase Auth → URL Configuration → Redirect URLs

### Issue: Stripe not working
- Verify all Stripe environment variables are set
- Check that Price ID matches your Stripe product
- Test in Stripe test mode first before going live

### Issue: Database errors
- Make sure migrations are run in Supabase
- Verify RLS policies are correctly configured
- Check that anon key has proper permissions

## Testing Your Deployment

1. Visit your Vercel URL
2. Sign up/Sign in with Supabase Auth
3. Create a list
4. Add a product URL and verify metadata extraction works
5. Generate a share link and test it
6. Test subscription flow (in Stripe test mode)

## Custom Domain (Optional)

To add a custom domain like `christmaslist.yourdomain.com`:

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `EXPO_PUBLIC_APP_URL` environment variable to your custom domain
5. Redeploy

## Resources

- Vercel Docs: https://vercel.com/docs
- Expo Web Docs: https://docs.expo.dev/guides/customizing-webpack/
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test locally first with `npm start`
