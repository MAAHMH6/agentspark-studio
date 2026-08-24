export type Agent = {
  name: string;
  role: string;
  input: string;
  output: string;
  discord: string;
  status: "active" | "idle" | "waiting" | "human-gate";
  model: string;
  tools: string[];
  runs24h: number;
  successRate: number;
};

export type Cluster = {
  key: string;
  name: string;
  hex: string;
  agents: Agent[];
};

const a = (
  name: string,
  role: string,
  input: string,
  output: string,
  discord: string,
  status: Agent["status"],
  model: string,
  tools: string[],
  runs24h: number,
  successRate: number,
): Agent => ({ name, role, input, output, discord, status, model, tools, runs24h, successRate });

export const clusters: Cluster[] = [
  {
    key: "marketing",
    name: "Marketing",
    hex: "#8B7FE8",
    agents: [
      a("Content ideas", "Converts research into concrete content opportunities across every platform the agency posts to.", "Approved trends, competitor findings", "Idea brief: platform, hook, angle, audience, CTA", "#content-ideas", "active", "claude-sonnet", ["Obsidian", "Trend store", "Discord"], 38, 96),
      a("Reel / video script", "Turns an approved idea into a full shot-by-shot script with hook, scenes, voiceover and on-screen text.", "Approved content idea", "Full script saved to the Obsidian vault", "#scripts", "active", "gpt-5-mini", ["Obsidian", "Script templates"], 21, 94),
      a("Social copywriting", "Writes native, platform-specific copy — never the same text reused across channels.", "Approved idea + script", "Per-platform captions, hooks, hashtags, CTAs", "#posts", "active", "claude-sonnet", ["Brand memory", "Platform rules"], 44, 97),
      a("Creative production", "Produces the actual media — graphics, carousels, thumbnails, storyboards, and generated assets.", "Approved copy + creative brief", "Creative ID, file path, dimensions, version", "#content-production", "idle", "image-gen", ["Canvas render", "Asset store"], 17, 91),
      a("Content QA", "The final gate. Nothing reaches Postiz without passing brand, factual and platform checks.", "Finished creative + copy", "PASS, or REJECT with reason", "#content-approval", "waiting", "gpt-5", ["Brand rules", "Fact check"], 44, 99),
      a("SEO", "Runs keyword research, topic clusters, briefs and audits that feed the blog and search pipeline.", "Search Console data, competitor SEO", "Keyword sets, content briefs, meta titles", "#seo", "active", "gpt-5-mini", ["Search Console", "SERP API"], 12, 95),
      a("Postiz publishing", "Uploads media, schedules and publishes across every connected platform, and reports back on status.", "QA-passed, human-approved post", "Publish confirmation per platform", "#publishing", "active", "deterministic", ["Postiz API", "Media upload"], 31, 98),
    ],
  },
  {
    key: "intel",
    name: "Intelligence",
    hex: "#3FBF95",
    agents: [
      a("Trend research", "Scans search trends, Reddit, X, YouTube, news and competitors for what is relevant to each client right now.", "Client profile, industry focus", "Trend record with virality and brand-fit scores", "#research, #trends", "active", "gpt-5-mini", ["Reddit", "X", "YouTube", "News"], 96, 93),
      a("Competitor research", "Continuously watches competitor sites, offers, ads and viral posts to flag what changed and why it matters.", "Competitor watch-list", "What changed, what to learn, what not to copy", "#research", "active", "gpt-5-mini", ["Web crawl", "Ad library"], 48, 92),
      a("Analytics", "Measures every post at 1 hour, 24 hours and 7 days — reach, engagement, saves, conversions.", "Published post ID", "Performance report at each interval", "#analytics", "active", "deterministic", ["Platform APIs", "Metrics DB"], 120, 99),
      a("Marketing learning", "Turns analytics patterns into permanent, reusable marketing knowledge for the whole agency.", "Aggregated analytics across posts", "Learning entry saved to client memory", "#learnings", "idle", "claude-sonnet", ["Obsidian", "Metrics DB"], 8, 97),
      a("Funding & startup opportunity", "Tracks grants, accelerators and government programs relevant to CyberTrends and its projects.", "Ignite, P@SHA and program feeds", "Opportunity record with deadline and eligibility", "#funding, #opportunities", "idle", "gpt-5-mini", ["Program feeds", "Calendar"], 6, 90),
      a("Events", "Finds AI, startup and education events worth attending or sponsoring.", "Event calendars, industry feeds", "Event record with date, cost, priority", "#events", "idle", "gpt-5-mini", ["Event feeds"], 4, 89),
    ],
  },
  {
    key: "ops",
    name: "Operations",
    hex: "#4E9FE0",
    agents: [
      a("Approval", "The human approval gateway — nothing publishes without a reply in Discord.", "QA-passed post preview", "Routes to Postiz, back for edits, or closes the job", "monitors reply thread", "human-gate", "deterministic", ["Discord bot"], 44, 100),
      a("Task & operations", "Turns a plain instruction into a tracked task and manages it through its lifecycle.", "Natural-language instruction", "TASK-ID moving TODO → IN PROGRESS → COMPLETED", "#tasks", "active", "gpt-5-mini", ["Task DB", "Discord"], 63, 96),
    ],
  },
  {
    key: "back",
    name: "Back office",
    hex: "#8B8FA3",
    agents: [
      a("Obsidian memory", "Holds the agency long-term knowledge layer — client files, scripts, learnings, documentation.", "Structured output from every agent", "Organized markdown vault by client and topic", "—", "active", "n/a", ["Filesystem", "Vector index"], 210, 100),
      a("OmniRoute model router", "Routes every task to the right model — local Ollama for simple work, premium reasoning for high-value copy.", "Task type request (e.g. high_quality_copywriting)", "Selected model + fallback, OpenAI-compatible", "—", "active", "router", ["Ollama", "OpenAI-compatible gateway"], 480, 99),
    ],
  },
  {
    key: "deals",
    name: "Deals",
    hex: "#E0793F",
    agents: [
      a("Lead follow-up", "Makes sure no lead is ever forgotten, on a fixed day-0 / day-1 / day-3 / day-7 cadence.", "New or stalled lead", "Status: NEW → CONTACTED → QUALIFIED → WON/LOST", "#leads, #follow-ups", "active", "gpt-5-mini", ["CRM", "Email"], 27, 94),
      a("Partnership", "Runs the full partnership workflow from scored prospect to signed, tracked partner.", "Candidate partner or referral idea", "Personalized proposal, pending human approval", "—", "waiting", "claude-sonnet", ["CRM", "Docs"], 5, 88),
    ],
  },
  {
    key: "sales",
    name: "Sales",
    hex: "#D9A94F",
    agents: [
      a("Sales", "Qualifies interest, explains offers, and flags hot leads for a human to close.", "Inbound product question or inquiry", "Hot-lead alert with intent and recommended action", "#sales", "active", "claude-sonnet", ["CRM", "Offer catalog"], 34, 95),
      a("Outreach", "Researches targets first, then generates personalized outreach — never spam.", "Target list (teachers, schools, partners)", "Personalized message, held for approval and limits", "#outreach", "waiting", "gpt-5", ["Enrichment", "Email", "Rate limiter"], 19, 91),
    ],
  },
  {
    key: "customer",
    name: "Customer",
    hex: "#E0709B",
    agents: [
      a("Customer support", "Classifies every inbound message and auto-answers the simple ones.", "Message from Facebook, WhatsApp, IG, chat, email", "Classification: QUESTION, COMPLAINT, URGENT, etc.", "#customer-support", "active", "gpt-5-mini", ["Inbox APIs", "FAQ memory"], 88, 96),
      a("Email", "Generates and tracks every business email the agency sends.", "Outreach or support context", "Draft → Approved → Sent → Replied tracking", "#emails", "active", "gpt-5-mini", ["SMTP", "Tracking"], 41, 97),
    ],
  },
];

export const core: Agent = {
  name: "Marketing director",
  role: "Central manager of the whole agency. Reads every Discord command, breaks it into a job, assigns the right specialist agents, tracks status end to end, and escalates real decisions to a human.",
  input: "Discord command: client, objective, deadline, platform, campaign",
  output: "JOB_ID, task breakdown, assigned agents, live status",
  discord: "all channels",
  status: "active",
  model: "gpt-5",
  tools: ["Discord", "Task DB", "OmniRoute", "Obsidian"],
  runs24h: 152,
  successRate: 98,
};

export const totalAgents = clusters.reduce((n, c) => n + c.agents.length, 0) + 1;
