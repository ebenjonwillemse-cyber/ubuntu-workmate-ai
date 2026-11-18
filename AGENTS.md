<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- AI calls run server-side only: structured tools go through `runTool` in `src/lib/ai.functions.ts` (JSON-schema output), chat streams plain text from `src/routes/api/chat.ts`. Why: keeps the gateway key off the client and gives editable, typed results.
- Every AI feature's system prompt is built with `buildSystemPrompt` in `src/lib/ai-prompts.server.ts` (ROLE / TASK / OUTPUT FORMAT / CONSTRAINTS + shared constraints); `src/test/prompts.test.ts` enforces this. Why: consistent, testable responsible-AI behaviour.
- No login and no database: recent activity and chat history live in browser localStorage (`src/lib/activity.ts`, chat page). Why: the product is intentionally account-free.
- Tool pages share `ToolWorkspace` (input left, editable output right, Copy/Regenerate) and the editors in `src/components/app/editable.tsx`. Why: identical UX across tools.
