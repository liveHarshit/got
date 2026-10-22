import { useEffect, useMemo } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType, useReactFlow,
  type Node, type Edge, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import type { TreeState, TreePerson } from "@/lib/tree";
import { HOUSES, type HouseId } from "@/data/got";
import { portraitFor } from "@/lib/portraits";

const W = 150;
const H = 200;

type PersonNode = Node<{ person: TreePerson; dim: boolean; active: boolean }, "person">;

export const houseText: Record<HouseId, string> = {
  stark: "text-house-stark", targaryen: "text-house-targaryen", lannister: "text-house-lannister",
  baratheon: "text-house-baratheon", greyjoy: "text-house-greyjoy", tyrell: "text-house-tyrell",
  martell: "text-house-martell", tully: "text-house-tully", arryn: "text-house-arryn",
  bolton: "text-house-bolton", frey: "text-house-frey", dothraki: "text-house-dothraki",
};
export const houseBorder: Record<HouseId, string> = {
  stark: "border-house-stark", targaryen: "border-house-targaryen", lannister: "border-house-lannister",
  baratheon: "border-house-baratheon", greyjoy: "border-house-greyjoy", tyrell: "border-house-tyrell",
  martell: "border-house-martell", tully: "border-house-tully", arryn: "border-house-arryn",
  bolton: "border-house-bolton", frey: "border-house-frey", dothraki: "border-house-dothraki",
};

export function Portrait({ person, className = "" }: { person: TreePerson & { group?: string }; className?: string }) {
  const known = !person.unknown && (!!person.house || !!person.group);
  const img = person.charId && known ? portraitFor(person.charId) : undefined;
  if (!known)
    return (
      <div className={`relative flex items-center justify-center bg-unknown ${className}`}>
        <svg viewBox="0 0 100 100" className="h-3/4 w-3/4 fill-muted"><circle cx="50" cy="35" r="20" /><path d="M10 100 C10 65 90 65 90 100 Z" /></svg>
        <span className="absolute font-display text-4xl text-primary text-glow">?</span>
      </div>
    );
  if (img) return <img src={img} alt={person.name} loading="lazy" className={`object-cover ${person.dead ? "grayscale" : ""} ${className}`} />;
  return (
    <div className={`flex items-center justify-center bg-secondary ${person.dead ? "grayscale" : ""} ${className}`}>
      <span className={`font-display text-3xl ${person.house ? houseText[person.house] : "text-primary"}`}>
        {person.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </span>
    </div>
  );
}

export function PersonCard({ person, active }: { person: TreePerson; active?: boolean }) {
  const border = person.house ? houseBorder[person.house] : "border-border";
  return (
    <div
      key={`${person.id}-${person.unknown}-${person.name}`}
      className={`animate-reveal w-[150px] cursor-pointer overflow-hidden border bg-card text-center shadow-lg transition-transform hover:-translate-y-1 ${border} ${active ? "ring-2 ring-primary" : ""}`}
    >
      <div className="relative h-[140px] w-full">
        <Portrait person={person} className="h-full w-full" />
        {person.dead && (
          <span className="absolute right-1 top-1 bg-background/80 px-1 font-display text-[10px] uppercase tracking-widest text-destructive">✝ Deceased</span>
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate font-display text-[12px] text-card-foreground">{person.name}</div>
        <div className={`font-display text-[10px] uppercase tracking-widest ${person.house ? houseText[person.house] : "text-muted-foreground"}`}>
          {person.house ? `House ${HOUSES[person.house].name}` : "Unknown"}
        </div>
      </div>
    </div>
  );
}

function PersonNodeView({ data }: NodeProps<PersonNode>) {
  return (
    <div className={`transition-opacity duration-300 ${data.dim ? "opacity-15" : "opacity-100"}`}>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <PersonCard person={data.person} active={data.active} />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle id="side" type="source" position={Position.Right} className="!opacity-0" />
      <Handle id="side-in" type="target" position={Position.Left} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { person: PersonNodeView };

interface Props {
  state: TreeState;
  focusHouse: HouseId | null;
  selectedId: string | null;
  onSelect: (p: TreePerson) => void;
}

function Inner({ state, focusHouse, selectedId, onSelect }: Props) {
  const flow = useReactFlow();
  const { nodes, edges } = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 30, ranksep: 90 });
    g.setDefaultEdgeLabel(() => ({}));
    state.people.forEach((p) => g.setNode(p.id, { width: W, height: H }));
    state.links.filter((l) => l.kind === "parent").forEach((l) => g.setEdge(l.source, l.target));
    dagre.layout(g);

    const inFocus = (id: string) => {
      if (!focusHouse) return true;
      const p = state.people.find((x) => x.id === id);
      return p?.house === focusHouse;
    };

    const nodes: PersonNode[] = state.people.map((p) => {
      const n = g.node(p.id);
      return {
        id: p.id, type: "person",
        position: { x: n.x - W / 2, y: n.y - H / 2 },
        data: { person: p, dim: !inFocus(p.id) && !(p.unknown && state.links.some((l) => l.source === p.id && inFocus(l.target))), active: p.id === selectedId },
      };
    });
    const edges: Edge[] = state.links.map((l) => {
      const faded = focusHouse && !(inFocus(l.source) || inFocus(l.target));
      return {
        id: l.id, source: l.source, target: l.target,
        type: l.kind === "spouse" ? "straight" : "smoothstep",
        sourceHandle: l.kind === "spouse" ? "side" : null,
        targetHandle: l.kind === "spouse" ? "side-in" : null,
        ...(l.unknown ? { label: "?" } : {}),
        labelStyle: { fill: "var(--primary)", fontFamily: "Cinzel", fontSize: 16 },
        labelBgStyle: { fill: "var(--background)" },
        style: {
          stroke: l.kind === "spouse" ? "var(--ember)" : "var(--primary)",
          strokeWidth: 1.5,
          strokeDasharray: l.unknown || l.kind === "spouse" ? "6 4" : undefined,
          opacity: faded ? 0.08 : 0.75,
        },
        ...(l.kind === "parent" ? { markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" } } : {}),
      };
    });
    return { nodes, edges };
  }, [state, focusHouse, selectedId]);

  // Zoom to the chosen house.
  useEffect(() => {
    const ids = focusHouse ? state.people.filter((p) => p.house === focusHouse).map((p) => ({ id: p.id })) : undefined;
    const t = setTimeout(() => flow.fitView({ ...(ids ? { nodes: ids } : {}), duration: 700, padding: 0.25, maxZoom: 1, minZoom: focusHouse ? 0.3 : 0.5 }), 50);
    return () => clearTimeout(t);
  }, [focusHouse, flow, state]);

  // Center on the selected person.
  useEffect(() => {
    if (!selectedId) return;
    const n = flow.getNode(selectedId);
    if (n) flow.setCenter(n.position.x + W / 2, n.position.y + H / 2, { zoom: 1, duration: 600 });
  }, [selectedId, flow]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ minZoom: 0.5, maxZoom: 1 }}
      minZoom={0.15}
      maxZoom={1.6}
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_, n) => onSelect((n as PersonNode).data.person)}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="var(--border)" gap={32} />
      <Controls showInteractive={false} className="[&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-primary" />
    </ReactFlow>
  );
}

export function FamilyTree(props: Props) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}
