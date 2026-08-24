import { createFileRoute } from "@tanstack/react-router";
import AgentConstellation from "@/components/AgentConstellation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Constellation — CyberTrends AI Operations Chart" },
      {
        name: "description",
        content:
          "Interactive map of the CyberTrends AI agent network: 24 agents across 7 clusters with live status, tools, inputs, outputs and Discord channels.",
      },
      { property: "og:title", content: "Agent Constellation — CyberTrends AI Operations Chart" },
      {
        property: "og:description",
        content:
          "Explore every AI agent in the CyberTrends stack — role, model, tools, and where its output lands.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <AgentConstellation />;
}
