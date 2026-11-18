import { describe, expect, it } from "vitest";

import { CHAT_SPEC, SPECS, buildSystemPrompt } from "@/lib/ai-prompts.server";

const all = { ...SPECS, chat: CHAT_SPEC };

describe("structured system prompts", () => {
  for (const [name, spec] of Object.entries(all)) {
    it(`${name} prompt sets role, task, output format and constraints`, () => {
      const prompt = buildSystemPrompt(spec);
      const headings = ["ROLE", "TASK", "OUTPUT FORMAT", "CONSTRAINTS"].map((h) =>
        prompt.indexOf(`${h}\n`),
      );
      expect(headings.every((i) => i >= 0)).toBe(true);
      expect([...headings].sort((a, b) => a - b)).toEqual(headings);
    });

    it(`${name} prompt forbids invented facts and asks to flag uncertainty`, () => {
      const prompt = buildSystemPrompt(spec).toLowerCase();
      expect(prompt).toContain("do not invent facts");
      expect(prompt).toContain("flag uncertainty");
      expect(prompt).toContain("concise");
    });
  }
});
