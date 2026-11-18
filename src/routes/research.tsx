import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EditableList, EditableText, Field, OutputSection } from "@/components/app/editable";
import { ToolWorkspace } from "@/components/app/tool-workspace";
import { Textarea } from "@/components/ui/textarea";
import { researchToText } from "@/lib/format";
import type { ResearchInput, ResearchOutput } from "@/lib/tool-types";
import { toolById } from "@/lib/tools";
import { useToolRunner } from "@/lib/use-tool-runner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      { name: "description", content: "Summarise a topic or article into key insights, recommendations and things to verify." },
      { property: "og:title", content: "AI Research Assistant — AI Workplace Assistant" },
      { property: "og:description", content: "Plain-language research summaries that flag what to fact-check." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResearchPage,
});

const titleFor = (i: ResearchInput) => `Research: ${i.content.split("\n")[0]}`;

function ResearchPage() {
  const tool = toolById("research");
  const [content, setContent] = useState("");
  const { output, setOutput, loading, run, regenerate } = useToolRunner("research", titleFor);

  return (
    <ToolWorkspace
      tool={tool}
      intro="Enter a topic or paste an article. You'll get a simple summary and a list of claims worth double-checking."
      submitLabel="Analyse"
      canSubmit={content.trim().length >= 3}
      loading={loading}
      hasOutput={!!output}
      onSubmit={() => run({ tool: "research", content })}
      onRegenerate={regenerate}
      getCopyText={() => (output ? researchToText(output) : "")}
      emptyHint="Summary, key insights, recommendations and things to verify will appear here."
      inputs={
        <Field id="content" label="Topic or article" hint="Topics use general knowledge only — no live web search.">
          <Textarea
            id="content"
            rows={14}
            value={content}
            maxLength={30000}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. How POPIA affects storing customer data in cloud CRMs — or paste an article here"
          />
        </Field>
      }
    >
      {output && (
        <div className="space-y-6">
          <OutputSection title="Simple summary">
            <EditableText label="Summary" value={output.summary} onChange={(summary) => setOutput({ ...output, summary })} />
          </OutputSection>
          <OutputSection title="Key insights">
            <EditableList label="Key insights" items={output.key_insights} onChange={(key_insights) => setOutput({ ...output, key_insights })} />
          </OutputSection>
          <OutputSection title="Recommendations">
            <EditableList
              label="Recommendations"
              items={output.recommendations}
              onChange={(recommendations) => setOutput({ ...output, recommendations })}
            />
          </OutputSection>
          <div className="rounded-xl border border-warning/30 bg-warning-soft p-4">
            <OutputSection title="Things to verify" tone="warning">
              <EditableList
                label="Things to verify"
                items={output.things_to_verify}
                onChange={(things_to_verify) => setOutput({ ...output, things_to_verify })}
              />
            </OutputSection>
          </div>
        </div>
      )}
    </ToolWorkspace>
  );
}
