import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Howl } from "howler";
import { useProposalStore } from "@/store/proposal.store";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine } from "@tsparticles/engine";
import { supabase } from "@/lib/supabase";
import { Starfield } from "./Starfield";

// Register GSAP Plugin
gsap.registerPlugin(useGSAP);

declare global {
  interface Window {
    p_timer?: number;
    p_haptic?: number;
  }
}

// --- ASSETS ---
const CINEMATIC_AUDIO =
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3";
const PREMIUM_FALLBACKS = [
  "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?auto=format&fit=crop&q=80",
];

// --- DATA ---
const DOPAMINE_LABELS = [
  "Reina",
  "Estrellita",
  "Mi Vida",
  "Amor",
  "tiamu",
  "Me Encantas",
];

export const ProposalOverlay = () => {
  const { state, acceptProposal } = useProposalStore();
  const container = useRef<HTMLDivElement>(null);
  const audioRef = useRef<Howl | null>(null);
  const [particlesReady, setParticlesReady] = useState(false);

  // Ref for Starfield Speed
  const starSpeedRef = useRef({ val: 0.2 });

  // Dynamic Assets State
  const [memoryImages, setMemoryImages] = useState<string[]>([]);
  const [thingsILove, setThingsILove] = useState<string[]>([]);
  const [firstTimes, setFirstTimes] = useState<string[]>([]);
  const [tuWords, setTuWords] = useState<string[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);

  // --- 1. Init Particles ---
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadFull(engine);
    }).then(() => {
      setParticlesReady(true);
    });
  }, []);

  // --- 2. Dynamic Asset Fetching (Enhanced) ---
  useEffect(() => {
    const fetchInfinityMemories = async () => {
      try {
        // 2a. Fetch Images
        const { data: imageData, error: imageError } = await supabase
          .from("notes")
          .select("content")
          .ilike("content", '%"type":"image"%');

        // 2b. Fetch Text
        const { data: textData, error: textError } = await supabase
          .from("notes")
          .select("title, content")
          .in("title", ["Cosas que amo de ella", "Primeras veces", "Tuuuu"]);

        if (imageError || textError) throw new Error("Database error");

        // --- Process Images ---
        const extractedImages: string[] = [];
        imageData?.forEach((row) => {
          try {
            const content = JSON.parse(row.content);
            if (Array.isArray(content)) {
              content.forEach((block: unknown) => {
                const typedBlock = block as { type?: string; content?: string };
                if (
                  typedBlock.type === "image" &&
                  typedBlock.content &&
                  typedBlock.content.startsWith("http")
                ) {
                  extractedImages.push(typedBlock.content);
                }
              });
            }
          } catch (e) {
            console.error(e);
          }
        });
        setMemoryImages(
          extractedImages.length > 0
            ? extractedImages.sort(() => 0.5 - Math.random())
            : PREMIUM_FALLBACKS,
        );

        // --- Process Text ---
        const accThingsILove: string[] = [];
        const accFirstTimes: string[] = [];
        const accTu: string[] = [];

        // Recursive function to extract all text from TipTap JSON
        const extractText = (content: unknown): string[] => {
          const words: string[] = [];

          const traverse = (node: unknown) => {
            if (!node || typeof node !== "object") return;

            // Safe cast since we checked it's an object
            const typedNode = node as {
              type?: string;
              text?: string;
              content?: unknown[];
            };

            if (typedNode.type === "text" && typedNode.text) {
              // Split by spaces and add non-empty words
              const cleanWords = typedNode.text
                .split(/\s+/)
                .filter((w) => w.length > 2);
              words.push(...cleanWords);
            }

            if (Array.isArray(typedNode.content)) {
              typedNode.content.forEach((child) => traverse(child));
            } else if (
              Array.isArray(
                (node as { doc?: { content?: unknown[] } }).doc?.content,
              )
            ) {
              // Handle root 'doc' wrapper if present
              (node as { doc: { content: unknown[] } }).doc.content.forEach(
                (child) => traverse(child),
              );
            } else {
              // Brute force: check all values if they are arrays/objects
              Object.values(node).forEach((value) => {
                if (Array.isArray(value)) {
                  value.forEach((item) => traverse(item));
                } else if (typeof value === "object" && value !== null) {
                  traverse(value);
                }
              });
            }
          };

          try {
            traverse(content);
          } catch {
            // console.warn("Error parsing TipTap JSON", _err);
          }

          return words;
        };

        textData?.forEach((row) => {
          try {
            let json;
            try {
              json = JSON.parse(row.content);
            } catch {
              return;
            }
            const title = row.title?.toLowerCase().trim() || "";

            let blocks: unknown[] = []; // Changed from any[] to unknown[]
            if (Array.isArray(json)) blocks = json;

            blocks.forEach((block: unknown) => {
              const text = extractText(block).join(" "); // Join words to form a single string for trimming
              if (!text.trim()) return; // Check if the joined string is empty or just whitespace

              if (title.includes("tuuuu")) {
                const words = text
                  .split(/[\s,.\n]+/)
                  .filter((w) => w.length > 2);
                accTu.push(...words);
              } else if (title.includes("primeras veces")) {
                const lines = text
                  .split(/[\n•]+/)
                  .map((l) => l.trim())
                  .filter((l) => l.length > 3);
                accFirstTimes.push(...lines);
              } else if (title.includes("cosas que amo")) {
                const lines = text
                  .split(/[\n•]+/)
                  .map((l) => l.trim())
                  .filter((l) => l.length > 3);
                accThingsILove.push(...lines);
              }
            });
          } catch (e) {
            console.error(e);
          }
        });

        // Set states with limits
        setThingsILove(
          accThingsILove.length > 0
            ? accThingsILove.slice(0, 15)
            : ["Tu sonrisa", "Tus ojos", "Tu voz", "Tu alma"],
        );
        setFirstTimes(
          accFirstTimes.length > 0
            ? accFirstTimes.slice(0, 10)
            : ["Primer beso", "Primera cita", "Primer viaje"],
        );
        setTuWords(
          accTu.length > 0
            ? accTu.slice(0, 30)
            : ["Magia", "Luz", "Reina", "Vida"],
        );
      } catch (err) {
        console.error("Infinity Error", err);
        setMemoryImages(PREMIUM_FALLBACKS);
        setThingsILove(["Tu sonrisa", "Tus ojos"]);
      } finally {
        setIsAssetsLoading(false);
      }
    };

    fetchInfinityMemories();
  }, []);

  // --- 3. Cinematic Timeline ---
  useGSAP(
    () => {
      if (state !== "PLAYING") return;

      if (audioRef.current) audioRef.current.unload();
      const sound = new Howl({
        src: [CINEMATIC_AUDIO],
        html5: true,
        volume: 0,
        loop: true,
      });
      sound.play();
      sound.fade(0, 1.0, 5000);
      audioRef.current = sound;

      const tl = gsap.timeline();
      const isMobile = window.innerWidth < 768;

      // ACT I: Awakening
      tl.to(starSpeedRef.current, { val: 50, duration: 2, ease: "expo.in" })
        .to(starSpeedRef.current, { val: 0.1, duration: 3, ease: "power2.out" })
        .set(".act-1", { display: "flex" }, "<")
        .fromTo(
          ".text-milov",
          {
            opacity: 0,
            scale: 0.8,
            letterSpacing: "1em",
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            scale: 1,
            letterSpacing: "0.2em",
            filter: "blur(0px)",
            duration: 5,
            ease: "power2.out",
          },
          "-=2.5",
        )
        .to(
          ".text-milov",
          { opacity: 0, scale: 1.1, filter: "blur(8px)", duration: 2 },
          "+=1",
        );

      // ACT II: "Structured Zones" (No Overlap)
      tl.addLabel("act2")
        .set(".act-2", { display: "block" }, "act2")

        // 1. Images: CENTRAL CIRCLE (The Nucleus)
        .fromTo(
          ".memory-orb",
          {
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            z: -500,
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            rotation: () => Math.random() * 90 - 45,
            rotationZ: 0.01, // GPU Force Hack
            willChange: "transform, opacity", // Browser Layout Hint
          },
          {
            opacity: 1,
            scale: 1,
            z: 0,
            // ZONE: Center (-20 to 20)
            x: () =>
              gsap.utils.random(isMobile ? -25 : -20, isMobile ? 25 : 20) +
              "vw",
            y: () =>
              gsap.utils.random(isMobile ? -20 : -15, isMobile ? 20 : 15) +
              "vh",

            rotation: () => Math.random() * 20 - 10,
            stagger: { amount: 2, from: "center" },
            duration: 4,
            ease: "expo.out",
            force3D: true, // Hardware Acceleration
          },
          "act2",
        )

        // 2. White "Cosas Que Amo": SIDE COLUMNS (Left/Right)
        .call(() => {});

      if (document.querySelector(".thing-love")) {
        tl.fromTo(
          ".thing-love",
          {
            opacity: 0,
            scale: 0.5,
            filter: "blur(10px)",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
          },
          {
            opacity: 1,
            scale: 1, // Cleaner scale
            filter: "blur(0px)",
            // ZONE: Strict SIDES (Avoid center images)
            x: () => {
              const side = Math.random() > 0.5 ? 1 : -1;
              return gsap.utils.random(32, 45) * side + "vw";
            },
            y: () => gsap.utils.random(-40, 40) + "vh",

            // TIMING
            duration: 1.5,
            stagger: {
              amount: 4,
              from: "random",
              repeat: -1,
              yoyo: true,
              repeatDelay: 5,
            },
            ease: "sine.inOut",
          },
          "act2+=0.5",
        );
      }

      // 3. Dopamine Labels: CENTRAL & OVERLAY (User Request: "Sobre las imagenes")
      if (document.querySelector(".dopamine-label")) {
        tl.fromTo(
          ".dopamine-label",
          {
            opacity: 0,
            scale: 0,
            rotation: -20,
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            z: 100, // START ON TOP
          },
          {
            opacity: 1,
            scale: 1.1,
            rotation: 0,
            z: 100, // STAY ON TOP

            // DISTRIBUTED OVER IMAGES (Central Zone)
            x: () => gsap.utils.random(-35, 35) + "vw",
            y: () => gsap.utils.random(-30, 30) + "vh",

            stagger: {
              amount: 2,
              from: "random",
            },
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
          },
          "act2+=2",
        );
      }

      // Continuous Drift
      tl.to(
        [".memory-orb", ".thing-love", ".dopamine-label"],
        {
          rotation: "+=3",
          scale: 1.02,
          duration: 10,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          force3D: true, // GPU
          willChange: "transform", // Hint
        },
        "act2+=4",
      );

      // EXIT LOVE CLOUD
      tl.to(
        [".memory-orb", ".thing-love", ".dopamine-label"],
        {
          scale: 0,
          opacity: 0,
          duration: 2,
          ease: "back.in(1)",
        },
        "act2+=14",
      );

      // ACT III: Sanctuary
      tl.addLabel("act3")
        .set(".act-2", { display: "none" }, "act3") // KILL ACT 2 preventing leaks
        .set(".act-3", { display: "flex" }, "act3")
        // Main Quote - CENTER
        .fromTo(
          ".text-garden",
          { opacity: 0, y: 30, scale: 0.9, textShadow: "none" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 3,
            // PROTECTION AURA: Strong Shadow to separate from background
            textShadow: "0 0 30px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)",
            ease: "power2.out",
          },
          "act3",
        )
        .call(() => {});

      // "Primeras Veces": TOP HEMISPHERE (Strict)
      if (document.querySelector(".text-first-time")) {
        tl.fromTo(
          ".text-first-time",
          {
            opacity: 0,
            filter: "blur(4px)",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
          },
          {
            opacity: 0.3, // GHOSTLY
            filter: "blur(0px)",
            // ZONE: Top only
            x: () => gsap.utils.random(-40, 40) + "vw",
            y: () => gsap.utils.random(-45, -20) + "vh",

            // TIMING: Quick & Rare (User Request: "duren menos", "no bucle")
            duration: 0.8,
            stagger: {
              amount: 3,
              from: "random",
              repeat: -1,
              yoyo: true,
              repeatDelay: 12, // Long wait (12s)
            },
            ease: "power2.out",
          },
          "act3+=1",
        );
      }

      // "Tuuuu": BOTTOM HEMISPHERE (Strict)
      if (document.querySelector(".text-tu")) {
        tl.fromTo(
          ".text-tu",
          {
            opacity: 0,
            scale: 0,
            filter: "blur(10px)",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            z: -100, // PUSH BACK
          },
          {
            opacity: 0.25,
            scale: 1,
            filter: "blur(0px)",

            // ZONE: Bottom only
            x: () => gsap.utils.random(-40, 40) + "vw",
            y: () => gsap.utils.random(20, 45) + "vh",

            // TIMING: Quick & Rare
            duration: 1.0,
            stagger: {
              amount: 5,
              from: "random",
              repeat: -1,
              yoyo: true,
              repeatDelay: 15, // Long wait (15s)
            },
            ease: "sine.inOut",
          },
          "act3+=1.5",
        );
      }

      // Fade out sequence - FORCE EXIT (Label-based to bypass infinite loops)
      // CRITICAL FIX: Was "+=4", which waited for infinite loop to end. Now "act3+8".
      tl.to(
        [".text-garden", ".text-first-time", ".text-tu"],
        {
          opacity: 0,
          y: -20,
          filter: "blur(10px)",
          duration: 2,
          stagger: 0.1,
          onComplete: () => {
            // Safety kill
            gsap.killTweensOf(".text-first-time");
            gsap.killTweensOf(".text-tu");
          },
        },
        "act3+=8",
      ); // Fixed timing anchor

      // ACT IV: Proposal
      tl.addLabel("act4", "act3+=10") // Starts 2s after fade begins
        .set(".act-3", { display: "none" }, "act4")
        .set(".act-4", { display: "flex" }, "act4")
        .set([".text-first-time", ".text-tu"], { display: "none" }, "act4")

        .fromTo(
          ".proposal-frame",
          { scale: 0.9, opacity: 0, rotationX: 15 },
          {
            scale: 1,
            opacity: 1,
            rotationX: 0,
            duration: 2.5,
            ease: "power4.out",
          },
          "act4",
        )
        .call(() => {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        });
    },
    {
      scope: container,
      dependencies: [state, memoryImages, thingsILove, firstTimes, tuWords],
    },
  );

  if (state === "IDLE" && !state.includes("SYNCING")) return null;

  const handleHold = (e: React.PointerEvent) => {
    const btn = e.currentTarget;
    gsap.to(btn, { scale: 0.92, duration: 0.4, ease: "power2.out" });
    let count = 0;
    const hapticInterval = window.setInterval(
      () => {
        if (navigator.vibrate) {
          navigator.vibrate(40 + count * 5);
        }
        count++;
      },
      Math.max(80, 400 - count * 40),
    );
    const timer = setTimeout(() => {
      clearInterval(hapticInterval);
      if (navigator.vibrate) navigator.vibrate(1200);
      acceptProposal();
      gsap.to(btn, { scale: 10, opacity: 0, duration: 1.5, ease: "expo.out" });
    }, 2800);
    window.p_timer = timer;
    window.p_haptic = hapticInterval;
  };

  const handleRelease = (e: React.PointerEvent) => {
    const btn = e.currentTarget;
    gsap.to(btn, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    if (window.p_timer) clearTimeout(window.p_timer);
    if (window.p_haptic) clearInterval(window.p_haptic);
  };

  return (
    <div
      ref={container}
      className="fixed inset-0 z-[99999] overflow-hidden select-none touch-none bg-black"
    >
      {/* STARFIELD */}
      {(state === "PLAYING" || state === "ACCEPTED") && (
        <Starfield speedRef={starSpeedRef} state={state} />
      )}

      {/* SYNC + LOADING */}
      {(state === "SYNCING" || (state === "PLAYING" && isAssetsLoading)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[100000] bg-black">
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-2 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-rose-500/50 font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">
            {isAssetsLoading
              ? "Downloading Memories..."
              : "Tuning Eternal Frequency"}
          </p>
        </div>
      )}

      {(state === "PLAYING" || state === "ACCEPTED") && !isAssetsLoading && (
        <div className="absolute inset-0 w-full h-full">
          {/* Act 1 */}
          <div className="act-1 absolute inset-0 hidden items-center justify-center z-10 pointer-events-none">
            <h1 className="text-milov opacity-0 text-5xl md:text-8xl font-serif text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.3)] italic tracking-widest text-center will-change-transform">
              Milov
            </h1>
          </div>

          {/* Act 2: DENSE CLUSTER centered (xPercent/yPercent) */}
          <div className="act-2 absolute inset-0 hidden z-10 w-full h-full pointer-events-none perspective-[1000px]">
            {/* 
                   We remove 'flex items-center justify-center' from parent and strictly center using absolutes 
                   so text and images share same coordinate system (50% 50%) 
                 */}
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Layer 0: Cosas Que Amo (Text) - WHITE */}
              {thingsILove.map((thing, i) => (
                <span
                  key={`love-${i}`}
                  className="thing-love absolute text-white font-serif italic text-xl md:text-2xl whitespace-nowrap will-change-transform drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 z-20 -translate-x-1/2 -translate-y-1/2"
                  style={
                    {
                      // Initial position handled by CSS center + GSAP random offset
                    }
                  }
                >
                  {thing}
                </span>
              ))}

              {/* Layer 1: Images (Center Cluster) */}
              {memoryImages.map((src, i) => (
                <div
                  key={i}
                  className="memory-orb absolute w-28 md:w-48 aspect-[3/4] p-2 bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-0 scale-0 origin-center will-change-transform backface-hidden z-10 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-full h-full rounded-xl overflow-hidden bg-black/40">
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>
              ))}

              {/* Layer 2: Dopamine Labels (Red/Yellow) - ON TOP */}
              {DOPAMINE_LABELS.map((label, i) => (
                <span
                  key={`dopa-${i}`}
                  className={`dopamine-label absolute font-black text-4xl md:text-7xl italic opacity-0 z-30 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] ${i % 2 === 0 ? "text-rose-500" : "text-yellow-400"}`}
                  style={{
                    textShadow: "0 0 20px rgba(0,0,0,0.5)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Act 3: Sanctuary (Quote + Primeras + Tuuuu) */}
          <div className="act-3 absolute inset-0 hidden items-center justify-center z-10 w-full h-full pointer-events-none">
            <h2 className="text-garden opacity-0 text-3xl md:text-5xl font-serif text-emerald-50/90 italic text-center leading-relaxed drop-shadow-2xl will-change-transform z-30 relative px-6 max-w-[90vw]">
              "He construido este lugar
              <br />
              únicamente para nosotros..."
            </h2>

            {/* Atmosphere Text Cloud - BOUNDED */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Primeras Veces (Color A: Emerald/Gold) */}
              {firstTimes.map((text, i) => (
                <span
                  key={`first-${i}`}
                  className="text-first-time absolute text-emerald-200 text-lg md:text-xl font-light tracking-wider opacity-0 drop-shadow-md whitespace-nowrap"
                  style={{
                    top: `${Math.random() * 60 + 20}%`, // Keep vertical center (20-80%)
                    left: `${Math.random() * 80 + 10}%`, // Keep horizontal center (10-90%)
                  }}
                >
                  {text}
                </span>
              ))}

              {/* Tuuuu (Color B: Rose/Pink) */}
              {tuWords.map((word, i) => (
                <span
                  key={`tu-${i}`}
                  className="text-tu absolute text-rose-300 text-4xl md:text-6xl font-serif italic opacity-0 mix-blend-plus-lighter drop-shadow-lg"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Act 4 & 5... */}
          <div className="act-4 absolute inset-0 hidden items-center justify-center z-30">
            {particlesReady && (
              <Particles
                className="absolute inset-0 pointer-events-none"
                options={{
                  fullScreen: { enable: false },
                  fpsLimit: 120,
                  detectRetina: true,
                  particles: {
                    number: { value: window.innerWidth < 768 ? 15 : 25 },
                    color: { value: ["#fb7185", "#fbbf24"] },
                    shape: {
                      type: "image",
                      options: {
                        image: [
                          {
                            src: "https://api.iconify.design/noto:rose.svg",
                            width: 32,
                            height: 32,
                          },
                          {
                            src: "https://api.iconify.design/noto:sparkles.svg",
                            width: 32,
                            height: 32,
                          },
                        ],
                      },
                    },
                    opacity: {
                      value: { min: 0.4, max: 0.8 },
                      animation: { enable: true, speed: 0.5, sync: false },
                    },
                    size: { value: { min: 15, max: 30 } },
                    move: {
                      enable: true,
                      speed: 1,
                      direction: "none",
                      random: true,
                      outModes: "out",
                      straight: false,
                      attract: { enable: true, rotate: { x: 600, y: 1200 } },
                    },
                    rotate: {
                      value: { min: 0, max: 360 },
                      animation: { enable: true, speed: 2, sync: false },
                    },
                  },
                }}
              />
            )}

            <div className="proposal-frame relative w-[85vw] max-w-[400px] aspect-[3/4.5] bg-white/5 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 flex flex-col items-center justify-between shadow-[0_0_100px_rgba(225,29,72,0.4)] ring-1 ring-white/20 will-change-transform">
              <div className="text-center mt-8 space-y-4">
                <span className="text-rose-200/90 font-mono text-[10px] tracking-[0.6em] uppercase block animate-pulse">
                  Estrellita
                </span>
                <h1 className="text-white text-5xl md:text-6xl font-serif font-bold leading-tight drop-shadow-2xl">
                  ¿Quieres ser
                  <br />
                  mi novia?
                </h1>
              </div>

              <button
                className="group relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-rose-900 shadow-[0_20px_60px_rgba(225,29,72,0.5)] flex items-center justify-center border border-white/20 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation outline-none will-change-transform"
                onPointerDown={handleHold}
                onPointerUp={handleRelease}
                onPointerLeave={handleRelease}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="text-5xl md:text-7xl drop-shadow-lg scale-100 group-active:scale-110 transition-transform select-none">
                  🌹
                </span>
                {/* Premium Ripple */}
                <div className="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-active:animate-ping" />
                <div className="absolute inset-[-10px] rounded-full border border-white/10 animate-pulse" />
              </button>

              <p className="mb-2 text-rose-100/60 text-[9px] font-mono tracking-[0.3em] uppercase opacity-80">
                Mantén presionado para aceptar
              </p>
            </div>
          </div>

          {/* Act 5 */}
          {state === "ACCEPTED" && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl animate-in fade-in duration-1000 pointer-events-none">
              <h1 className="text-[25vw] font-black text-rose-500 drop-shadow-[0_0_120px_rgba(225,29,72,0.8)] animate-pulse leading-none">
                SÍ
              </h1>
              <p className="mt-12 text-white text-3xl md:text-5xl font-serif italic tracking-widest animate-bounce">
                TE AMO INFINITO
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
