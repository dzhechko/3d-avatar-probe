import { CameraControls, Environment, Sky } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";
import { Color } from "three";

export const Scenario = () => {
  const cameraControls = useRef();
  useEffect(() => {
    cameraControls.current.setLookAt(0, 1.5, 3, 0, 0.8, 0, true);
  }, []);
  return (
    <>
      <CameraControls ref={cameraControls} />
      
      {/* Dramatic lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        color={new Color("#ffffff")}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.4}
        color={new Color("#a6c1ff")}
      />
      
      {/* Environment and sky setup */}
      <Sky 
        distance={450000} 
        sunPosition={[0, 1, 0]} 
        inclination={0.6} 
        azimuth={0.1} 
      />
      <Environment preset="night" />
      
      {/* Avatar */}
      <Avatar />
      
      {/* Background fog for depth */}
      <fog attach="fog" args={['#1a1a1a', 5, 15]} />
    </>
  );
};
