"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { slugify } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in (node as any)) {
    return textOf((node as any).props.children);
  }
  return "";
}

export function NotesView({ markdown }: { markdown: string }) {
  // Build the TOC from H2 headings in source order.
  const toc = useMemo(() => {
    return [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => {
      const text = m[1].trim();
      return { id: slugify(text), text };
    });
  }, [markdown]);

  const hasContent = toc.length > 0 || /\S/.test(markdown.replace(/^#.*$/gm, ""));

  if (!markdown.trim() || !hasContent) {
    return (
      <EmptyState
        title="No notes written yet"
        hint="The scribe adds a note to learned-concepts.md after each concept is learned."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Floating TOC */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            On this page
          </p>
          <nav className="space-y-1 border-l border-zinc-800">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block border-l-2 border-transparent -ml-px py-1 pl-3 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <article className="prose-notes min-w-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
          components={{
            h2: ({ children, ...props }) => (
              <h2 id={slugify(textOf(children))} {...props}>
                {children}
              </h2>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
