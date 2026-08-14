export default function Threads({ className = "", style = {} }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={style}
    >
      {/* ReactBits Style Visible Animated Wavy Line Threads (Pure CSS GPU Accelerated) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 600"
      >
        <defs>
          <linearGradient id="wave-gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D3A68" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#C9A227" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="wave-navy-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0D3A68" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0A2B4E" stopOpacity="0.4" />
          </linearGradient>

          <pattern id="dot-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1.2" fill="#0D3A68" opacity="0.15" />
          </pattern>
        </defs>

        {/* Dot Pattern Fill */}
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />

        {/* Wavy Line 1 */}
        <path
          d="M-100 200 C 300 400, 600 100, 1000 350 C 1200 450, 1400 250, 1600 300"
          fill="none"
          stroke="url(#wave-gold-grad)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
        />

        {/* Wavy Line 2 */}
        <path
          d="M-100 350 C 250 150, 700 450, 1100 200 C 1300 100, 1500 400, 1600 200"
          fill="none"
          stroke="url(#wave-navy-grad)"
          strokeWidth="3"
        />

        {/* Wavy Line 3 */}
        <path
          d="M-50 100 C 400 300, 800 50, 1200 280 C 1350 350, 1500 180, 1650 220"
          fill="none"
          stroke="#C9A227"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </svg>

      {/* ReactBits Circular Glow Orbs */}
      <div className="absolute top-10 left-1/4 h-[350px] w-[350px] rounded-full bg-[#0D3A68]/15 blur-3xl" />
      <div className="absolute top-1/3 right-10 h-[380px] w-[380px] rounded-full bg-[#C9A227]/20 blur-3xl" />
    </div>
  );
}
