"use client";

import * as React from "react";

import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/registry/field/field";

export default function FieldDemo() {
  const [email, setEmail] = React.useState("not-an-email");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Field invalid={invalid}>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
          />
        </FieldControl>
        <FieldDescription>We'll only use this to send order updates.</FieldDescription>
        <FieldError>{invalid ? "Enter a valid email address." : null}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Display name</FieldLabel>
        <FieldControl>
          <input
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            placeholder="e.g. Akshay"
          />
        </FieldControl>
      </Field>
    </div>
  );
}
