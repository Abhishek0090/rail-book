// Side view of an electrified line along the bottom of the hero: catenary,
// masts, rail on sleepers and ballast, and a 15-coach train hauled by an
// English Electric style electric locomotive. Motion is CSS (globals.css:
// .train-run moves the train, .rb-wheel turns the wheels).
//
// Track box is 80px tall. Key heights from its top:
//   messenger wire 6, contact wire 12, rail top 64.
// The train SVG starts 10px down, so its wheel bottoms (y=54) sit on the rail
// and the raised pantograph head (y=2) touches the contact wire.

const COACHES = 15;
const COACH_L = 100;
const GAP = 6;
const PITCH = COACH_L + GAP;
const LOCO_X = COACHES * PITCH;
const LOCO_L = 128;
const TRAIN_W = LOCO_X + LOCO_L + 2;

const C = {
  body: "var(--color-brand-800)",
  band: "var(--color-grape-600)",
  stripe: "var(--color-amber-300)",
  roof: "#cbd5e1",
  glass: "#1e293b",
  frame: "#334155",
  wheel: "#0f172a",
  rim: "#64748b",
};

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="rb-wheel">
      <circle cx={cx} cy={50} r={4} fill={C.wheel} stroke={C.rim} strokeWidth={0.8} />
      <path d={`M${cx - 3} 50 H${cx + 3} M${cx} 47 V53`} stroke={C.rim} strokeWidth={0.6} />
    </g>
  );
}

function Bogie({ from, wheels }: { from: number; wheels: number[] }) {
  const to = wheels[wheels.length - 1] + 5;
  return (
    <g>
      <rect x={from} y={44} width={to - from} height={4} rx={1} fill={C.frame} />
      {wheels.map((cx) => (
        <Wheel key={cx} cx={cx} />
      ))}
    </g>
  );
}

function Coach({ x, powerCar }: { x: number; powerCar: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* roof and body */}
      <rect x={1} y={17} width={COACH_L - 2} height={4} rx={2} fill={C.roof} />
      <rect x={0} y={19} width={COACH_L} height={23} rx={2} fill={C.body} />
      {/* doors at both ends */}
      <rect x={4} y={22} width={6} height={18} rx={1} fill="none" stroke="white" strokeOpacity={0.25} strokeWidth={0.6} />
      <rect x={COACH_L - 10} y={22} width={6} height={18} rx={1} fill="none" stroke="white" strokeOpacity={0.25} strokeWidth={0.6} />
      {powerCar ? (
        // generator car: louvres instead of windows
        [20, 32, 44, 56, 68].map((gx) => (
          <rect key={gx} x={gx} y={24} width={9} height={8} fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={0.6} />
        ))
      ) : (
        Array.from({ length: 8 }, (_, w) => (
          <g key={w}>
            <rect x={15 + w * 10} y={24} width={7} height={6} rx={0.8} fill={C.glass} opacity={0.9} />
            <rect x={15 + w * 10} y={24} width={7} height={1.5} fill="white" opacity={0.25} />
          </g>
        ))
      )}
      {/* livery */}
      <rect x={0} y={34.5} width={COACH_L} height={0.8} fill={C.stripe} />
      <rect x={0} y={36} width={COACH_L} height={3} fill={C.band} />
      {/* underframe and bogies */}
      <rect x={6} y={42} width={COACH_L - 12} height={3} fill={C.frame} />
      <rect x={40} y={42} width={20} height={4} rx={0.5} fill={C.frame} />
      <Bogie from={7} wheels={[12, 26]} />
      <Bogie from={COACH_L - 31} wheels={[COACH_L - 26, COACH_L - 12]} />
      {/* gangway bellows to the next vehicle */}
      <rect x={COACH_L} y={22} width={GAP} height={17} fill="#475569" />
    </g>
  );
}

function Locomotive({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* rear pantograph lowered, front pantograph raised to the wire */}
      <path d="M22 14 L34 11 L46 14" stroke={C.frame} strokeWidth={1.2} fill="none" />
      <path d="M30 11 H40" stroke={C.frame} strokeWidth={1.2} />
      <path d="M76 14 L90 7 L78 2" stroke={C.frame} strokeWidth={1.2} fill="none" />
      <path d="M72 2 H90" stroke={C.wheel} strokeWidth={1.4} />
      {/* roof with insulators */}
      <rect x={3} y={13} width={116} height={4} rx={1.5} fill={C.roof} />
      {[30, 60, 82].map((ix) => (
        <rect key={ix} x={ix} y={11.5} width={3} height={2} fill={C.rim} />
      ))}
      {/* body: flat rear cab, slightly raked front cab */}
      <path d="M0 18 Q0 16 3 16 H118 L127 23 V42 H0 Z" fill={C.body} />
      {/* cab windows and doors */}
      <path d="M117 19 L124 24 V29 H117 Z" fill={C.glass} />
      <rect x={3} y={20} width={8} height={8} rx={1} fill={C.glass} />
      <rect x={106} y={20} width={8} height={8} rx={1} fill={C.glass} opacity={0.9} />
      <rect x={14} y={20} width={6} height={19} rx={1} fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={0.6} />
      <rect x={98} y={20} width={6} height={19} rx={1} fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={0.6} />
      {/* machinery room louvres */}
      {[26, 38, 50, 62, 74, 86].map((gx) => (
        <g key={gx} stroke="white" strokeOpacity={0.28} strokeWidth={0.6}>
          {[0, 2, 4, 6].map((d) => (
            <path key={d} d={`M${gx + d} 21 V31`} />
          ))}
        </g>
      ))}
      {/* livery, builder's plate, lights */}
      <rect x={0} y={34.5} width={127} height={0.8} fill={C.stripe} />
      <rect x={0} y={36} width={127} height={3} fill={C.band} />
      <rect x={56} y={31.5} width={10} height={2.5} rx={0.5} fill={C.stripe} />
      <text x={58} y={33.6} fontSize={2.2} fontWeight={700} fill={C.body}>
        EE
      </text>
      <circle cx={124.5} cy={31} r={1.4} fill="#fef3c7" />
      <circle cx={124.5} cy={38} r={0.9} fill="#fca5a5" />
      {/* underframe, equipment box and two three-axle bogies */}
      <rect x={4} y={42} width={120} height={3} fill={C.frame} />
      <rect x={50} y={42} width={28} height={5} rx={1} fill={C.frame} />
      <Bogie from={8} wheels={[13, 26, 39]} />
      <Bogie from={84} wheels={[89, 102, 115]} />
    </g>
  );
}

export default function TrainTrack() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-4 h-20 overflow-hidden"
    >
      {/* Static scenery. Wider than any screen, so drawn 1:1 and only clipped. */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMinYMax slice"
        viewBox="0 0 4000 80"
      >
        {/* masts with cantilever arms */}
        {Array.from({ length: 19 }, (_, i) => {
          const mx = i * 220 + 60;
          return (
            <g key={mx}>
              <rect x={mx} y={3} width={3} height={64} fill="#cbd5e1" />
              <path d={`M${mx + 3} 6 H${mx + 34} M${mx + 3} 13 L${mx + 30} 12`} stroke="#94a3b8" strokeWidth={1} />
            </g>
          );
        })}
        {/* catenary: messenger wire, contact wire, droppers */}
        <path d="M0 6 H4000" stroke="#94a3b8" strokeWidth={0.8} />
        <path d="M0 12 H4000" stroke="#64748b" strokeWidth={1} />
        {Array.from({ length: 134 }, (_, i) => (
          <path key={i} d={`M${i * 30 + 10} 6 V12`} stroke="#94a3b8" strokeWidth={0.5} />
        ))}
        {/* ballast, sleepers, rail */}
        <path d="M0 78 L0 70 Q2000 66 4000 70 V78 Z" fill="#e2e8f0" />
        {Array.from({ length: 360 }, (_, i) => (
          <circle key={i} cx={i * 11 + (i % 3) * 3} cy={71 + (i % 4) * 1.6} r={0.9} fill="#cbd5e1" />
        ))}
        {Array.from({ length: 400 }, (_, i) => (
          <rect key={i} x={i * 10 + 2} y={66} width={6} height={3} fill="#94a3b8" />
        ))}
        <rect x={0} y={64} width={4000} height={2} fill="#64748b" />
      </svg>

      {/* The train */}
      <div className="train-run absolute bottom-[14px] left-0">
        <svg width={TRAIN_W} height={56} viewBox={`0 0 ${TRAIN_W} 56`}>
          {Array.from({ length: COACHES }, (_, i) => (
            <Coach key={i} x={i * PITCH} powerCar={i === 0} />
          ))}
          <Locomotive x={LOCO_X} />
        </svg>
      </div>
    </div>
  );
}
