import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { addActivity } from "./activity";
import { runTool } from "./ai.functions";
import type { ToolInput, ToolOutputMap } from "./tool-types";

type InputFor<T extends ToolInput["tool"]> = Extract<ToolInput, { tool: T }>;

export function useToolRunner<T extends ToolInput["tool"]>(
  tool: T,
  activityTitle: (input: InputFor<T>, output: ToolOutputMap[T]) => string,
) {
  const run$ = useServerFn(runTool);
  const [output, setOutput] = useState<ToolOutputMap[T] | null>(null);
  const [loading, setLoading] = useState(false);
  const lastInput = useRef<InputFor<T> | null>(null);

  const run = useCallback(
    async (input: InputFor<T>, opts?: { regenerate?: boolean }) => {
      lastInput.current = input;
      setLoading(true);
      try {
        const res = await run$({ data: input });
        if (!res.ok) {
          toast.error("Couldn't generate", { description: res.error });
          return;
        }
        const data = res.data as ToolOutputMap[T];
        setOutput(data);
        addActivity(tool, activityTitle(input, data));
        toast.success(
          opts?.regenerate ? "Fresh version generated" : "Done — review and edit below",
        );
      } catch (err) {
        console.error(err);
        toast.error("Couldn't generate", {
          description: "Check your inputs and connection, then try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [run$, tool, activityTitle],
  );

  const regenerate = useCallback(() => {
    if (lastInput.current) void run(lastInput.current, { regenerate: true });
  }, [run]);

  return { output, setOutput, loading, run, regenerate, canRegenerate: lastInput.current !== null };
}
