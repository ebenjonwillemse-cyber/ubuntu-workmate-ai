import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Eye, Lock, Scale, UserCheck } from "lucide-react";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "How to use AI-generated content safely: limitations, bias, privacy (POPIA) and human review.",
      },
      { property: "og:title", content: "Responsible AI — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Limitations, bias, privacy and human review — what to know before you use AI output.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResponsibleAI,
});

const SECTIONS = [
  {
    icon: AlertTriangle,
    title: "Limitations",
    tone: "bg-warning-soft text-warning",
    points: [
      "AI can sound confident and still be wrong. It may get facts, figures, dates or names wrong.",
      "It has no live internet access here and may not know recent events, laws or prices.",
      "It only knows what you type. Missing context leads to generic or incorrect output.",
    ],
  },
  {
    icon: Scale,
    title: "Bias",
    tone: "bg-urgent-soft text-urgent",
    points: [
      "AI models learn from large amounts of public text that contain social and cultural biases.",
      "Watch for stereotypes about gender, race, language, age or region — including South African contexts.",
      "Rewrite anything that could be unfair, exclusionary or that doesn't fit your organisation's values.",
    ],
  },
  {
    icon: Lock,
    title: "Privacy",
    tone: "bg-primary-soft text-primary",
    points: [
      "Don't enter confidential company information, client data, ID numbers, health or financial details.",
      "Treat inputs as if they could be seen by others. Remove or anonymise personal information first.",
      "Follow POPIA and your employer's information-security policy when using any AI tool.",
    ],
  },
  {
    icon: UserCheck,
    title: "Human review",
    tone: "bg-success-soft text-success",
    points: [
      "Every output is a draft. You remain responsible for what you send, sign or decide.",
      "Check facts, numbers and commitments before sharing. Use the 'Things to verify' lists as a starting point.",
      "Get a qualified professional's input for legal, financial, HR or medical matters.",
    ],
  },
];

function ResponsibleAI() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-start gap-3 animate-fade-up">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Eye className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Responsible AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This assistant is built to help, not replace your judgement. Here's what to keep in
            mind.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className={`flex size-9 items-center justify-center rounded-lg ${s.tone}`}>
                <s.icon className="size-4" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50"
                    aria-hidden="true"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border bg-muted/50 p-5">
        <h2 className="text-base font-semibold text-foreground">How this app tries to help</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every tool gives the AI a clear role, task, output format and rules: be concise, don't
          invent facts, and flag anything uncertain (for example "Unassigned", "Not specified" or a
          "Things to verify" list). Nothing is stored on a server by this app — recent activity and
          chat history stay in your browser and can be cleared at any time.
        </p>
      </section>
    </div>
  );
}
