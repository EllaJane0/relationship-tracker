/**
 * Stripe Checkout Session API
 * Serverless function for creating Stripe Checkout sessions
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Stripe with secret key from environment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: userId and email'
      });
    }

    // Get the base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        userId,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}
