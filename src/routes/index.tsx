import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { clearActivity, useActivity } from "@/lib/activity";
import { TOOLS, toolById } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your AI productivity hub: write emails, summarise meetings, plan tasks, research topics and chat with a workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Five AI tools that help South African professionals get through the work day faster.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const activity = useActivity();
  const [hello, setHello] = useState("Welcome back");
  useEffect(() => setHello(greeting(new Date().getHours())), []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-8 md:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated md:p-10 animate-fade-up">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium opacity-80">{hello} 👋</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            What are we getting off your plate today?
          </h1>
          <p className="mt-3 max-w-xl text-sm opacity-85 md:text-base">
            Draft emails, tidy meeting notes, plan your week and research faster — then review, edit
            and make it yours.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/email">
                Write an email <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/chat">Ask the assistant</Link>
            </Button>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full border border-primary-foreground/10"
        />
      </section>

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="mb-4 text-lg font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <tool.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{tool.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
          <Link
            to="/responsible-ai"
            className="flex flex-col rounded-2xl border border-dashed bg-muted/40 p-5 transition-colors hover:border-primary/30"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-success-soft text-success">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">Use AI responsibly</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Limitations, bias, privacy and why human review matters.
            </p>
          </Link>
        </div>
      </section>

      <section aria-labelledby="recent" className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="recent" className="text-lg font-semibold text-foreground">
            Recent activity
          </h2>
          {activity.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearActivity}>
              <Trash2 /> Clear
            </Button>
          )}
        </div>
        {activity.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <Clock className="size-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing yet. Things you generate will show up here (saved only in this browser).
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {activity.map((a) => {
              const tool = toolById(a.tool);
              return (
                <li key={a.id}>
                  <Link
                    to={tool.path}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <tool.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {a.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">{tool.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(a.at, { addSuffix: true })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
