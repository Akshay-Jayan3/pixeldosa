"use client";

import * as React from "react";

import { AutonomyControl, type AutonomyLevel } from "@/registry/autonomy-control/autonomy-control";

export default function AutonomyControlDemo() {
  const [level, setLevel] = React.useState<AutonomyLevel>("balanced");
  const [alwaysAsk, setAlwaysAsk] = React.useState<string[]>([]);

  return (
    <div className="w-full max-w-md">
      <AutonomyControl
        headingLevel={2}
        level={level}
        onLevelChange={setLevel}
        alwaysAsk={alwaysAsk}
        onAlwaysAskChange={setAlwaysAsk}
        actions={[
          { id: "label", label: "Label and archive email", risk: "low" },
          { id: "draft", label: "Draft replies", risk: "low" },
          { id: "calendar", label: "Accept meeting invites", risk: "medium" },
          { id: "unsubscribe", label: "Unsubscribe from lists", risk: "medium" },
          { id: "send", label: "Send email for you", risk: "high" },
        ]}
      />
    </div>
  );
}
