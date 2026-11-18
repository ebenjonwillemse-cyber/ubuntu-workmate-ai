import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EditableList, EditableTable, EditableText, Field, OutputSection } from "@/components/app/editable";
import { ToolWorkspace } from "@/components/app/tool-workspace";
import { Textarea } from "@/components/ui/textarea";
import { meetingToText } from "@/lib/format";
import type { ActionItem, MeetingInput, MeetingOutput } from "@/lib/tool-types";
import { toolById } from "@/lib/tools";
import { useToolRunner } from "@/lib/use-tool-runner";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
      { name: "description", content: "Paste meeting notes and get a summary, key points, decisions and an action-item table with owners and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — AI Workplace Assistant" },
      { property: "og:description", content: "Turn raw meeting notes into clear minutes and action items." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeetingPage,
});

const titleFor = (_: MeetingInput, o: MeetingOutput) => `Meeting: ${o.summary}`;
const EMPTY_ROW: ActionItem = { task: "", owner: "Unassigned", deadline: "Not specified" };

function MeetingPage() {
  const tool = toolById("meeting");
  const [notes, setNotes] = useState("");
  const { output, setOutput, loading, run, regenerate } = useToolRunner("meeting", titleFor);

  return (
    <ToolWorkspace
      tool={tool}
      intro="Paste your raw notes or transcript. You'll get tidy minutes with owners and deadlines."
      submitLabel="Summarise notes"
      canSubmit={notes.trim().length >= 20}
      loading={loading}
      hasOutput={!!output}
      onSubmit={() => run({ tool: "meeting", notes })}
      onRegenerate={regenerate}
      getCopyText={() => (output ? meetingToText(output) : "")}
      emptyHint="Summary, key points, decisions and an action-item table will appear here."
      inputs={
        <Field id="notes" label="Meeting notes" hint="At least 20 characters. Remove personal details you don't need.">
          <Textarea
            id="notes"
            rows={14}
            value={notes}
            maxLength={20000}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"Weekly ops sync — Tue\nThandi: Joburg warehouse stock count late, needs extra hands\nAgreed to move go-live to 1 Dec\nPieter to send revised budget by Friday\n..."}
          />
        </Field>
      }
    >
      {output && (
        <div className="space-y-6">
          <OutputSection title="Summary">
            <EditableText label="Summary" value={output.summary} onChange={(summary) => setOutput({ ...output, summary })} />
          </OutputSection>
          <OutputSection title="Key points">
            <EditableList label="Key points" items={output.key_points} onChange={(key_points) => setOutput({ ...output, key_points })} />
          </OutputSection>
          <OutputSection title="Decisions">
            <EditableList
              label="Decisions"
              items={output.decisions}
              emptyText="No clear decisions recorded"
              onChange={(decisions) => setOutput({ ...output, decisions })}
            />
          </OutputSection>
          <OutputSection title="Action items">
            <EditableTable
              label="Action items"
              rows={output.action_items}
              newRow={EMPTY_ROW}
              onChange={(action_items) => setOutput({ ...output, action_items })}
              columns={[
                { key: "task", label: "Action", className: "w-1/2" },
                { key: "owner", label: "Owner" },
                { key: "deadline", label: "Deadline" },
              ]}
            />
          </OutputSection>
        </div>
      )}
    </ToolWorkspace>
  );
}
