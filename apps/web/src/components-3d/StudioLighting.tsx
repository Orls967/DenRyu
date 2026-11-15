export function StudioLighting() {
  return (
    <>
      <color attach="background" args={['#0B1016']} />
      <fog attach="fog" args={['#0B1016', 130, 290]} />
      <ambientLight intensity={0.55} color="#C9D8E8" />
      <hemisphereLight args={['#8CC2E8', '#1A2430', 0.65]} />
      <directionalLight
        position={[55, 95, 65]}
        intensity={1.55}
        color="#FFF5E6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={10}
        shadow-camera-far={240}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-65, 50, -45]} intensity={0.65} color="#4AB8D8" />
      <pointLight position={[0, 12, 0]} intensity={0.8} distance={28} color="#36C5D9" />
    </>
  );
}
