import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({ disabled: true });
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ disabled: true });
    }

    // Get user from auth header
    let userId: string | null = null;
    let userEmail: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && env.isSupabaseConfigured) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

      const { data: { user } } = await supabaseClient.auth.getUser(token);

      if (user) {
        userId = user.id;
        userEmail = user.email || null;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.appUrl}/account?checkout=success`,
      cancel_url: `${env.appUrl}/account?checkout=cancelled`,
      customer_email: userEmail || undefined,
      metadata: {
        app_name: 'indie-sample-finder',
        user_id: userId || '',
      },
      subscription_data: {
        metadata: {
          app_name: 'indie-sample-finder',
          user_id: userId || '',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
