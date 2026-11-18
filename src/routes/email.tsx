import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EditableText, Field, OutputSection } from "@/components/app/editable";
import { Segmented } from "@/components/app/segmented";
import { ToolWorkspace } from "@/components/app/tool-workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emailToText } from "@/lib/format";
import type { EmailInput, EmailOutput } from "@/lib/tool-types";
import { toolById } from "@/lib/tools";
import { useToolRunner } from "@/lib/use-tool-runner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Generate professional emails for clients, managers or your team in a formal, friendly or persuasive tone." },
      { property: "og:title", content: "Smart Email Generator — AI Workplace Assistant" },
      { property: "og:description", content: "Draft clear, on-tone workplace emails in seconds, then edit and copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const AUDIENCES = ["Client", "Manager", "Team"] as const;
const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const titleFor = (_: EmailInput, o: EmailOutput) => `Email: ${o.subject}`;

function EmailPage() {
  const tool = toolById("email");
  const [audience, setAudience] = useState<EmailInput["audience"]>("Client");
  const [tone, setTone] = useState<EmailInput["tone"]>("Formal");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const { output, setOutput, loading, run, regenerate } = useToolRunner("email", titleFor);

  return (
    <ToolWorkspace
      tool={tool}
      intro="Pick who it's for and the tone, describe the purpose, and list what must be said."
      submitLabel="Generate email"
      canSubmit={purpose.trim().length >= 3}
      loading={loading}
      hasOutput={!!output}
      onSubmit={() => run({ tool: "email", audience, tone, purpose, keyPoints })}
      onRegenerate={regenerate}
      getCopyText={() => (output ? emailToText(output) : "")}
      emptyHint="Your subject line and email body will appear here, ready to edit."
      inputs={
        <>
          <Field id="audience" label="Recipient audience">
            <Segmented id="audience" value={audience} options={AUDIENCES} onChange={setAudience} />
          </Field>
          <Field id="tone" label="Tone">
            <Segmented id="tone" value={tone} options={TONES} onChange={setTone} />
          </Field>
          <Field id="purpose" label="Purpose">
            <Input
              id="purpose"
              value={purpose}
              maxLength={1000}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow up on the Q3 proposal and request sign-off"
            />
          </Field>
          <Field id="keypoints" label="Key points" hint="One per line. Leave out confidential details.">
            <Textarea
              id="keypoints"
              rows={6}
              value={keyPoints}
              maxLength={4000}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"Pricing valid until month-end\nImplementation can start in 2 weeks\nHappy to set up a call"}
            />
          </Field>
        </>
      }
    >
      {output && (
        <div className="space-y-5">
          <OutputSection title="Subject line">
            <EditableText
              label="Subject line"
              value={output.subject}
              onChange={(subject) => setOutput({ ...output, subject })}
              className="font-display text-base font-semibold"
            />
          </OutputSection>
          <OutputSection title="Email body">
            <EditableText label="Email body" value={output.body} onChange={(body) => setOutput({ ...output, body })} />
          </OutputSection>
        </div>
      )}
    </ToolWorkspace>
  );
}
