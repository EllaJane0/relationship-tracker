# Deployment Guide - Relationship Tracker

## Prerequisites

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Sign up for a Vercel account at https://vercel.com if you don't have one

## Step 1: Initialize Vercel Project

Run the following command in your project directory:

```bash
vercel login
```

Then initialize the project:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- What's your project's name? **relationship-tracker** (or your preferred name)
- In which directory is your code located? **.**
- Want to override the settings? **N**

## Step 2: Configure Environment Variables

Go to your Vercel dashboard (https://vercel.com/dashboard) and navigate to your project settings:

1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables:

**Supabase Configuration:**
- `EXPO_PUBLIC_SUPABASE_URL` = `<your-supabase-project-url>`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `<your-supabase-anon-key>`

**Stripe Configuration:**
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `<your-stripe-publishable-key>`
- `STRIPE_SECRET_KEY` = `<your-stripe-secret-key>`
- `EXPO_PUBLIC_STRIPE_PRICE_ID` = `<your-stripe-price-id>`

**Note:** Get these values from your `.env` file in the project root.

**Important:** Make sure to select **Production**, **Preview**, and **Development** for all environment variables.

## Step 3: Deploy to Production

Once environment variables are configured, deploy to production:

```bash
vercel --prod
```

Or use the npm script:

```bash
npm run deploy
```

## Step 4: Verify Deployment

After deployment completes:

1. Vercel will provide you with a production URL (e.g., `https://relationship-tracker.vercel.app`)
2. Visit the URL to test your application
3. Try the following features:
   - Sign up for a new account
   - Sign in with your account
   - Navigate to Settings → Upgrade to Pro
   - Test the Stripe Checkout flow (it will now work with the serverless functions!)

## Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository:

- Every push to your main branch will trigger a production deployment
- Pull requests will get preview deployments
- You can view all deployments in your Vercel dashboard

## Troubleshooting

### Build Fails

If the build fails, check:
1. All environment variables are set correctly
2. The `vercel.json` configuration is valid
3. Dependencies are properly installed

### Stripe Checkout Not Working

Verify:
1. `STRIPE_SECRET_KEY` is set in Vercel environment variables
2. The `/api/create-checkout-session` endpoint is accessible
3. Check Vercel function logs for errors

### Authentication Issues

Ensure:
1. Supabase environment variables are correct
2. Supabase project allows the Vercel domain in its settings
3. Go to Supabase Dashboard → Authentication → URL Configuration
4. Add your Vercel URL to "Site URL" and "Redirect URLs"

## Update Supabase URLs

After deployment, update your Supabase project settings:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
5. Add **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:8081/**` (for local development)

## Local Development

To run locally with the same configuration:

```bash
npm start
```

Then press `w` to open in web browser.

## Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Vercel URL added to Supabase URL configuration
- [ ] Stripe webhook configured (if using webhooks)
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test subscription upgrade flow
- [ ] Verify payment processing works

## Support

If you encounter issues:
- Check Vercel function logs in your dashboard
- Review Supabase logs for authentication issues
- Check Stripe dashboard for payment errors
