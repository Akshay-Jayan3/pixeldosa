"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/card/card";
import { Button } from "@/registry/button/button";

/** Header, content and footer parts with a trailing overflow action. */
export default function ContentCardExample() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Plated dosa set</CardTitle>
        <CardDescription>Serves two, ready in 12 minutes.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" aria-label="More options">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Crisp rice-and-lentil crepe, coconut chutney, and sambar on the side.
        </p>
      </CardContent>
      <CardFooter className="border-t">
        <Button className="w-full">Add to order</Button>
      </CardFooter>
    </Card>
  );
}
