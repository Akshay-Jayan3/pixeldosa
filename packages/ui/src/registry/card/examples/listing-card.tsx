"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from "@/registry/card/card";
import { Button } from "@/registry/button/button";

/** Composed with CardImage for a top-banner, vertical-orientation layout. */
export default function ListingCardExample() {
  return (
    <Card className="w-full max-w-sm">
      <CardImage
        src="https://images.unsplash.com/photo-1466442929976-97f336a657be?w=480&h=360&fit=crop"
        alt="A wooden cabin overlooking a mountain valley at dusk"
      />
      <CardHeader>
        <CardTitle>Ridgeline cabin</CardTitle>
        <CardDescription>Alpine views, sleeps four, 8 nights available.</CardDescription>
      </CardHeader>
      <CardFooter className="items-center justify-between border-t">
        <span className="text-sm font-medium">$210 / night</span>
        <Button size="sm">Reserve now</Button>
      </CardFooter>
    </Card>
  );
}
