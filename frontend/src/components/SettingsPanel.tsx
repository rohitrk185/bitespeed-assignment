import { BiMessageRoundedDetail } from "react-icons/bi";
import { useNodes } from "../contexts/NodesContext";
import { IoMdArrowBack } from "react-icons/io";
import type { Node } from "@xyflow/react";

const SettingsPanel = () => {
  const { addNewNode, selectedNode, updateNodeContent, unselectNode } =
    useNodes();

  const handleNodeMessageEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedNode) {
      return;
    }
    updateNodeContent(selectedNode.id, e.target.value);
  };

  const selectedNodeBlock = (selectedNode: Node | null) => {
    return (
      <div
        className="w-1/4 border-l border-t border-gray-300 min-h-full"
        key={selectedNode ? selectedNode.id : "new-node"}
      >
        <div className="flex items-center border-b border-gray-300 p-2">
          <button
            onClick={() => unselectNode()}
            className="p-1"
          >
            <IoMdArrowBack size={20} />
          </button>
          <h3 className="flex-grow text-center font-semibold">Message</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-gray-500 text-sm">Text</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              rows={4}
              defaultValue={
                selectedNode && selectedNode.data
                  ? (selectedNode.data.content as string)
                  : ""
              }
              onChange={handleNodeMessageEdit}
            />
          </div>
        </div>
      </div>
    );
  };

  const addNodeBlock = () => {
    return (
      <div className="w-1/4 border-l border-t border-gray-300 min-h-full p-4">
        <button
          onClick={addNewNode}
          className="border-2 border-blue-500 text-blue-500 px-12 py-2 flex flex-col items-center gap-1 rounded-md w-full hover:bg-blue-50 cursor-pointer"
        >
          <BiMessageRoundedDetail size={30} />
          <h6>Message</h6>
        </button>
      </div>
    );
  };

  return selectedNode ? selectedNodeBlock(selectedNode) : addNodeBlock();
};

export default SettingsPanel;
