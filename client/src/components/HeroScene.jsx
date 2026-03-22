import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Animated Torus Knot (focal centerpiece) ── */
function TorusKnot() {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.12;
      meshRef.current.rotation.y = t * 0.18;
      meshRef.current.rotation.z = t * 0.06;
    }
    if (glowRef.current) {
      glowRef.current.rotation.x = -t * 0.08;
      glowRef.current.rotation.y = t * 0.14;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inner wireframe */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[2.2, 0.55, 180, 20, 2, 3]} />
        <meshBasicMaterial
          color="#00e5f7"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* Outer glow shell (slightly larger, different phase) */}
      <mesh ref={glowRef}>
        <torusKnotGeometry args={[2.2, 0.58, 80, 8, 2, 3]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

/* ── Orbiting Halo Particles ── */
function OrbitalHalo({ count = 1200 }) {
  const mesh = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color('#00e5f7');
    const c2 = new THREE.Color('#8b5cf6');
    const c3 = new THREE.Color('#3b82f6');
    const palette = [c1, c2, c3];

    for (let i = 0; i < count; i++) {
      // Spherical shell distribution around the knot
      const r = 3.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.055;
    mesh.current.rotation.x = Math.sin(t * 0.03) * 0.2;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.7}
        fog={false}
      />
    </points>
  );
}

/* ── Far-Field Star Field ── */
function StarField({ count = 2500 }) {
  const mesh = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.008;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#a5b4fc" size={0.025} sizeAttenuation transparent opacity={0.5} fog={false} />
    </points>
  );
}

/* ── Grid Plane (perspective, neon) ── */
function GridPlane() {
  const mesh = useRef();

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    // Slow vertical drift to simulate motion
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00e5f7') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;

      float gridLine(float coord, float thickness) {
        float g = abs(fract(coord - 0.5) - 0.5);
        return 1.0 - smoothstep(0.0, thickness, g);
      }

      void main() {
        // Scrolling UV
        vec2 scrolledUv = vUv + vec2(0.0, uTime * 0.03);
        
        float scale = 20.0;
        float thickness = 0.01;
        float lineX = gridLine(scrolledUv.x * scale, thickness);
        float lineY = gridLine(scrolledUv.y * scale, thickness);
        float grid = max(lineX, lineY);
        
        // Fade at edges
        float fadeX = 1.0 - smoothstep(0.2, 0.5, abs(vUv.x - 0.5) * 2.0);
        float fadeY = smoothstep(0.0, 0.5, vUv.y) * (1.0 - smoothstep(0.5, 1.0, vUv.y));
        float fade = fadeX * (1.0 - vUv.y * 0.8);
        
        float alpha = grid * fade * 0.35;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  }), []);

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2.8, 0, 0]} position={[0, -3.5, 0]} material={shaderMaterial}>
      <planeGeometry args={[40, 30, 1, 1]} />
    </mesh>
  );
}

/* ── Floating Ring Accent ── */
function RingAccent({ radius = 5.5, color = '#8b5cf6', speed = 0.04, tiltX = 0.6 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

/* ── Ambient Point Lights ── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00e5f7" />
      <pointLight position={[-5, -3, -5]} intensity={1} color="#8b5cf6" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#3b82f6" />
    </>
  );
}

/* ── Main Scene ── */
function Scene() {
  return (
    <>
      <Lighting />
      <GridPlane />
      <TorusKnot />
      <OrbitalHalo count={1200} />
      <StarField count={2500} />
      <RingAccent radius={5.5} color="#00e5f7" speed={0.025} tiltX={0.55} />
      <RingAccent radius={6.8} color="#8b5cf6" speed={-0.018} tiltX={1.1} />
      <RingAccent radius={4.2} color="#3b82f6" speed={0.04} tiltX={0.2} />
    </>
  );
}

/* ── Canvas Wrapper ── */
export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.5, 10], fov: 55 }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.8)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
