import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { EditableList, Field, OutputSection } from "@/components/app/editable";
import { ToolWorkspace } from "@/components/app/tool-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { plannerToText } from "@/lib/format";
import type { PlannerInput, PlannerOutput, Quadrant, ScheduleDay } from "@/lib/tool-types";
import { toolById } from "@/lib/tools";
import { useToolRunner } from "@/lib/use-tool-runner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Prioritise tasks with the Eisenhower matrix and get a daily or weekly schedule that fits your available hours.",
      },
      { property: "og:title", content: "AI Task Planner — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Urgent vs important, sorted — plus a realistic schedule and time-saving tips.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const QUADRANTS: {
  key: keyof PlannerOutput["matrix"];
  label: Quadrant;
  hint: string;
  tone: string;
}[] = [
  {
    key: "do_first",
    label: "Do first",
    hint: "Urgent · Important",
    tone: "border-urgent/25 bg-urgent-soft text-urgent",
  },
  {
    key: "schedule",
    label: "Schedule",
    hint: "Not urgent · Important",
    tone: "border-primary/25 bg-primary-soft text-primary",
  },
  {
    key: "delegate",
    label: "Delegate",
    hint: "Urgent · Not important",
    tone: "border-warning/30 bg-warning-soft text-warning",
  },
  {
    key: "eliminate",
    label: "Eliminate",
    hint: "Not urgent · Not important",
    tone: "border-border bg-muted text-muted-foreground",
  },
];
const QUADRANT_TONE: Record<Quadrant, string> = {
  "Do first": "bg-urgent-soft text-urgent",
  Schedule: "bg-primary-soft text-primary",
  Delegate: "bg-warning-soft text-warning",
  Eliminate: "bg-muted text-muted-foreground",
};

const titleFor = (i: PlannerInput) => {
  const n = i.tasks.split("\n").filter((l) => l.trim()).length;
  return `Plan for ${n} task${n === 1 ? "" : "s"}`;
};

function PlannerPage() {
  const tool = toolById("planner");
  const [tasks, setTasks] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [hours, setHours] = useState("");
  const { output, setOutput, loading, run, regenerate } = useToolRunner("planner", titleFor);

  const setDay = (i: number, day: ScheduleDay) =>
    output &&
    setOutput({ ...output, schedule: output.schedule.map((d, idx) => (idx === i ? day : d)) });

  return (
    <ToolWorkspace
      tool={tool}
      intro="List your tasks, add deadlines and how many hours you have. You'll get priorities and a schedule."
      submitLabel="Plan my time"
      canSubmit={tasks.trim().length >= 3}
      loading={loading}
      hasOutput={!!output}
      onSubmit={() => run({ tool: "planner", tasks, deadlines, hours })}
      onRegenerate={regenerate}
      getCopyText={() => (output ? plannerToText(output) : "")}
      emptyHint="An Eisenhower matrix, a day-by-day schedule and time-saving tips will appear here."
      inputs={
        <>
          <Field
            id="tasks"
            label="Task list"
            hint="One task per line. Add estimated durations if you know them."
          >
            <Textarea
              id="tasks"
              rows={7}
              value={tasks}
              maxLength={6000}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={
                "Finish board report (3h)\nReply to supplier queries\nPrep Monday team stand-up\nUpdate CRM records\nBook flights for Durban trip"
              }
            />
          </Field>
          <Field id="deadlines" label="Deadlines">
            <Textarea
              id="deadlines"
              rows={3}
              value={deadlines}
              maxLength={3000}
              onChange={(e) => setDeadlines(e.target.value)}
              placeholder={"Board report: Thursday 12:00\nFlights: by Friday"}
            />
          </Field>
          <Field id="hours" label="Available hours">
            <Input
              id="hours"
              value={hours}
              maxLength={300}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 5 hours a day, Mon–Fri, 08:00–14:00"
            />
          </Field>
        </>
      }
    >
      {output && (
        <div className="space-y-7">
          <OutputSection title="Eisenhower matrix">
            <div className="grid gap-3 sm:grid-cols-2">
              {QUADRANTS.map((q) => (
                <div key={q.key} className={cn("rounded-xl border p-3", q.tone)}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm font-semibold">{q.label}</span>
                    <span className="text-[11px] opacity-80">{q.hint}</span>
                  </div>
                  <div className="text-foreground">
                    <EditableList
                      label={q.label}
                      items={output.matrix[q.key]}
                      onChange={(items) =>
                        setOutput({ ...output, matrix: { ...output.matrix, [q.key]: items } })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </OutputSection>

          <OutputSection title="Schedule">
            <div className="space-y-4">
              {output.schedule.map((day, di) => (
                <div key={di} className="rounded-xl border">
                  <div className="border-b bg-muted/50 px-3 py-1.5">
                    <Input
                      aria-label={`Day ${di + 1} label`}
                      value={day.day}
                      onChange={(e) => setDay(di, { ...day, day: e.target.value })}
                      className="h-8 border-transparent bg-transparent px-1 font-display font-semibold shadow-none hover:border-input focus-visible:bg-background"
                    />
                  </div>
                  <ul className="divide-y">
                    {day.blocks.map((b, bi) => {
                      const setBlock = (patch: Partial<typeof b>) =>
                        setDay(di, {
                          ...day,
                          blocks: day.blocks.map((x, idx) => (idx === bi ? { ...x, ...patch } : x)),
                        });
                      return (
                        <li
                          key={bi}
                          className="flex flex-wrap items-start gap-2 px-2 py-1.5 sm:flex-nowrap"
                        >
                          <Input
                            aria-label="Time"
                            value={b.time}
                            onChange={(e) => setBlock({ time: e.target.value })}
                            className="h-8 w-32 shrink-0 border-transparent bg-transparent font-mono text-xs shadow-none hover:border-input focus-visible:bg-background"
                          />
                          <Textarea
                            rows={1}
                            aria-label="Task"
                            value={b.task}
                            onChange={(e) => setBlock({ task: e.target.value })}
                            className="field-sizing-content min-h-8 min-w-0 flex-1 resize-none border-transparent bg-transparent px-2 py-1.5 text-sm shadow-none hover:border-input focus-visible:bg-background"
                          />
                          <select
                            aria-label="Priority"
                            value={b.quadrant}
                            onChange={(e) => setBlock({ quadrant: e.target.value as Quadrant })}
                            className={cn(
                              "h-7 shrink-0 cursor-pointer rounded-full border-0 px-2.5 text-xs font-semibold",
                              QUADRANT_TONE[b.quadrant],
                            )}
                          >
                            {QUADRANTS.map((q) => (
                              <option key={q.label} value={q.label}>
                                {q.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove block"
                            onClick={() =>
                              setDay(di, {
                                ...day,
                                blocks: day.blocks.filter((_, idx) => idx !== bi),
                              })
                            }
                          >
                            <Trash2 className="text-muted-foreground" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="border-t px-2 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDay(di, {
                          ...day,
                          blocks: [...day.blocks, { time: "", task: "", quadrant: "Schedule" }],
                        })
                      }
                    >
                      <Plus /> Add block
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </OutputSection>

          <OutputSection title="Time-optimisation tips">
            <EditableList
              label="Tips"
              items={output.tips}
              onChange={(tips) => setOutput({ ...output, tips })}
            />
          </OutputSection>

          {output.assumptions.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning-soft p-4">
              <OutputSection title="Assumptions to check" tone="warning">
                <EditableList
                  label="Assumptions"
                  items={output.assumptions}
                  onChange={(assumptions) => setOutput({ ...output, assumptions })}
                />
              </OutputSection>
            </div>
          )}
        </div>
      )}
    </ToolWorkspace>
  );
}
