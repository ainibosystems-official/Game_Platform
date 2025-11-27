import { useState, useEffect, useRef } from "react";

interface Asset {
  id: number;
  name: string;
  image: string;
  owner: string;
}

export default function GameAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sort, setSort] = useState("id");
  const [modalAsset, setModalAsset] = useState<Asset | null>(null);


  // refs for 3D tilt
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/assets.json")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setTimeout(() => setLoaded(true), 300);
      });
  }, []);

  const handleConnect = () => {
    setWallet(wallet ? null : "0x1111");
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sort === "id") return a.id - b.id;
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const filteredAssets =
    showMineOnly && wallet
      ? sortedAssets.filter(
        (a) => a.owner.toLowerCase() === wallet.toLowerCase()
      )
      : sortedAssets;

  return (
    <div className="relative min-h-screen bg-black text-white p-10 overflow-hidden">

      {/* Background distortion halos */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
        <div className="absolute w-[1000px] h-[1000px] bg-purple-700 rounded-full blur-[200px] -top-80 -left-40 animate-halo"></div>
        <div className="absolute w-[800px] h-[800px] bg-blue-600 rounded-full blur-[200px] bottom-0 right-0 animate-halo2"></div>
      </div>

      {/* Distortion Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-distortion opacity-15"></div>

      <h1 className="text-3xl font-bold mb-6 tracking-wide relative z-10">
        Game Asset Dashboard
      </h1>

      {/* Connect Wallet */}
      <button
        onClick={handleConnect}
        className="px-6 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-500 mb-4 animate-pulse-slow shadow-lg shadow-purple-900/40 relative z-10"
      >
        {wallet ? `Connected (${wallet})` : "Connect Wallet"}
      </button>

      {/* Show Only My Assets */}
      {wallet && (
        <button
          onClick={() => setShowMineOnly((v) => !v)}
          className="ml-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-300 relative z-10"
        >
          {showMineOnly ? "Show All Assets" : "Show Only My Assets"}
        </button>
      )}

      {/* Sorting */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="ml-4 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm relative z-10"
      >
        <option value="id">Sort by ID</option>
        <option value="name">Sort by Name</option>
      </select>

      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 relative z-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-gray-800 h-52 animate-shimmer"
            ></div>
          ))}
        </div>
      )}

      {/* Asset grid */}
      <div
        className={`relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
          }`}
      >
        {filteredAssets.map((asset, index) => {
          const isOwned =
            wallet && asset.owner.toLowerCase() === wallet.toLowerCase();

          const rarity = ["Common", "Rare", "Epic", "Legendary"][asset.id % 4];

          // NEW FIXED tilt (does NOT override hover pop-out)
          const handleMouseMove = (e: any) => {
            const card = cardRefs.current[index];
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateX = ((y - rect.height / 2) / rect.height) * -6;
            const rotateY = ((x - rect.width / 2) / rect.width) * 6;

            // combine tilt + pop-out scale
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.07)`;
          };

          const resetTilt = () => {
            const card = cardRefs.current[index];
            if (card) card.style.transform = "scale(1)";
          };

          return (
            <div
              key={asset.id}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              className={`
                card-ultra-pop
                relative p-[2px] rounded-xl transition-all duration-300 cursor-pointer animate-cardEnter
                ${isOwned
                  ? "bg-gradient-to-br from-green-400 via-emerald-500 to-green-700"
                  : "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800"
                }
                hover:shadow-[0_0_40px_#a855f7aa]
                animate-breathe
              `}
            >

              {/* Neon corner ornaments */}
              <div className="absolute -top-[2px] left-3 w-6 h-[2px] bg-purple-400"></div>
              <div className="absolute -left-[2px] top-3 w-[2px] h-6 bg-purple-400"></div>
              <div className="absolute -bottom-[2px] right-3 w-6 h-[2px] bg-purple-400"></div>
              <div className="absolute -right-[2px] bottom-3 w-[2px] h-6 bg-purple-400"></div>

              {/* Sparkles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden sparkle-container">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="sparkle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  ></div>
                ))}
              </div>

              <div
                className="rounded-xl bg-gray-900 p-4 overflow-hidden relative"
                ref={(el) => (cardRefs.current[index] = el)}
              >


                {/* Rarity badge */}
                <div
                  className={`
                    absolute top-3 right-3 px-3 py-1 text-xs rounded-full backdrop-blur border
                    ${rarity === "Legendary" &&
                    "bg-yellow-500/40 border-yellow-400/40 text-yellow-300"
                    }
                    ${rarity === "Epic" &&
                    "bg-purple-700/40 border-purple-500/60 text-purple-300"
                    }
                    ${rarity === "Rare" &&
                    "bg-blue-700/40 border-blue-500/60 text-blue-300"
                    }
                    ${rarity === "Common" &&
                    "bg-gray-700/40 border-gray-500/60 text-gray-300"
                    }
                  `}
                >
                  ★ {rarity}
                </div>

                {/* Image */}
                <div className="overflow-hidden rounded mb-4 group relative">
                  <div className="absolute inset-0 z-20 pointer-events-none hologram-lines"></div>
                  <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>

                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <h2 className="text-xl font-semibold drop-shadow">{asset.name}</h2>
                <p className="text-gray-400 text-sm mt-1">Owner: {asset.owner}</p>

                <button
                  className="mt-3 px-3 py-1 text-xs rounded bg-purple-800/60 border border-purple-600 hover:bg-purple-700 transition z-20 relative"
                  onClick={() => setModalAsset(asset)}
                >
                  Expand Hologram
                </button>

              </div>

              {/* Shimmer */}
              <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-20 transition-opacity bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.4),transparent)] animate-shimmer2"></div>
            </div>
          );
        })}
      </div>

      {modalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/80 animate-fadeIn">

          {/* Background energy field */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[1200px] h-[1200px] bg-purple-600/30 blur-[250px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-energyPulse"></div>
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>
            <div className="absolute inset-0 hologram-lines pointer-events-none"></div>
          </div>

          {/* MODAL BOX */}
          <div className="relative w-[90%] max-w-3xl bg-black/60 border border-purple-700/50 rounded-xl shadow-xl p-6 animate-modalPop overflow-hidden">

            {/* Close button */}
            <button
              className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center 
             rounded-full bg-black/40 hover:bg-black/60 backdrop-blur 
             text-white/90 text-2xl z-[9999] pointer-events-auto"
              onClick={() => setModalAsset(null)}
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-6 text-purple-300 tracking-wide drop-shadow">
              {modalAsset.name}
            </h2>

            {/* HOLOGRAM IMAGE */}
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              {/* Parallax glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 mix-blend-screen animate-holoGlow pointer-events-none"></div>

              {/* Scanlines */}
              <div className="absolute inset-0 hologram-lines"></div>

              {/* Image */}
              <img
                src={modalAsset.image}
                alt={modalAsset.name}
                className="absolute inset-0 w-full h-full object-contain animate-float3D"
              />
            </div>

            {/* INFO SECTION */}
            <div className="mt-6 text-center text-purple-200/80">
              <p className="text-lg mb-2">Owner: {modalAsset.owner}</p>

              <p className="text-sm opacity-70">
                Signal stabilized.
                Energy resonance aligned.
                Hologram integrity level: <span className="text-purple-300">98.6%</span>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* STYLE BLOCK */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes modalPop {
          0%   { transform: scale(0.92) translateY(20px); opacity: 0; }
          100% { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        .animate-modalPop {
          animation: modalPop 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Floating hologram 3D effect */
        @keyframes float3D {
          0%   { transform: translateY(0)     rotateX(0deg) rotateY(0deg); }
          50%  { transform: translateY(-10px) rotateX(3deg) rotateY(-3deg); }
          100% { transform: translateY(0)     rotateX(0deg) rotateY(0deg); }
        }
        .animate-float3D {
          animation: float3D 6s ease-in-out infinite;
        }

        /* Hologram glowing pulsation */
        @keyframes holoGlow {
          0%,100% { opacity: 0.3; }
          50%     { opacity: 0.6; }
        }
        .animate-holoGlow {
          animation: holoGlow 5s infinite ease-in-out;
        }

        /* Massive background pulse */
        @keyframes energyPulse {
          0%,100% { transform: scale(1);   opacity: 0.4; }
          50%     { transform: scale(1.15); opacity: 0.7; }
        }
        .animate-energyPulse {
          animation: energyPulse 8s infinite ease-in-out;
        }

        @keyframes halo {
          0%   { transform: scale(1);   opacity: 0.5; }
          50%  { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1);   opacity: 0.5; }
        }
        .animate-halo {
          animation: halo 10s infinite ease-in-out;
        }

        @keyframes halo2 {
          0%,100% { transform: scale(1);   opacity: 0.4; }
          50%     { transform: scale(1.05); opacity: 0.6; }
        }
        .animate-halo2 {
          animation: halo2 12s infinite ease-in-out;
        }

        @keyframes breathe {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.01); }
          100% { transform: scale(1); }
        }
        .animate-breathe {
          animation: breathe 6s infinite ease-in-out;
        }

        @keyframes cardEnter {
          0%   { opacity: 0; transform: translateY(20px) scale(0.95) rotateX(10deg); }
          100% { opacity: 1; transform: translateY(0)    scale(1)    rotateX(0deg); }
        }
        .animate-cardEnter {
          animation: cardEnter .6s ease forwards;
        }

        @keyframes shimmer {
          0%   { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            #2a2a2a 0%,
            #3a3a3a 40%,
            #4a4a4a 60%,
            #2a2a2a 100%
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer2 {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer2 {
          animation: shimmer2 2s infinite linear;
        }

        .hologram-lines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.05) 0px,
            rgba(255,255,255,0.05) 1px,
            transparent             3px,
            transparent             6px
          );
          animation: holoMove 4s linear infinite;
        }
        @keyframes holoMove {
          from { transform: translateY(0); }
          to   { transform: translateY(-20px); }
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(#444 1px, transparent 1px),
            linear-gradient(90deg, #444 1px, transparent 1px);
          background-size: 20px 20px;
          mix-blend-mode: overlay;
          animation: gridPulse 4s infinite ease-in-out;
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.1; }
          50%     { opacity: 0.25; }
        }

        .bg-distortion {
          background:
            radial-gradient(circle at 20% 30%, rgba(255,0,255,0.15), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,200,255,0.15), transparent 40%);
          animation: distort 8s infinite ease-in-out;
        }
        @keyframes distort {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.05); }
        }

        @keyframes sparkleFloat {
          0%   { opacity: 0; transform: translateY(0)     scale(0.4); }
          50%  { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.4); }
        }
        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, white, transparent);
          border-radius: 50%;
          opacity: 0;
          animation-name: sparkleFloat;
        }

        @keyframes pulse-slow {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }

        /* ==================================================== */
        /* ULTRA POP EFFECT — OPTION C                          */
        /* ==================================================== */

        .card-ultra-pop {
          perspective: 800px;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 1s ease-out,
            filter 1s ease-out;
        }

        .card-ultra-pop:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow:
            0 0 35px rgba(168, 85, 247, 0.25),
            0 0 60px rgba(59, 130, 246, 0.18);
          filter: brightness(1.15) saturate(1.2);
        }

        .card-ultra-pop:hover .sparkle {
          animation-duration: 1.2s !important;
        }

        .card-ultra-pop:hover .hologram-lines {
          animation-duration: 2s !important;
        }

        .card-ultra-pop:hover .bg-grid-pattern {
          animation-duration: 1.8s !important;
        }

        @keyframes haloBurst {
          0%   { transform: scale(1);   opacity: 0.4; }
          50%  { transform: scale(1.15); opacity: 0.7; }
          100% { transform: scale(1);   opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
