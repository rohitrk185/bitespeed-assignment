import type { NodeProps, Node } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { BiMessageRoundedDetail } from "react-icons/bi";

// Shape of the data object for this node type.
type TextNodeData = Node<
  {
    label: string;
    content: string;
    disableSourceHandle: boolean;
  },
  "text"
>;

const TextNode: React.FC<NodeProps<TextNodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md w-64 overflow-hidden ${
        selected
          ? "shadow-2xs shadow-violet-300 border-3 border-dashed border-black"
          : "border-1 border-stone-500"
      }`}
    >
      {/* Node Header */}
      <div
        className={`bg-purple-200 p-1 rounded-t-md flex items-center gap-2 ${selected ? "border-b border-purple-400 bg-purple-300" : ""}`}
      >
        <BiMessageRoundedDetail />
        <h6 className="font-bold text-sm">{data.label}</h6>
      </div>

      {/* Node Text Content */}
      <div className="p-2">
        <p className="text-gray-700">{data.content}</p>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-500"
        style={{ fontSize: "20px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-500"
        style={{ fontSize: "20px" }}
      />
    </div>
  );
};

export default TextNode;
