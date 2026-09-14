"use client";

import * as React from "react";

import {
  PromptComposer,
  type ComposerAttachment,
  type ComposerSubmission,
} from "@/registry/prompt-composer/prompt-composer";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PromptComposerDemo() {
  const [attachments, setAttachments] = React.useState<ComposerAttachment[]>([
    { id: "notes", name: "release-notes-4.2.md", detail: "Markdown · 6 KB", status: "ready" },
  ]);
  const [busy, setBusy] = React.useState(false);
  const [last, setLast] = React.useState<ComposerSubmission | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <PromptComposer
        placeholder="What should the announcement cover?"
        suggestions={["Announce the new setup checklist", "Summarise what changed for admins"]}
        controls={[
          { id: "format", label: "Format", options: ["Email", "Blog post", "Changelog entry"], defaultValue: "Email" },
          { id: "tone", label: "Tone", options: ["Neutral", "Friendly", "Formal"], defaultValue: "Neutral" },
          { id: "length", label: "Length", options: ["Short", "Medium", "Long"], defaultValue: "Medium" },
          { id: "audience", label: "For", options: ["Customers", "Admins", "Internal team"], defaultValue: "Customers" },
        ]}
        attachments={attachments}
        accept=".md,.txt,.pdf"
        // Pretend upload: a real app would send the file and update status from the response.
        onAttachFiles={(files) => {
          const added = files.map((file) => ({
            id: `${file.name}-${file.lastModified}`,
            name: file.name,
            detail: formatSize(file.size),
            status: "uploading" as const,
          }));
          setAttachments((all) => [...all, ...added]);
          window.setTimeout(() => {
            setAttachments((all) =>
              all.map((item) => (added.some((a) => a.id === item.id) ? { ...item, status: "ready" } : item))
            );
          }, 1600);
        }}
        onRemoveAttachment={(id) => setAttachments((all) => all.filter((item) => item.id !== id))}
        maxLength={600}
        busy={busy}
        onStop={() => {
          window.clearTimeout(timer.current);
          setBusy(false);
        }}
        onSubmit={(submission) => {
          setLast(submission);
          setBusy(true);
          timer.current = window.setTimeout(() => setBusy(false), 2600);
        }}
      />
      {last ? (
        <p className="px-1 text-xs text-muted-foreground text-pretty" aria-live="polite">
          {busy ? "Generating" : "Sent"}: &ldquo;{last.text}&rdquo; as a {last.values.length?.toLowerCase()},{" "}
          {last.values.tone?.toLowerCase()} {last.values.format?.toLowerCase()} for {last.values.audience?.toLowerCase()}
          {last.attachments.length ? `, with ${last.attachments.length} attachment${last.attachments.length === 1 ? "" : "s"}` : ""}.
        </p>
      ) : null}
    </div>
  );
}
