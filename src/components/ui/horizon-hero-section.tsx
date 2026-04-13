"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Orbit } from "lucide-react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(ScrollTrigger);

type CameraTarget = {
  x: number;
  y: number;
  z: number;
};

type ThreeState = {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: THREE.Points[];
  nebula: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null;
  mountains: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>[];
  atmosphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial> | null;
  animationId: number | null;
  target: CameraTarget;
};

export const Component = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [ready, setReady] = useState(false);
  const rafScrollRef = useRef<number | null>(null);

  const smoothCameraPos = useRef<CameraTarget>({ x: 0, y: 30, z: 180 });
  const baseMountainZ = useRef<number[]>([]);

  const threeRef = useRef<ThreeState>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    atmosphere: null,
    animationId: null,
    target: { x: 0, y: 30, z: 180 },
  });

  const sections = useMemo(
    () => [
      {
        title: "TALENT",
        line1: "Where vision meets reality,",
        line2: "we shape the future of tomorrow",
      },
      {
        title: "SYNC",
        line1: "Beyond the boundaries of imagination,",
        line2: "lies the universe of possibilities",
      },
      {
        title: "MATCH",
        line1: "In the space between thought and creation,",
        line2: "we find the essence of true innovation",
      },
    ],
    []
  );

  useEffect(() => {
    const refs = threeRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowMotion = isMobile || prefersReducedMotion;

    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x030712, 0.00035);

    refs.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2500);
    refs.camera.position.set(0, 20, 160);

    try {
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (error) {
      console.error("Horizon hero renderer init failed", error);
      setReady(true);
      return;
    }
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowMotion ? 1.2 : 2));
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.7;

    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    refs.composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), lowMotion ? 0.35 : 0.8, 0.35, 0.9)
    );

    const createStars = () => {
      if (!refs.scene) return;
      const starCount = lowMotion ? 900 : 2500;

      for (let layer = 0; layer < 3; layer += 1) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i += 1) {
          const radius = 250 + Math.random() * 850;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi);

          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.65) {
            color.setHSL(0.62, 0.4, 0.82);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.09, 0.6, 0.8);
          } else {
            color.setHSL(0.87, 0.45, 0.82);
          }

          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
          sizes[i] = 0.4 + Math.random() * 1.7;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: layer },
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;

            void main() {
              vColor = color;
              vec3 p = position;
              float angle = time * 0.03 * (1.0 - depth * 0.25);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              p.xy = rot * p.xy;

              vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
              gl_PointSize = size * (250.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;

            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              float glow = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, glow);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const starField = new THREE.Points(geometry, material);
        refs.scene.add(starField);
        refs.stars.push(starField);
      }
    };

    const createNebula = () => {
      if (!refs.scene) return;

      const geometry = new THREE.PlaneGeometry(7200, 3500, lowMotion ? 28 : 60, lowMotion ? 28 : 60);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color("#1b3f91") },
          color2: { value: new THREE.Color("#db2763") },
          opacity: { value: 0.24 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;

          void main() {
            vUv = uv;
            vec3 p = position;
            float e = sin(p.x * 0.01 + time) * cos(p.y * 0.012 + time * 0.8) * 18.0;
            p.z += e;
            vElevation = e;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            float blend = sin(vUv.x * 8.0 + time * 0.5) * cos(vUv.y * 7.5 + time * 0.35);
            vec3 color = mix(color1, color2, blend * 0.5 + 0.5);
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 1.9);
            alpha *= 1.0 + vElevation * 0.01;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -980;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      if (!refs.scene) return;

      const layers = [
        { z: -60, height: 60, color: "#0e1b33", opacity: 1 },
        { z: -110, height: 90, color: "#12284a", opacity: 0.82 },
        { z: -160, height: 110, color: "#183462", opacity: 0.65 },
        { z: -220, height: 140, color: "#204070", opacity: 0.42 },
      ];

      layers.forEach((layer, index) => {
        const points: THREE.Vector2[] = [];
        const segments = lowMotion ? 28 : 50;

        for (let i = 0; i <= segments; i += 1) {
          const x = (i / segments - 0.5) * 1300;
          const y =
            Math.sin(i * 0.13) * layer.height +
            Math.sin(i * 0.07) * layer.height * 0.6 +
            (Math.random() - 0.5) * layer.height * 0.3 -
            135;

          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(6000, -340));
        points.push(new THREE.Vector2(-6000, -340));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.set(0, 54, layer.z);
        mountain.userData = { baseZ: layer.z, index };

        refs.scene?.add(mountain);
        refs.mountains.push(mountain);
      });

      baseMountainZ.current = refs.mountains.map((mountain) => mountain.position.z);
    };

    const createAtmosphere = () => {
      if (!refs.scene) return;

      const geometry = new THREE.SphereGeometry(600, 24, 24);
      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform float time;

          void main() {
            float i = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 c = vec3(0.22, 0.54, 1.0) * i;
            c *= 0.88 + sin(time * 1.8) * 0.12;
            gl_FragColor = vec4(c, i * 0.24);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
      refs.atmosphere = atmosphere;
    };

    const animate = () => {
      const state = threeRef.current;
      state.animationId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      state.stars.forEach((field) => {
        const material = field.material as THREE.ShaderMaterial;
        material.uniforms.time.value = time;
      });

      if (state.nebula) {
        state.nebula.material.uniforms.time.value = time;
      }

      if (state.atmosphere) {
        state.atmosphere.material.uniforms.time.value = time;
      }

      if (state.camera) {
        const smoothing = lowMotion ? 0.06 : 0.045;
        smoothCameraPos.current.x += (state.target.x - smoothCameraPos.current.x) * smoothing;
        smoothCameraPos.current.y += (state.target.y - smoothCameraPos.current.y) * smoothing;
        smoothCameraPos.current.z += (state.target.z - smoothCameraPos.current.z) * smoothing;

        const floatX = lowMotion ? Math.sin(time * 0.12) * 0.7 : Math.sin(time * 0.17) * 1.5;
        const floatY = lowMotion ? Math.cos(time * 0.14) * 0.4 : Math.cos(time * 0.21) * 0.8;

        state.camera.position.set(
          smoothCameraPos.current.x + floatX,
          smoothCameraPos.current.y + floatY,
          smoothCameraPos.current.z
        );
        state.camera.lookAt(0, 14, -620);
      }

      state.mountains.forEach((mountain, index) => {
        const factor = 1 + index * 0.45;
        mountain.position.x = Math.sin(time * (lowMotion ? 0.06 : 0.09)) * factor * (lowMotion ? 1.2 : 2);
      });

      state.composer?.render();
    };

    createStars();
    createNebula();
    createMountains();
    createAtmosphere();
    animate();
    setReady(true);

    const onResize = () => {
      const state = threeRef.current;
      if (!state.camera || !state.renderer || !state.composer) return;
      const nowLowMotion = window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      state.camera.aspect = window.innerWidth / window.innerHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(window.innerWidth, window.innerHeight);
      state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, nowLowMotion ? 1.2 : 2));
      state.composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener("resize", onResize);

      refs.stars.forEach((field) => {
        field.geometry.dispose();
        (field.material as THREE.ShaderMaterial).dispose();
      });

      refs.mountains.forEach((mountain) => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      refs.nebula?.geometry.dispose();
      refs.nebula?.material.dispose();
      refs.atmosphere?.geometry.dispose();
      refs.atmosphere?.material.dispose();
      refs.renderer?.dispose();

      refs.stars = [];
      refs.mountains = [];
      refs.nebula = null;
      refs.atmosphere = null;
      refs.scene = null;
      refs.camera = null;
      refs.renderer = null;
      refs.composer = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, progressRef.current], {
      visibility: "visible",
    });

    const timeline = gsap.timeline();

    if (menuRef.current) {
      timeline.from(menuRef.current, {
        x: -120,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
    }

    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll(".horizon-title-char");
      timeline.from(
        chars,
        {
          y: 120,
          opacity: 0,
          duration: 1.2,
          stagger: 0.04,
          ease: "power4.out",
        },
        "-=0.5"
      );
    }

    if (subtitleRef.current) {
      const lines = subtitleRef.current.querySelectorAll(".horizon-subtitle-line");
      timeline.from(
        lines,
        {
          y: 38,
          opacity: 0,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
        },
        "-=0.7"
      );
    }

    if (progressRef.current) {
      timeline.from(
        progressRef.current,
        {
          opacity: 0,
          y: 36,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      );
    }

    return () => {
      timeline.kill();
    };
  }, [ready]);

  useEffect(() => {
    const positions: CameraTarget[] = [
      { x: 0, y: 30, z: 220 },
      { x: 0, y: 38, z: -40 },
      { x: 0, y: 52, z: -680 },
    ];

    const onScroll = () => {
      if (rafScrollRef.current) {
        return;
      }

      rafScrollRef.current = window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(scrolled / max, 1);

        setScrollProgress(progress);

        const sectionIndex = Math.min(Math.floor(progress * (sections.length - 1)), sections.length - 1);
        setCurrentSection(sectionIndex + 1);

        const scaled = progress * (sections.length - 1);
        const base = Math.floor(scaled);
        const local = scaled - base;

        const current = positions[base] ?? positions[0];
        const next = positions[base + 1] ?? current;

        threeRef.current.target = {
          x: current.x + (next.x - current.x) * local,
          y: current.y + (next.y - current.y) * local,
          z: current.z + (next.z - current.z) * local,
        };

        threeRef.current.mountains.forEach((mountain, idx) => {
          const depthSpeed = 1 + idx * 0.55;
          const targetZ = baseMountainZ.current[idx] + scrolled * 0.42 * depthSpeed;
          mountain.position.z = progress > 0.68 ? 500000 : targetZ;
        });

        if (threeRef.current.nebula && threeRef.current.mountains[threeRef.current.mountains.length - 1]) {
          threeRef.current.nebula.position.z = threeRef.current.mountains[threeRef.current.mountains.length - 1].position.z;
        }

        rafScrollRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafScrollRef.current) {
        window.cancelAnimationFrame(rafScrollRef.current);
      }
    };
  }, [sections.length]);

  const splitTitle = (text: string) => {
    return text.split("").map((char, i) => (
      <span className="horizon-title-char" key={`${char}-${i}`}>
        {char === " " ? "\u00a0" : char}
      </span>
    ));
  };

  return (
    <div className="horizon-hero" ref={containerRef}>
      <canvas className="horizon-canvas" ref={canvasRef} />

      <div className="horizon-menu" ref={menuRef} style={{ visibility: "hidden" }}>
        <Orbit className="h-4 w-4" />
        <span className="horizon-menu-text">ORBIT</span>
      </div>

      <div className="horizon-overlay-content">
        <h1 className="horizon-title" ref={titleRef}>
          {splitTitle(sections[0].title)}
        </h1>

        <div className="horizon-subtitle" ref={subtitleRef}>
          <p className="horizon-subtitle-line">{sections[0].line1}</p>
          <p className="horizon-subtitle-line">{sections[0].line2}</p>
        </div>
      </div>

      <div className="horizon-scroll-progress" ref={progressRef} style={{ visibility: "hidden" }}>
        <span className="horizon-scroll-label">SCROLL</span>
        <div className="horizon-progress-track">
          <div className="horizon-progress-fill" style={{ width: `${Math.round(scrollProgress * 100)}%` }} />
        </div>
        <span className="horizon-counter">
          {String(currentSection).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
        </span>
      </div>

      <div className="horizon-sections">
        {sections.slice(1).map((section) => (
          <section className="horizon-section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.line1}</p>
            <p>{section.line2}</p>
          </section>
        ))}
      </div>

      <style jsx>{`
        .horizon-hero {
          position: relative;
          min-height: 300vh;
          background:
            radial-gradient(circle at 20% 15%, rgba(53, 84, 197, 0.42) 0%, transparent 40%),
            radial-gradient(circle at 80% 18%, rgba(220, 39, 115, 0.35) 0%, transparent 38%),
            linear-gradient(180deg, #040611 0%, #0b1020 60%, #090d1a 100%);
          color: #f6f7fb;
          overflow-x: clip;
        }

        .horizon-canvas {
          position: fixed;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .horizon-menu {
          position: fixed;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 8;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(226, 232, 240, 0.25);
          background: rgba(4, 6, 17, 0.45);
          padding: 0.52rem 0.78rem;
          border-radius: 999px;
          backdrop-filter: blur(10px);
          color: #e7ebff;
          letter-spacing: 0.12em;
          font-size: 0.66rem;
          font-weight: 700;
        }

        .horizon-menu-text {
          transform: translateY(0.5px);
        }

        .horizon-overlay-content {
          position: sticky;
          top: 0;
          min-height: 100vh;
          z-index: 6;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 2rem 1.25rem;
        }

        .horizon-title {
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.05em;
          font-size: clamp(2.6rem, 12vw, 8rem);
          letter-spacing: 0.1em;
          font-weight: 700;
          color: #f8f7ff;
          text-shadow: 0 10px 42px rgba(60, 109, 255, 0.45);
        }

        .horizon-title-char {
          display: inline-block;
        }

        .horizon-subtitle {
          margin-top: 1rem;
          max-width: 40rem;
        }

        .horizon-subtitle-line {
          margin: 0;
          font-size: clamp(0.95rem, 2.4vw, 1.18rem);
          color: rgba(229, 235, 255, 0.92);
          letter-spacing: 0.03em;
        }

        .horizon-subtitle-line + .horizon-subtitle-line {
          margin-top: 0.3rem;
        }

        .horizon-scroll-progress {
          position: fixed;
          left: 50%;
          bottom: 1.2rem;
          transform: translateX(-50%);
          z-index: 9;
          min-width: min(22rem, 90vw);
          border-radius: 999px;
          border: 1px solid rgba(195, 207, 255, 0.28);
          background: rgba(4, 8, 20, 0.58);
          backdrop-filter: blur(10px);
          padding: 0.6rem 0.9rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.7rem;
          align-items: center;
        }

        .horizon-scroll-label,
        .horizon-counter {
          font-size: 0.65rem;
          color: rgba(226, 234, 255, 0.85);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
          white-space: nowrap;
        }

        .horizon-progress-track {
          position: relative;
          height: 5px;
          border-radius: 999px;
          background: rgba(166, 177, 219, 0.26);
          overflow: hidden;
        }

        .horizon-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #5f6fff 0%, #d94d96 100%);
          box-shadow: 0 0 24px rgba(130, 129, 255, 0.52);
          transition: width 160ms ease;
        }

        .horizon-sections {
          position: relative;
          z-index: 7;
          margin-top: 80vh;
        }

        .horizon-section {
          min-height: 100vh;
          display: grid;
          place-content: center;
          gap: 0.55rem;
          text-align: center;
          padding: 2rem 1.2rem;
        }

        .horizon-section h2 {
          margin: 0;
          font-size: clamp(2rem, 10vw, 5rem);
          letter-spacing: 0.11em;
          color: #eef2ff;
          text-shadow: 0 8px 30px rgba(82, 92, 255, 0.42);
        }

        .horizon-section p {
          margin: 0;
          font-size: clamp(0.96rem, 2.2vw, 1.2rem);
          color: rgba(223, 231, 255, 0.9);
        }

        @media (max-width: 768px) {
          .horizon-hero {
            min-height: 250vh;
          }

          .horizon-menu {
            top: 0.9rem;
            left: 0.9rem;
          }

          .horizon-subtitle {
            max-width: 22rem;
          }

          .horizon-scroll-progress {
            bottom: 0.8rem;
            gap: 0.45rem;
            padding: 0.55rem 0.7rem;
          }

          .horizon-scroll-label,
          .horizon-counter {
            font-size: 0.56rem;
          }
        }
      `}</style>
    </div>
  );
};




