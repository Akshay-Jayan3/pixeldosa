import type { Metadata } from "next";
import Link from "next/link";

import { CHANGELOG, type ChangeKind, type ChangelogChange } from "@/lib/changelog";
import { getComponentDoc } from "@/lib/docs";
import { getRegistryItem } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every PixelDosa release during the beta: new components, improvements, fixes and anything that changed an API.",
};

const KIND_ORDER: ChangeKind[] = ["breaking", "new", "improved", "fixed"];

const KIND_LABEL: Record<ChangeKind, string> = {
  breaking: "Breaking",
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Renders `code` spans in change notes without pulling in a markdown renderer. */
function Note({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, index) =>
        part.startsWith("`") ? (
          <code key={index} className="rounded-sm bg-muted px-1 py-px font-mono text-[0.8125rem] text-foreground">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

function ChangeLine({ change }: { change: ChangelogChange }) {
  const item = change.component ? getRegistryItem(change.component) : undefined;
  // A typo'd name would otherwise render an empty line. The page is static, so this fails the build.
  if (change.component && !item) throw new Error(`Changelog references unknown component "${change.component}"`);
  // A bare list of names doesn't say what shipped; the docs page's one-liner does.
  const summary = item && change.kind === "new" ? getComponentDoc(item.name)?.frontmatter.description : undefined;
  return (
    <li className="text-sm text-muted-foreground text-pretty">
      {item ? (
        <Link
          href={`/docs/components/${item.name}`}
          className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
        >
          {item.title}
        </Link>
      ) : null}
      {item && (change.note || summary) ? <span aria-hidden="true"> · </span> : null}
      {change.note ? <Note text={change.note} /> : summary}
    </li>
  );
}

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Beta</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Changelog</h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          PixelDosa ships in small drops. During the beta, APIs can still change, and when one does it's listed here
          first, marked <span className="font-medium text-foreground">Breaking</span>.
        </p>
      </header>

      <ol className="mt-14 flex flex-col">
        {CHANGELOG.map((entry, index) => {
          const groups = KIND_ORDER.map((kind) => ({
            kind,
            changes: entry.changes.filter((change) => change.kind === kind),
          })).filter((group) => group.changes.length > 0);

          return (
            <li key={entry.id} id={entry.id} className="grid scroll-mt-20 gap-3 border-t py-10 sm:grid-cols-[10rem_1fr] sm:gap-8">
              <div className="sm:sticky sm:top-20 sm:self-start">
                <time dateTime={entry.date} className="text-sm text-muted-foreground tabular-nums">
                  {formatDate(entry.date)}
                </time>
                {index === 0 ? (
                  <span className="ml-2 rounded-full border px-1.5 py-px text-[0.625rem] font-medium uppercase tracking-wider text-foreground sm:ml-0 sm:mt-2 sm:inline-block">
                    Latest
                  </span>
                ) : null}
              </div>

              <article aria-labelledby={`${entry.id}-title`} className="min-w-0">
                <h2 id={`${entry.id}-title`} className="text-xl font-semibold tracking-tight text-balance">
                  <a href={`#${entry.id}`} className="hover:underline hover:underline-offset-4">
                    {entry.title}
                  </a>
                </h2>
                <p className="mt-2 text-muted-foreground text-pretty">{entry.summary}</p>

                <div className="mt-6 flex flex-col gap-5">
                  {groups.map((group) => (
                    <section key={group.kind} aria-label={KIND_LABEL[group.kind]}>
                      <h3
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          group.kind === "breaking" ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        {KIND_LABEL[group.kind]}
                        <span className="ml-1.5 tabular-nums text-muted-foreground/60">{group.changes.length}</span>
                      </h3>
                      <ul className="mt-2 flex flex-col gap-2.5">
                        {group.changes.map((change, changeIndex) => (
                          <ChangeLine key={changeIndex} change={change} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
