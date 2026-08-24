import { useEffect, useMemo, useState } from "react";
import { clusters, core, totalAgents, type Agent, type Cluster } from "@/lib/agents";

const CX = 450;
const CY = 380;
const R1 = 210;
const R2 = 108;

type Positioned = {
  agent: Agent;
  cluster: Cluster;
  x: number;
  y: number;
  hubX: number;
  hubY: number;
  id: string;
};

type HubPos = { cluster: Cluster; x: number; y: number; lx: number; ly: number; anchor: "start" | "middle" | "end" };

type Selection =
  | { kind: "agent"; agent: Agent; cluster: Cluster }
  | { kind: "core" }
  | { kind: "cluster"; cluster: Cluster }
  | null;

const statusVar: Record<Agent["status"], string> = {
  active: "var(--status-active)",
  idle: "var(--status-idle)",
  waiting: "var(--status-waiting)",
  "human-gate": "var(--status-gate)",
};

const statusLabel: Record<Agent["status"], string> = {
  active: "Active",
  idle: "Idle",
  waiting: "Waiting on input",
  "human-gate": "Human gate",
};

function useLayout() {
  return useMemo(() => {
    const hubs: HubPos[] = [];
    const nodes: Positioned[] = [];

    clusters.forEach((cl, i) => {
      const angle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
      const hx = CX + R1 * Math.cos(angle);
      const hy = CY + R1 * Math.sin(angle);
      const lx = CX + R1 * 1.16 * Math.cos(angle);
      const ly = CY + R1 * 1.16 * Math.sin(angle);
      const anchor: "start" | "middle" | "end" = Math.cos(angle) > 0.25 ? "start" : Math.cos(angle) < -0.25 ? "end" : "middle";
      hubs.push({ cluster: cl, x: hx, y: hy, lx, ly, anchor });

      const spread = Math.min(cl.agents.length * 0.42, 2.3);
      cl.agents.forEach((agent, j) => {
        const t = cl.agents.length === 1 ? 0 : j / (cl.agents.length - 1) - 0.5;
        const a2 = angle + t * spread;
        nodes.push({
          agent,
          cluster: cl,
          x: hx + R2 * Math.cos(a2),
          y: hy + R2 * Math.sin(a2),
          hubX: hx,
          hubY: hy,
          id: `${cl.key}:${agent.name}`,
        });
      });
    });

    return { hubs, nodes };
  }, []);
}

export default function AgentConstellation() {
  const { hubs, nodes } = useLayout();
  const [selected, setSelected] = useState<Selection>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeClusterKey =
    hovered && hovered !== "core" ? hovered.split(":")[0] : selected?.kind === "agent" ? selected.cluster.key : selected?.kind === "cluster" ? selected.cluster.key : null;

  const focusMode = hovered !== null || selected !== null;

  const selectedId =
    selected?.kind === "agent" ? `${selected.cluster.key}:${selected.agent.name}` : null;

  const dim = (key: string | null) =>
    focusMode && activeClusterKey && key !== activeClusterKey ? 0.22 : 1;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      <div className="starfield pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-10 flex-shrink-0 border-b border-border px-8 pb-4 pt-6">
        <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          CyberTrends AI · Operations chart
        </p>
        <h1 className="font-display text-[26px] font-medium tracking-tight">Agent constellation</h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
          {totalAgents} agents, {clusters.length} clusters, one Marketing Director at the core. Hover
          to trace an arm, click any star to open its live job dossier.
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <svg viewBox="0 0 900 760" className="block h-full w-full">
            <defs>
              <radialGradient id="coreGlow">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
              <filter id="soften" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            {/* orbit guide */}
            <circle
              cx={CX}
              cy={CY}
              r={R1}
              fill="none"
              stroke="var(--border-soft)"
              strokeWidth={0.5}
              strokeDasharray="2 6"
              opacity={mounted ? 0.8 : 0}
              style={{ transition: "opacity .8s ease" }}
            />

            {/* spokes */}
            {hubs.map((h, i) => {
              const isActive = activeClusterKey === h.cluster.key;
              return (
                <line
                  key={`spoke-${h.cluster.key}`}
                  x1={CX}
                  y1={CY}
                  x2={h.x}
                  y2={h.y}
                  stroke={h.cluster.hex}
                  strokeWidth={isActive ? 1.6 : 0.7}
                  strokeDasharray={isActive ? "6 6" : undefined}
                  opacity={mounted ? (isActive ? 0.95 : 0.5 * dim(h.cluster.key)) : 0}
                  style={{
                    transition: `opacity .5s ease ${i * 70}ms, stroke-width .25s ease`,
                    animation: isActive ? "dash-flow 1s linear infinite" : undefined,
                  }}
                />
              );
            })}

            {/* leaves */}
            {nodes.map((n, i) => {
              const isActive = activeClusterKey === n.cluster.key;
              const isSelected = selectedId === n.id || hovered === n.id;
              return (
                <line
                  key={`leaf-${n.id}`}
                  x1={n.hubX}
                  y1={n.hubY}
                  x2={n.x}
                  y2={n.y}
                  stroke={n.cluster.hex}
                  strokeWidth={isSelected ? 1.4 : 0.6}
                  opacity={mounted ? (isSelected ? 1 : (isActive ? 0.7 : 0.45) * dim(n.cluster.key)) : 0}
                  style={{ transition: `opacity .5s ease ${120 + i * 18}ms, stroke-width .25s ease` }}
                />
              );
            })}

            {/* core */}
            <g
              className="cursor-pointer"
              onClick={() => setSelected({ kind: "core" })}
              onMouseEnter={() => setHovered("core")}
              onMouseLeave={() => setHovered(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected({ kind: "core" })}
            >
              <circle cx={CX} cy={CY} r={78} fill="url(#coreGlow)" />
              <circle
                cx={CX}
                cy={CY}
                r={38}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1}
                opacity={0.45}
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  animation: "constellation-pulse 3.2s ease-out infinite",
                }}
              />
              <circle
                cx={CX}
                cy={CY}
                r={hovered === "core" || selected?.kind === "core" ? 34 : 30}
                fill="var(--primary-foreground)"
                stroke="var(--primary)"
                strokeWidth={1.4}
                style={{ transition: "r .25s cubic-bezier(.16,1,.3,1)" }}
              />
              <text
                x={CX}
                y={CY - 4}
                textAnchor="middle"
                fontSize={10}
                className="pointer-events-none font-mono"
                fill="var(--primary)"
              >
                MARKETING
              </text>
              <text
                x={CX}
                y={CY + 9}
                textAnchor="middle"
                fontSize={10}
                className="pointer-events-none font-mono"
                fill="var(--primary)"
              >
                DIRECTOR
              </text>
            </g>

            {/* hubs */}
            {hubs.map((h) => {
              const isActive = activeClusterKey === h.cluster.key;
              return (
                <g
                  key={`hub-${h.cluster.key}`}
                  className="cursor-pointer"
                  onClick={() => setSelected({ kind: "cluster", cluster: h.cluster })}
                  onMouseEnter={() => setHovered(`${h.cluster.key}:__hub`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={h.x} cy={h.y} r={22} fill={h.cluster.hex} opacity={isActive ? 0.18 : 0} style={{ transition: "opacity .25s ease" }} />
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={mounted ? (isActive ? 15 : 12) : 0}
                    fill={h.cluster.hex}
                    opacity={0.9 * dim(h.cluster.key)}
                    style={{ transition: "r .3s cubic-bezier(.16,1,.3,1), opacity .3s ease" }}
                  />
                  <text
                    x={h.lx}
                    y={h.ly}
                    textAnchor={h.anchor}
                    fontSize={13}
                    className="pointer-events-none font-display font-medium"
                    fill={h.cluster.hex}
                    opacity={mounted ? dim(h.cluster.key) : 0}
                    style={{ transition: "opacity .4s ease" }}
                  >
                    {h.cluster.name}
                  </text>
                  <text
                    x={h.lx}
                    y={h.ly + 14}
                    textAnchor={h.anchor}
                    fontSize={10}
                    className="pointer-events-none font-mono"
                    fill="var(--faint)"
                    opacity={mounted ? dim(h.cluster.key) : 0}
                    style={{ transition: "opacity .4s ease" }}
                  >
                    {h.cluster.agents.length} agents
                  </text>
                </g>
              );
            })}

            {/* agent stars */}
            {nodes.map((n, i) => {
              const isHovered = hovered === n.id;
              const isSelected = selectedId === n.id;
              const live = n.agent.status === "active";
              return (
                <g
                  key={n.id}
                  className="cursor-pointer"
                  onClick={() => setSelected({ kind: "agent", agent: n.agent, cluster: n.cluster })}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={n.x} cy={n.y} r={16} fill="transparent" />
                  {live && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={6}
                      fill="none"
                      stroke={n.cluster.hex}
                      strokeWidth={1.2}
                      style={{
                        transformOrigin: `${n.x}px ${n.y}px`,
                        animation: `constellation-pulse 3s ease-out ${i * 0.18}s infinite`,
                      }}
                    />
                  )}
                  {(isHovered || isSelected) && (
                    <circle cx={n.x} cy={n.y} r={13} fill={n.cluster.hex} opacity={0.3} filter="url(#soften)" />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={mounted ? (isHovered || isSelected ? 8 : 5) : 0}
                    fill={n.cluster.hex}
                    opacity={(isHovered || isSelected ? 1 : 0.85) * dim(n.cluster.key)}
                    style={{
                      transition: `r .25s cubic-bezier(.16,1,.3,1) ${mounted ? "0s" : `${i * 20}ms`}, opacity .3s ease`,
                    }}
                  />
                  {isHovered && (
                    <text
                      x={n.x}
                      y={n.y - 15}
                      textAnchor="middle"
                      fontSize={11}
                      className="pointer-events-none font-mono"
                      fill="var(--foreground)"
                    >
                      {n.agent.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute bottom-6 left-8 z-10 flex max-w-lg flex-wrap gap-x-4 gap-y-2">
            {clusters.map((cl) => (
              <span
                key={cl.key}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
                style={{ opacity: dim(cl.key) }}
              >
                <i className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: cl.hex }} />
                {cl.name}
              </span>
            ))}
          </div>

          <div className="pointer-events-none absolute right-8 top-5 z-10 font-mono text-[11px] text-faint">
            hover to trace · click to open dossier · esc to close
          </div>
        </div>

        <aside
          className="flex-shrink-0 overflow-hidden border-l border-border bg-panel transition-[width] duration-[380ms] ease-[cubic-bezier(.16,1,.3,1)] max-md:absolute max-md:inset-0 max-md:z-20"
          style={{ width: selected ? 380 : 0, boxShadow: selected ? "var(--shadow-panel)" : "none" }}
          aria-hidden={!selected}
        >
          <div className="relative flex h-full w-[380px] flex-col max-md:w-full">
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close panel"
                className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-panel-2 hover:text-foreground"
              >
                ✕
              </button>
            )}
            {selected?.kind === "cluster" && (
              <ClusterPanel
                cluster={selected.cluster}
                onPick={(agent) => setSelected({ kind: "agent", agent, cluster: selected.cluster })}
              />
            )}
            {selected?.kind === "agent" && (
              <AgentPanel agent={selected.agent} tag={selected.cluster.name} hex={selected.cluster.hex} />
            )}
            {selected?.kind === "core" && (
              <AgentPanel agent={core} tag="Core agent" hex="#D9A94F" />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Agent["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: statusVar[status], boxShadow: `0 0 8px ${statusVar[status]}` }}
      />
      {statusLabel[status]}
    </span>
  );
}

function AgentPanel({ agent, tag, hex }: { agent: Agent; tag: string; hex: string }) {
  return (
    <div key={agent.name} className="animate-fade-rise flex h-full flex-col">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <span
          className="mb-3 inline-block rounded-sm px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ background: `${hex}22`, color: hex }}
        >
          {tag}
        </span>
        <p className="font-display text-[19px] font-medium leading-tight">{agent.name}</p>
        <p className="mt-1 font-mono text-[11px] text-faint">
          AGENT · {agent.name.toUpperCase().replace(/[^A-Z]+/g, "-")}
        </p>
        <div className="mt-3">
          <StatusDot status={agent.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border">
        {[
          { k: "Runs 24h", v: String(agent.runs24h) },
          { k: "Success", v: `${agent.successRate}%` },
          { k: "Model", v: agent.model },
        ].map((m) => (
          <div key={m.k} className="border-r border-border-soft px-4 py-3 last:border-r-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{m.k}</div>
            <div className="mt-1 truncate font-mono text-[12px] text-foreground">{m.v}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <Field label="Role">
          <p className="text-[13px] leading-relaxed text-muted-foreground">{agent.role}</p>
        </Field>
        <Field label="Receives">
          <Chip>{agent.input}</Chip>
        </Field>
        <Field label="Produces">
          <Chip>{agent.output}</Chip>
        </Field>
        <Field label="Tools">
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map((t) => (
              <span
                key={t}
                className="rounded border border-border bg-panel-2 px-2 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </Field>
        <Field label="Discord channel">
          <p className="font-mono text-[12px] text-primary">{agent.discord}</p>
        </Field>
      </div>
    </div>
  );
}

function ClusterPanel({ cluster, onPick }: { cluster: Cluster; onPick: (a: Agent) => void }) {
  return (
    <div key={cluster.key} className="animate-fade-rise flex h-full flex-col">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <span
          className="mb-3 inline-block rounded-sm px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ background: `${cluster.hex}22`, color: cluster.hex }}
        >
          {cluster.name} cluster
        </span>
        <p className="font-display text-[19px] font-medium leading-tight">
          {cluster.agents.length} agents in this arm
        </p>
        <p className="mt-1 font-mono text-[11px] text-faint">CLUSTER · {cluster.key.toUpperCase()}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">Agents</div>
        <div className="flex flex-col gap-1.5">
          {cluster.agents.map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => onPick(a)}
              className="flex items-center justify-between rounded-md border border-border bg-panel-2 px-3 py-2 text-left font-mono text-[12px] text-foreground transition-colors hover:border-muted-foreground hover:bg-accent"
            >
              <span className="truncate">{a.name}</span>
              <span
                className="ml-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: statusVar[a.status] }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{label}</div>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-panel-2 px-2.5 py-1.5 font-mono text-[12px] leading-relaxed text-foreground">
      {children}
    </div>
  );
}
