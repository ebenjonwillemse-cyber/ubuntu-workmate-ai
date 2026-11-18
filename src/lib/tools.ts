import {
  CalendarClock,
  FileText,
  Mail,
  MessagesSquare,
  Search,
  type LucideIcon,
} from "lucide-react";

export type ToolId = "email" | "meeting" | "planner" | "research" | "chat";

export type ToolMeta = {
  id: ToolId;
  title: string;
  short: string;
  description: string;
  path: "/email" | "/meeting-notes" | "/task-planner" | "/research" | "/chat";
  icon: LucideIcon;
};

export const TOOLS: ToolMeta[] = [
  {
    id: "email",
    title: "Smart Email Generator",
    short: "Email",
    description: "Draft clear emails for clients, managers or your team in the right tone.",
    path: "/email",
    icon: Mail,
  },
  {
    id: "meeting",
    title: "Meeting Notes Summarizer",
    short: "Meeting notes",
    description: "Turn messy notes into a summary, decisions and an action-item table.",
    path: "/meeting-notes",
    icon: FileText,
  },
  {
    id: "planner",
    title: "AI Task Planner",
    short: "Task planner",
    description: "Prioritise with the Eisenhower matrix and get a realistic schedule.",
    path: "/task-planner",
    icon: CalendarClock,
  },
  {
    id: "research",
    title: "AI Research Assistant",
    short: "Research",
    description: "Summarise a topic or article with insights and what to double-check.",
    path: "/research",
    icon: Search,
  },
  {
    id: "chat",
    title: "AI Chatbot",
    short: "Chatbot",
    description: "Ask a workplace assistant anything, from wording to planning.",
    path: "/chat",
    icon: MessagesSquare,
  },
];

export const toolById = (id: ToolId) => TOOLS.find((t) => t.id === id)!;
