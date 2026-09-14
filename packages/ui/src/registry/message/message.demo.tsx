"use client";

import * as React from "react";

import { AIActionToolbar } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { Cite, CitedText } from "@/registry/inline-citations/inline-citations";
import { Message, MessageContent, type MessageStatus } from "@/registry/message/message";
import { ReasoningStream } from "@/registry/reasoning-stream/reasoning-stream";
import { ToolCallGroup } from "@/registry/tool-call-card/tool-call-card";

const ANSWER =
  "Churn rose in August mostly among teams that never finished setup. Accounts that completed the setup checklist kept renewing at the usual rate, so the checklist is the first thing I'd push in onboarding emails.";
const WORDS = ANSWER.split(" ");

/**
 * Chunks arrive at irregular sizes and intervals, like a real stream. The component just
 * renders what has arrived — the irregularity is the point, not a typing effect.
 */
export default function MessageDemo() {
  const [shown, setShown] = React.useState(0);
  const [status, setStatus] = React.useState<MessageStatus>("streaming");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (status !== "streaming") return;
    if (shown >= WORDS.length) {
      setStatus("done");
      return;
    }
    const delay = shown === 0 ? 1400 : 60 + ((shown * 37) % 180);
    timer.current = window.setTimeout(() => setShown((n) => Math.min(WORDS.length, n + 1 + (n % 3))), delay);
    return () => window.clearTimeout(timer.current);
  }, [shown, status]);

  const restart = () => {
    setShown(0);
    setStatus("streaming");
  };

  const answering = shown > 0;
  const done = status === "done";

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Message role="user" meta="9:41">
        Why did churn go up in August?
      </Message>

      <Message
        role="assistant"
        author="Assistant"
        status={status}
        onContinue={() => setStatus("streaming")}
        onRetry={restart}
        actions={
          <AIActionToolbar
            label="Answer actions"
            actions={[
              { id: "copy", label: "Copy", intent: "quiet" },
              { id: "regenerate", label: "Regenerate", intent: "quiet" },
            ]}
            onAction={(id) => id === "regenerate" && restart()}
          />
        }
      >
        <ReasoningStream
          steps={["Compare August churn with the prior three months", "Split churned accounts by onboarding progress"]}
          isStreaming={!answering && status === "streaming"}
          durationMs={answering ? 4200 : undefined}
        />
        <ToolCallGroup
          calls={[
            { id: "q1", kind: "run", effect: "read-only", target: "churn_by_month.sql", status: answering || status !== "streaming" ? "done" : "running", durationMs: 820 },
            { id: "q2", kind: "read", target: "onboarding_events (Aug)", status: answering || status !== "streaming" ? "done" : "running", durationMs: 310 },
          ]}
        />
        {answering ? (
          done ? (
            <CitedText
              sources={[{ id: "dash", title: "Retention dashboard — August", publisher: "Analytics" }]}
              showReferences={false}
            >
              <MessageContent>
                <p>
                  <Cite source="dash" quote="Churn among accounts without completed setup: 9.1% (July: 5.4%).">
                    Churn rose in August mostly among teams that never finished setup
                  </Cite>
                  . Accounts that completed the setup checklist kept renewing at the usual rate, so the checklist is the
                  first thing I&apos;d push in onboarding emails.
                </p>
              </MessageContent>
            </CitedText>
          ) : (
            <MessageContent>
              <p>{WORDS.slice(0, shown).join(" ")}</p>
            </MessageContent>
          )
        ) : null}
      </Message>

      <div className="flex gap-3 border-t pt-3 text-xs">
        {status === "streaming" ? (
          <button type="button" onClick={() => setStatus("stopped")} className="font-medium text-muted-foreground hover:text-foreground">
            Stop
          </button>
        ) : (
          <button type="button" onClick={restart} className="font-medium text-muted-foreground hover:text-foreground">
            Replay
          </button>
        )}
        {status === "streaming" && answering ? (
          <button type="button" onClick={() => setStatus("failed")} className="font-medium text-muted-foreground hover:text-foreground">
            Simulate a failure
          </button>
        ) : null}
      </div>
    </div>
  );
}
