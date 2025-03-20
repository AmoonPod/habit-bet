import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@/utils/supabase/server";
export const POST = Webhooks({
    webhookSecret: process.env.NEXT_PUBLIC_POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
        try {
            const { type, data } = payload;
            const supabase = await createClient();
            switch (type) {
                case "subscription.created": {
                    const subscription = await supabase
                        .from("subscriptions")
                        .insert({
                            productId: data.productId,
                            user_id: data.customer.externalId,
                            subscriptionId: data.id,
                            customerId: data.customerId,
                            status: data.status,
                            currentPeriodEnd: data.currentPeriodEnd,
                        });
                    console.log("Subscription created:", subscription);
                    break;
                }

                case "subscription.updated": {
                    // Update the subscription
                    const subscription = await supabase
                        .from("subscriptions")
                        .update({
                            status: data.status,
                            productId: data.productId,
                            currentPeriodEnd: data.currentPeriodEnd,
                            updatedAt: new Date(),
                        })
                        .eq("subscriptionId", data.id);
                    console.log("Subscription updated:", subscription);
                    break;
                }

                case "subscription.canceled": {
                    const subscription = await supabase
                        .from("subscriptions")
                        .update({ status: "canceled" })
                        .eq("subscriptionId", data.id);
                    console.log("Subscription canceled:", subscription);
                    break;
                }

                default:
                    console.log("Unhandled event:", type);
                    break;
            }
        } catch (error) {
            console.error("Error processing webhook:", error);
        }
    },
});
