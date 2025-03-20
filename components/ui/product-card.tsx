"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { formatPrice } from "@/lib/polar";
import { Product } from "@polar-sh/sdk/models/components/product.js";

// Define our own Product interface based on Polar's API
interface Benefit {
  id: string;
  description: string | null;
}

interface Price {
  id: string;
  amountType: "fixed" | "free" | "pay_what_you_want";
  priceAmount?: number | null;
  currency?: string | null;
}

interface ProductCardProps {
  product: Product;
  isHighlighted?: boolean;
  isPopular?: boolean;
}

export const ProductCard = ({
  product,
  isHighlighted,
  isPopular,
}: ProductCardProps) => {
  // Handling just a single price for now
  // Can be extended to handle multiple prices for monthly/yearly plans
  const firstPrice = product.prices?.[0];

  const price = useMemo(() => {
    if (!firstPrice) return "Free";

    switch (firstPrice.amountType) {
      case "fixed":
        // The Polar API returns prices in cents - Convert to dollars for display
        return formatPrice(firstPrice.priceAmount || 0);
      case "free":
        return "Free";
      default:
        return "Pay what you want";
    }
  }, [firstPrice]);

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6",
        isHighlighted
          ? "bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950"
          : "bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
        isPopular && "ring-2 ring-slate-900 dark:ring-slate-50"
      )}
    >
      {isHighlighted && <HighlightedBackground />}
      {isPopular && <PopularBackground />}

      <h2 className="text-xl font-medium">{product.name}</h2>

      <div className="relative h-12">
        <h1 className="text-4xl font-medium">{price}</h1>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-medium">{product.description}</h3>
        <ul className="space-y-2">
          {product.benefits?.map((benefit: Benefit) => (
            <li
              key={benefit.id}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isHighlighted
                  ? "text-white dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <BadgeCheck className="h-4 w-4" />
              {benefit.description}
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/checkout?productId=${product.id}`} passHref>
        <Button
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
        >
          Buy Now
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
};

const HighlightedBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
);

const PopularBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
);

export default ProductCard;
