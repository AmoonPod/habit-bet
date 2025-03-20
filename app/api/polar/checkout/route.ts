import { NextResponse } from "next/server";
import { api } from "@/lib/polar";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const supabase = await createClient();
        const session = await supabase.auth.getSession();

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, {
                status: 400,
            });
        }
        const successUrl =
            `${process.env.NEXT_PUBLIC_APP_URL}/confirmation?checkoutId={CHECKOUT_ID}`;
        // Create checkout session with Polar
        const checkoutSession = await api.checkouts.create({
            productId,
            customerExternalId: session?.data.session?.user.id,
            customerEmail: session?.data.session?.user.email,
            customerName: session?.data.session?.user.user_metadata.name,
            successUrl,
        });

        // Redirect user to the Polar checkout page
        return NextResponse.redirect(checkoutSession.url);
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 },
        );
    }
}
