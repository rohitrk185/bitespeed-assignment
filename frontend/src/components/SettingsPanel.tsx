import { BiMessageRoundedDetail } from "react-icons/bi";
import { useNodes } from "../contexts/NodesContext";
import { IoMdArrowBack } from "react-icons/io";
import type { Node } from "@xyflow/react";

const SettingsPanel = () => {
  const { addNewNode, selectedNode, updateNodeContent, unselectNode } =
    useNodes();

  /**
   * Updates the content of the selected node based on the value of the text area
   * @param e The text area change event
   */
  const handleNodeMessageEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedNode) {
      return;
    }
    updateNodeContent(selectedNode.id, e.target.value);
  };

  /**
   * Generates a block for the selected node with a back button, a heading, and a
   * text area for editing the node's content.
   *
   * @param selectedNode The currently selected node, or null if no node is selected.
   * @returns A JSX element representing the block.
   */
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

  /**
   * Generates a block with a button that allows the user to add a new node.
   * The button is styled with blue borders and text and displays a message icon
   * and a label "Message". When clicked, it triggers the addition of a new node.
   *
   * @returns A JSX element representing the add node block.
   */
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

  // Render the selected node block if a node is selected, or the add node block if no node is selected
  return selectedNode ? selectedNodeBlock(selectedNode) : addNodeBlock();
};

export default SettingsPanel;
