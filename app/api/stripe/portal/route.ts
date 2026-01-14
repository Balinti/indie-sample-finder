import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({ disabled: true });
    }

    // Get user from auth header
    let userId: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && env.isSupabaseConfigured) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

      const { data: { user } } = await supabaseClient.auth.getUser(token);

      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID from subscriptions table
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ disabled: true });
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.appUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
