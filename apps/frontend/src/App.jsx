import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Loader />
      <Leva collapsed hidden/>
      
      {/* Chat interface on the left */}
      <div style={{ flex: 1, maxWidth: '60%' }}>
        <ChatInterface />
      </div>
      
      {/* Avatar container on the right */}
      <div style={{ 
        width: '400px',
        height: '400px',
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        borderRadius: '15px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #363636 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      }}>
        <Canvas shadows camera={{ position: [0, 0, 0], fov: 25 }}>
          <Scenario />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
