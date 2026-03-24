import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getStripeClient } from "@/lib/stripe";

export async function POST() {
  if (!process.env.STRIPE_SUPPORTER_PRICE_ID) {
    return NextResponse.json(
      { error: "Missing STRIPE_SUPPORTER_PRICE_ID environment variable." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "You must be logged in to subscribe." }, { status: 401 });
  }

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [
      {
        price: process.env.STRIPE_SUPPORTER_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/support/success`,
    cancel_url: `${siteUrl}/support/cancel`,
    allow_promotion_codes: true,
    metadata: {
      user_id: user.id,
      tier: "monthly_supporter",
    },
  });

  return NextResponse.json({ url: session.url });
}
