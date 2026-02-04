import { useCallback, useRef, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges, 
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNetworkStore, WhamoNode, WhamoEdge } from '@/lib/store';
import { ReservoirNode, SimpleNode, JunctionNode, SurgeTankNode, FlowBoundaryNode } from '@/components/NetworkNode';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Toolbar } from '@/components/Toolbar';
import { generateInpFile } from '@/lib/inp-generator';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const nodeTypes = {
  reservoir: ReservoirNode,
  node: SimpleNode,
  junction: JunctionNode,
  surgeTank: SurgeTankNode,
  flowBoundary: FlowBoundaryNode,
};

export default function Designer() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We connect local ReactFlow state to our global Zustand store for properties panel sync
  const { 
    nodes, 
    edges, 
    onNodesChange: storeOnNodesChange, 
    onConnect: storeOnConnect, 
    selectElement, 
    loadNetwork,
    clearNetwork
  } = useNetworkStore();

  // Local state wrapping store state to make React Flow happy with drag/drop updates
  // In a real optimized app, we'd probably use the store exclusively, but React Flow hooks are convenient
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // We need to update store as well
      storeOnNodesChange(changes);
    },
    [storeOnNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Just a placeholder in store for now, React Flow handles visual drag internally usually if state is managed there
      // But since we are using the store as the source of truth, we rely on the store's state being passed back down
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      storeOnConnect(params);
    },
    [storeOnConnect]
  );

  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: WhamoNode[], edges: WhamoEdge[] }) => {
    if (nodes.length > 0) {
      selectElement(nodes[0].id, 'node');
    } else if (edges.length > 0) {
      selectElement(edges[0].id, 'edge');
    } else {
      selectElement(null, null);
    }
  }, [selectElement]);

  const handleSave = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `whamo_project_${Date.now()}.json`);
    toast({ title: "Project Saved", description: "Network topology saved to JSON." });
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          loadNetwork(json.nodes, json.edges);
          toast({ title: "Project Loaded", description: "Network topology restored." });
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Load Failed", description: "Invalid JSON file." });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleGenerateInp = () => {
    try {
      generateInpFile(nodes, edges);
      toast({ title: "INP Generated", description: "WHAMO input file downloaded successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate .inp file. Check connections." });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Top Bar */}
      <Toolbar 
        onExport={handleGenerateInp} 
        onSave={handleSave} 
        onLoad={handleLoadClick} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas (70% width on large screens, full on small) */}
        <div className="flex-1 relative h-full bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange} // We rely on store updates mostly, but this connects dragging
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onSelectionChange={onSelectionChange}
            fitView
            className="bg-slate-50"
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="!bg-white !shadow-xl !border-border" />
          </ReactFlow>
        </div>

        {/* Properties Panel (30% width, min 300px) */}
        <div className="w-[350px] border-l border-border bg-card shadow-2xl z-20 flex flex-col">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
