import Header from "../components/Header";
import NodesPanel from "../components/NodesPanel";
import SettingsPanel from "../components/SettingsPanel";

const Home = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="w-full flex flex-grow">
        {/* Left Side Nodes Panel */}
        <NodesPanel />

        {/* Right Side Settings Panel */}
        <SettingsPanel />
      </main>
    </div>
  );
};

export default Home;
