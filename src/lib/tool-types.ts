// Client-safe shapes shared by the server function, the editors and the copy formatter.

export type EmailInput = {
  tool: "email";
  audience: "Client" | "Manager" | "Team";
  tone: "Formal" | "Friendly" | "Persuasive";
  purpose: string;
  keyPoints: string;
};
export type MeetingInput = { tool: "meeting"; notes: string };
export type PlannerInput = { tool: "planner"; tasks: string; deadlines: string; hours: string };
export type ResearchInput = { tool: "research"; content: string };
export type ToolInput = EmailInput | MeetingInput | PlannerInput | ResearchInput;

export type EmailOutput = { subject: string; body: string };

export type ActionItem = { task: string; owner: string; deadline: string };
export type MeetingOutput = {
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: ActionItem[];
};

export type Quadrant = "Do first" | "Schedule" | "Delegate" | "Eliminate";
export type ScheduleBlock = { time: string; task: string; quadrant: Quadrant };
export type ScheduleDay = { day: string; blocks: ScheduleBlock[] };
export type PlannerOutput = {
  matrix: { do_first: string[]; schedule: string[]; delegate: string[]; eliminate: string[] };
  schedule: ScheduleDay[];
  tips: string[];
  assumptions: string[];
};

export type ResearchOutput = {
  summary: string;
  key_insights: string[];
  recommendations: string[];
  things_to_verify: string[];
};

export type ToolOutputMap = {
  email: EmailOutput;
  meeting: MeetingOutput;
  planner: PlannerOutput;
  research: ResearchOutput;
};

export type ToolResult =
  | { ok: true; tool: "email"; data: EmailOutput }
  | { ok: true; tool: "meeting"; data: MeetingOutput }
  | { ok: true; tool: "planner"; data: PlannerOutput }
  | { ok: true; tool: "research"; data: ResearchOutput }
  | { ok: false; error: string };
