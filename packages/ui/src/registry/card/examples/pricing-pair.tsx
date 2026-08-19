"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/card/card";
import { Button } from "@/registry/button/button";

const pricingTiers = [
  {
    name: "Free",
    blurb: "For hobbyists",
    price: "$0",
    features: ["3 users", "10 downloads / month", "Roster files"],
    highlighted: false,
  },
  {
    name: "Pro",
    blurb: "For agencies",
    price: "$40",
    features: ["3 users", "Unlimited downloads", "Fully editable files", "Custom assets", "200+ custom icons"],
    highlighted: true,
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Two tiers, no new Card capability beyond the existing header/content/footer parts. */
export default function PricingPairExample() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {pricingTiers.map((tier) => (
        <Card key={tier.name} className={tier.highlighted ? "border-2 border-primary" : undefined}>
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.blurb}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <span className="text-3xl font-semibold">{tier.price}</span>
            <ul className="flex flex-col gap-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
              Subscribe
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
