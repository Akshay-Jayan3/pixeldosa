"use client";

import * as React from "react";

import { Message, MessageContent, type MessageStatus } from "@/registry/message/message";
import { MessageScroller } from "@/registry/message-scroller/message-scroller";

type Turn = { id: string; role: "user" | "assistant"; text: string; status?: MessageStatus };

const HISTORY: Turn[] = [
  { id: "h1", role: "user", text: "What changed in the 4.2 release?" },
  { id: "h2", role: "assistant", text: "4.2 added a guided setup checklist for new workspaces, faster CSV imports, and SSO for the Team plan." },
  { id: "h3", role: "user", text: "Which of those affects admins?" },
  { id: "h4", role: "assistant", text: "SSO does most directly: admins configure it under Settings → Security. The checklist also appears for admins the first time they open a new workspace." },
];

const OLDER: Turn[] = [
  { id: "o1", role: "user", text: "Can you summarise last week's support tickets?" },
  { id: "o2", role: "assistant", text: "Most tickets were about CSV imports timing out on files over 50 MB. That was fixed in 4.2." },
];

const REPLY =
  "Here's a draft announcement for admins. SSO is now available on the Team plan: set it up under Settings → Security, and your team will sign in with your identity provider from their next session. New workspaces also get a guided setup checklist, so the first run takes a few minutes instead of an afternoon. Existing workspaces aren't affected, and nothing changes for people who already signed in with email. If you'd like, I can also write a shorter version for the in-app banner, or a note for your help center.";

export default function MessageScrollerDemo() {
  const [turns, setTurns] = React.useState<Turn[]>(HISTORY);
  const [loadedOlder, setLoadedOlder] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const streamRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearInterval(streamRef.current), []);

  const ask = () => {
    window.clearInterval(streamRef.current);
    const id = `r${Date.now()}`;
    setTurns((all) => [
      ...all,
      { id: `${id}-q`, role: "user", text: "Draft an announcement for admins." },
      { id, role: "assistant", text: "", status: "streaming" },
    ]);
    const words = REPLY.split(" ");
    let shown = 0;
    streamRef.current = window.setInterval(() => {
      shown = Math.min(words.length, shown + 2);
      const done = shown >= words.length;
      setTurns((all) =>
        all.map((turn) =>
          turn.id === id ? { ...turn, text: words.slice(0, shown).join(" "), status: done ? "done" : "streaming" } : turn
        )
      );
      if (done) {
        window.clearInterval(streamRef.current);
        setAnnouncement(`Assistant replied: ${REPLY.slice(0, 80)}…`);
      }
    }, 90);
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MessageScroller
        className="h-80 rounded-lg border bg-card"
        announcement={announcement}
        onReachTop={() => {
          if (loadedOlder) return;
          setLoadedOlder(true);
          // Pretend network latency for older history.
          window.setTimeout(() => setTurns((all) => [...OLDER, ...all]), 400);
        }}
      >
        {turns.map((turn) => (
          <Message key={turn.id} role={turn.role} status={turn.status} author={turn.role === "assistant" ? "Assistant" : undefined}>
            {turn.role === "assistant" ? (
              turn.text ? (
                <MessageContent>
                  <p>{turn.text}</p>
                </MessageContent>
              ) : null
            ) : (
              turn.text
            )}
          </Message>
        ))}
      </MessageScroller>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <button type="button" onClick={ask} className="font-medium text-foreground underline underline-offset-2">
          Ask for a long reply
        </button>
        <span>then scroll up while it streams. Scroll to the top to load older messages.</span>
      </p>
    </div>
  );
}
