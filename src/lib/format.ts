import type { EmailOutput, MeetingOutput, PlannerOutput, ResearchOutput } from "./tool-types";

const clean = (items: string[]) => items.map((s) => s.trim()).filter(Boolean);
const bullets = (items: string[]) => clean(items).map((s) => `• ${s}`).join("\n");
const section = (title: string, body: string) => (body.trim() ? `${title}\n${body}` : "");
const join = (parts: string[]) => parts.filter(Boolean).join("\n\n");

export function emailToText(o: EmailOutput) {
  return `Subject: ${o.subject.trim()}\n\n${o.body.trim()}`;
}

export function meetingToText(o: MeetingOutput) {
  const rows = o.action_items
    .filter((a) => a.task.trim())
    .map((a) => `• ${a.task.trim()} — Owner: ${a.owner.trim() || "Unassigned"} — Deadline: ${a.deadline.trim() || "Not specified"}`)
    .join("\n");
  return join([
    section("SUMMARY", o.summary.trim()),
    section("KEY POINTS", bullets(o.key_points)),
    section("DECISIONS", bullets(o.decisions)),
    section("ACTION ITEMS", rows),
  ]);
}

export function plannerToText(o: PlannerOutput) {
  const schedule = o.schedule
    .map((d) => {
      const blocks = d.blocks
        .filter((b) => b.task.trim())
        .map((b) => `  ${b.time.trim()}  ${b.task.trim()} [${b.quadrant}]`)
        .join("\n");
      return blocks ? `${d.day.trim()}\n${blocks}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  return join([
    section(
      "PRIORITIES (EISENHOWER MATRIX)",
      join([
        section("Do first (urgent + important):", bullets(o.matrix.do_first)),
        section("Schedule (important, not urgent):", bullets(o.matrix.schedule)),
        section("Delegate (urgent, not important):", bullets(o.matrix.delegate)),
        section("Eliminate (neither):", bullets(o.matrix.eliminate)),
      ]),
    ),
    section("SCHEDULE", schedule),
    section("TIME-OPTIMISATION TIPS", bullets(o.tips)),
    section("ASSUMPTIONS TO CHECK", bullets(o.assumptions)),
  ]);
}

export function researchToText(o: ResearchOutput) {
  return join([
    section("SUMMARY", o.summary.trim()),
    section("KEY INSIGHTS", bullets(o.key_insights)),
    section("RECOMMENDATIONS", bullets(o.recommendations)),
    section("THINGS TO VERIFY", bullets(o.things_to_verify)),
  ]);
}
