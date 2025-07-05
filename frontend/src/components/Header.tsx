import { useNodes } from "../contexts/NodesContext";

const Header = () => {
  const { saveError, saveSuccess, saveChanges, clearChanges } = useNodes();
  return (
    <div className="bg-gray-200 w-full min-w-full max-w-full h-12 flex justify-around items-center border-b border-gray-300">
      {/* Error and Success Messages Related to Saving of Flow */}
      <p className="w-1/2 flex justify-center">
        {saveError ? (
          <span className="bg-red-200 text-red-500 px-4 py-1 rounded-md border border-red-500">
            {saveError}
          </span>
        ) : null}

        {saveSuccess ? (
          <span className="bg-green-200 text-green-600 px-4 py-1 rounded-md border border-green-600">
            {saveSuccess}
          </span>
        ) : null}
      </p>

      <div className="w-1/2 flex justify-around items-center">
        {/* Save and Clear Flow Buttons */}
        <button
          className={
            "border border-gray-800 text-gray-800 hover:text-black hover:border-black hover:bg-gray-300 cursor-pointer rounded-md px-4 py-1"
          }
          onClick={() => saveChanges()}
        >
          Save Flow
        </button>

        <button
          className="border border-gray-800 text-gray-800 hover:text-black hover:border-black hover:bg-gray-300 cursor-pointer rounded-md px-4 py-1"
          onClick={() => clearChanges()}
        >
          Clear Flow
        </button>
      </div>
    </div>
  );
};

export default Header;
