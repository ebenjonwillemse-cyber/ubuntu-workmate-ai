# Ubuntu Workmate Ai

Build a modern, responsive web app called "AI Workplace Productivity Assistant" for South African professionals. SaaS-style dashboard: left sidebar navigation (collapsible into a hamburger menu on mobile), clean white/indigo theme, card-based layout, loading spinners, and toast notifications.

Pages (each with an input panel on the left and an AI output panel on the right, and the output must be editable, with Copy and Regenerate buttons):

1. Smart Email Generator – inputs: recipient audience (Client / Manager / Team), tone (Formal / Friendly / Persuasive), purpose, key points. Output: subject line + email body.

2. Meeting Notes Summarizer – input: pasted notes. Output in sections: Summary, Key Points, Decisions, Action Items (table with Owner and Deadline).

3. AI Task Planner – inputs: task list, deadlines, available hours. Output: a daily/weekly schedule prioritised by urgency and importance (Eisenhower matrix), plus time-optimisation tips.

4. AI Research Assistant – input: topic or pasted article. Output: simple summary, key insights, recommendations, and "things to verify".

5. AI Chatbot – chat interface with message history, typing indicator and suggested prompts, acting as a workplace assistant.

Home dashboard: welcome message, quick-action cards for each tool, and a "Recent activity" list.

Use Lovable AI/Cloud to call an LLM. Each feature must use a structured system prompt that sets a role, the task, the output format, and constraints (be concise, don't invent facts, flag uncertainty).

Responsible AI: show a persistent footer disclaimer ("AI-generated content may be inaccurate or biased. Review before use. Don't enter confidential or personal information.") plus a short "Responsible AI" page covering limitations, bias, privacy and human review.

no login and backend required

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/65d97395-0216-49aa-875d-1682d16c67e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
