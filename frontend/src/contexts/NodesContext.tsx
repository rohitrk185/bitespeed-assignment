import type { ReactNode } from "react";
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
} from "@xyflow/react";
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";

interface INodeContextType {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  addNewNode: () => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  isValidConnection: (connection: Connection | Edge) => boolean;
  unselectNode: () => void;
  saveError: string | null;
  saveChanges: () => void;
  clearChanges: () => void;
  saveSuccess: string | null;
}
interface INodeProviderProps {
  children: ReactNode;
}

export const NodeContext = createContext<INodeContextType | null>(null);

export const NodeProvider: React.FC<INodeProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Restore saved flow
  useEffect(() => {
    if (localStorage.getItem("nodes")) {
      setNodes(JSON.parse(localStorage.getItem("nodes") as string));
    }
    if (localStorage.getItem("edges")) {
      setEdges(JSON.parse(localStorage.getItem("edges") as string));
    }
  }, []);

  // save nodes on changes. let xyflow/react handle applying those changes to individual nodes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // console.log("[NodesContext] onNodesChange", changes);
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  // save edges on changes. let xyflow/react handle applying those changes to individual edges
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // console.log("[NodesContext] onEdgesChange", changes);
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  // save edges on connect. let xyflow/react add the new connection
  const onConnect: (connection: Connection) => void = useCallback(
    (connection) => {
      // console.log("[NodesContext] onConnect", connection);
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Prevent connections from a source handle that already has an edge and connections from a target handle that already has an edge
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const sourceHasEdge = edges.some(
        (edge) =>
          edge.source === connection.source ||
          (edge.target === connection.source &&
            edge.source === connection.target)
      );
      return !sourceHasEdge;
    },
    [edges]
  );

  /**
   * Generates a new node and adds it to the state.
   * @returns void
   */
  const addNewNode = () => {
    // console.log("[NodesContext] in addNewNode");
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      // Position nodes randomly so they don't overlap
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      // custom type for our TextNode
      type: "text",
      data: {
        // This flag will be used to hide the source handle on the first node.
        disableSourceHandle: nodes.length === 0,
        label: "Send Message",
        content: `Text message ${nodes.length + 1}`,
      },
    };
    setNodes((nodes) => [...nodes, newNode]);
    // console.log("[NodesContext] added new node:", newNode);
  };

  /**
   * Updates the content of a node with the given id.
   * @param nodeId the id of the node to update
   * @param content the new content of the node
   */
  const updateNodeContent = (nodeId: string, content: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // create a new object here, to inform ReactFlow about the change
          node = {
            ...node,
            data: {
              ...node.data,
              content,
            },
          };
        }
        return node;
      })
    );
    // Also update the selected node to reflect the change immediately in the panel
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, content },
      });
    }
  };

  /**
   * Sets the selected node to null and deselects the currently selected node in the state.
   * This is useful for unselecting the node when the user clicks somewhere else on the screen.
   */
  const unselectNode = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === selectedNode?.id) {
          return {
            ...node,
            selected: false,
          };
        }
        return node;
      })
    );
    setSelectedNode(null);
  };

  /**
   * Saves the current state of the nodes and edges to localStorage.
   * If the flow cannot be saved (i.e. there are multiple nodes with no target),
   * sets the saveError state to "Cannot Save Flow" and after 10 seconds sets it back to null.
   * Otherwise, sets the saveSuccess state to "Flow Saved Locally" and after 10 seconds sets it back to null.
   */
  const saveChanges = () => {
    // console.log("[NodesContext] saveChanges");
    // console.log("[NodesContext] nodes:", nodes);
    // console.log("[NodesContext] edges:", edges);

    if (typeof window === "undefined") {
      // console.log("[NodesContext] window is undefined");
      return;
    }
    const n = nodes.length;
    const nodesTarget: { [key: string]: string } = {};
    let nodesWithTarget: number = 0;
    for (const edge of edges) {
      if (!nodesTarget.source) {
        ++nodesWithTarget;
      }
      nodesTarget[edge.source] = edge.target;
    }
    if (n > 1 && n - nodesWithTarget > 1) {
      setSaveError("Cannot Save Flow");
      setSaveError(null);

      setTimeout(() => {
        setSaveError(null);
      }, 10 * 1000);
      return;
    }
    setSaveError(null);
    localStorage.setItem("nodes", JSON.stringify(nodes));
    localStorage.setItem("edges", JSON.stringify(edges));

    setSaveSuccess("Flow Saved Locally");
    setTimeout(() => {
      setSaveSuccess(null);
    }, 10 * 1000);

    // console.log("[NodesContext] saved changes");
  };

  /**
   * Clears the current state of the nodes and edges and removes them from localStorage.
   * Sets the saveSuccess state to "Flow Cleared" and after 10 seconds sets it back to null.
   */
  const clearChanges = () => {
    localStorage.removeItem("nodes");
    localStorage.removeItem("edges");

    setNodes([]);
    setEdges([]);
    setSaveError(null);
    setSaveSuccess("Flow Cleared");
    setTimeout(() => {
      setSaveSuccess(null);
    }, 10 * 1000);
  };

  const contextValue = {
    nodes,
    setNodes,
    edges,
    setEdges,
    addNewNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    updateNodeContent,
    isValidConnection,
    unselectNode,
    saveError,
    saveChanges,
    clearChanges,
    saveSuccess,
  };

  return (
    <NodeContext.Provider value={contextValue}>{children}</NodeContext.Provider>
  );
};

export const useNodes = () => {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error("useNodes must be used within a NodeProvider");
  }
  return context;
};
