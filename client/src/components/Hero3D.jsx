import React, { useEffect, useRef } from 'react';

const Hero3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Use THREE from global scope (CDN)
    const THREE = window.THREE;
    if (!THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Dodecahedron
    const geometry = new THREE.DodecahedronGeometry(1.6, 0);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x080A0C, 
      transparent: true, 
      opacity: 0.9 
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Wireframe edges
    const edgesGeom = new THREE.EdgesGeometry(geometry);
    const edgesMat = new THREE.LineBasicMaterial({ 
      color: 0xFF6B35, // ember
      linewidth: 2,
      transparent: true,
      opacity: 1
    });
    const wireframe = new THREE.LineSegments(edgesGeom, edgesMat);
    mesh.add(wireframe);

    // Grid helper (subtle animated grid)
    const gridHelper = new THREE.GridHelper(30, 60, 0x1E2832, 0x1E2832);
    gridHelper.position.y = -2.5;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Ember particles
    const particlesGeom = new THREE.BufferGeometry();
    const particleCount = 150;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
      posArray[i+1] = (Math.random() - 0.5) * 15;
      posArray[i+2] = (Math.random() - 0.5) * 15;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xFF6B35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeom, particleMat);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;

      particles.rotation.y -= 0.0005;
      particles.position.y += 0.001;
      if (particles.position.y > 3) particles.position.y = -3;
      
      gridHelper.position.z += 0.015;
      if(gridHelper.position.z > 0.5) gridHelper.position.z = 0;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement === mountRef.current.firstChild) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-50" />;
};

export default Hero3D;
