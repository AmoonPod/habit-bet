"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  getPolarCheckoutUrl,
  getPolarProductCheckoutUrl,
  redirectToCheckout,
} from "@/lib/polar";
import { Loader2 } from "lucide-react";

interface PolarButtonProps extends Omit<ButtonProps, "onClick"> {
  // Required props
  orgId: string; // The Polar organization ID

  // Product or Price ID (one of these is required)
  productId?: string; // For one-time purchases
  priceId?: string; // For subscriptions

  // Optional props
  amount?: number;
  currency?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  onSuccess?: () => void;
  onCheckoutError?: (error: Error) => void;
}

export function PolarButton({
  orgId,
  productId,
  priceId,
  amount,
  currency = "USD",
  description,
  successUrl = `${window.location.origin}/payment/success`,
  cancelUrl = `${window.location.origin}/payment/cancel`,
  customerId,
  metadata,
  onSuccess,
  onCheckoutError,
  children,
  disabled,
  ...props
}: PolarButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Validate that either productId or priceId is provided
  if (!productId && !priceId) {
    console.error("PolarButton: Either productId or priceId is required");
  }

  const handleCheckout = () => {
    setIsLoading(true);

    try {
      // Create metadata object with description and amount if provided
      const checkoutMetadata = {
        ...metadata,
        ...(description && { description }),
        ...(amount && { amount: amount.toString() }),
        ...(currency && { currency }),
      };

      // Generate the checkout URL based on whether it's a product or subscription
      let checkoutUrl: string;

      if (productId) {
        // For one-time purchases
        checkoutUrl = getPolarProductCheckoutUrl(
          orgId,
          productId,
          successUrl,
          cancelUrl,
          checkoutMetadata
        );
      } else if (priceId) {
        // For subscriptions
        checkoutUrl = getPolarCheckoutUrl(
          orgId,
          priceId,
          successUrl,
          cancelUrl,
          checkoutMetadata
        );
      } else {
        throw new Error("Either productId or priceId is required");
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to checkout
      redirectToCheckout(checkoutUrl);
    } catch (error) {
      console.error("Checkout error:", error);
      // Call onCheckoutError callback if provided
      if (onCheckoutError && error instanceof Error) {
        onCheckoutError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading || (!productId && !priceId)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default PolarButton;
