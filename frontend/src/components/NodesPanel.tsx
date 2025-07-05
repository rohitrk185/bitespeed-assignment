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
  // console.log("[NodesPanel] rendering nodes:", nodes);
  // console.log("[NodesPanel] rendering edges:", edges);
  return (
    <div className="w-3/4 min-h-full">
      <ReactFlow
        // Pass the nodes and edges to ReactFlow
        nodes={nodes}
        edges={edges}
        // Handle changes to nodes and edges
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // Add custom node types
        nodeTypes={nodeTypes}
        // Set selectedNode state for enabling editing
        onSelectionChange={({ nodes }) => {
          setSelectedNode(nodes.length === 1 ? nodes[0] : null);
        }}
        // Disable new edge when node already has an edge connecting to a target handle
        // or if the 2 nodes are already connected in the other way
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
