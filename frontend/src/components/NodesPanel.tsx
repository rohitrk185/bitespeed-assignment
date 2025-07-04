import { Controls, ReactFlow, SelectionMode } from "@xyflow/react";
import { useNodes } from "../contexts/NodesContext";
import TextNode from "./TextNode";

const nodeTypes = {
  text: TextNode,
};

const NodesPanel = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    isValidConnection,
  } = useNodes();
  console.log("[NodesPanel] rendering nodes:", nodes);
  console.log("[NodesPanel] rendering edges:", edges);
  return (
    <div className="w-3/4 min-h-full">
      {/* 2. Pass the nodeTypes map to ReactFlow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onSelectionChange={({ nodes }) => {
          setSelectedNode(nodes.length === 1 ? nodes[0] : null);
        }}
        isValidConnection={isValidConnection}
        fitView
        selectionMode={SelectionMode.Partial}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default NodesPanel;
