import { Copy, RefreshCw, Wand2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ToolMeta } from "@/lib/tools";

type Props = {
  tool: ToolMeta;
  intro: string;
  inputs: ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  canSubmit: boolean;
  loading: boolean;
  hasOutput: boolean;
  getCopyText: () => string;
  onRegenerate: () => void;
  emptyHint: string;
  children: ReactNode;
};

export function ToolWorkspace(props: Props) {
  const { tool, loading, hasOutput } = props;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (props.canSubmit && !loading) props.onSubmit();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.getCopyText());
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select the text and copy manually");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-start gap-3 animate-fade-up">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <tool.icon className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{tool.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{props.intro}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-20"
          aria-label="Inputs"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your input
          </h2>
          <div className="space-y-4">{props.inputs}</div>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="mt-6 w-full"
            disabled={!props.canSubmit || loading}
          >
            {loading ? <Spinner /> : <Wand2 />}
            {loading ? "Generating…" : props.submitLabel}
          </Button>
        </form>

        <section
          className="min-h-[420px] rounded-2xl border bg-card shadow-card"
          aria-label="AI output"
          aria-busy={loading}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI output
              </h2>
              {hasOutput && (
                <p className="text-xs text-muted-foreground">
                  Editable — click any text to change it.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copy}
                disabled={!hasOutput || loading}
              >
                <Copy /> Copy
              </Button>
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={props.onRegenerate}
                disabled={!hasOutput || loading}
              >
                <RefreshCw className={loading ? "animate-spin" : undefined} /> Regenerate
              </Button>
            </div>
          </div>

          <div className="relative p-5">
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-b-2xl bg-card/80 backdrop-blur-[2px]">
                <Spinner className="size-7 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Thinking it through…</p>
              </div>
            )}
            {hasOutput ? (
              <div className="animate-fade-up">{props.children}</div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <tool.icon className="size-6" />
                </span>
                <p className="max-w-xs text-sm text-muted-foreground">{props.emptyHint}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
