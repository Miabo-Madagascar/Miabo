/**
 * DiscLikert — échelle Likert 1-5 en 3 variantes : numbers, dots, faces.
 */

export type LikertStyle = "numbers" | "dots" | "faces"

interface LikertProps {
  style:    LikertStyle
  value:    number | undefined
  onChange: (v: number) => void
  accent:   string
}

const DOT_LABELS  = ["Pas du tout", "Plutôt non", "Mitigé", "Plutôt oui", "Tout à fait"]
const FACE_PATHS  = [
  "M8 14c0 1.2 1 2 2 2s2-.8 2-2",
  "M8 14c.6.7 1.3 1 2 1s1.4-.3 2-1",
  "M8 14h4",
  "M8 13c.6.8 1.3 1.2 2 1.2s1.4-.4 2-1.2",
  "M8 13c.5 1.4 1.4 2 2 2s1.5-.6 2-2",
]
const FACE_LABELS = ["Désaccord total","Désaccord","Neutre","Accord","Accord total"]

function LikertNumbers({ value, onChange, accent }: Omit<LikertProps, "style">) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400 w-20 text-right">Désaccord</span>
      <div className="flex flex-1 items-center justify-around">
        {[1,2,3,4,5].map(v => {
          const active = value === v
          return (
            <button key={v} onClick={() => onChange(v)}
              className={`relative h-11 w-11 rounded-full text-sm font-bold transition-all duration-200 active:scale-90 ${
                active ? "text-white shadow-lg" : "border-2 border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
              style={active ? { background: accent, boxShadow: `0 8px 22px ${accent}40, 0 0 0 4px ${accent}1a` } : {}}>
              {v}
            </button>
          )
        })}
      </div>
      <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400 w-20">Accord</span>
    </div>
  )
}

function LikertDots({ value, onChange, accent }: Omit<LikertProps, "style">) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400 w-20 text-right">Désaccord</span>
      <div className="flex flex-1 items-center justify-between gap-2">
        {[1,2,3,4,5].map(v => {
          const active = value === v
          const size   = 14 + v * 4
          return (
            <button key={v} onClick={() => onChange(v)} title={DOT_LABELS[v-1]}
              className="group flex flex-col items-center gap-2 flex-1 cursor-pointer">
              <span className="block rounded-full transition-all duration-200 group-active:scale-90"
                style={{ width: size, height: size, background: active ? accent : "transparent",
                  border: `2px solid ${active ? accent : "#cbd5e1"}`,
                  boxShadow: active ? `0 6px 18px ${accent}50` : "none" }}/>
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-slate-900" : "text-slate-400"}`}>{DOT_LABELS[v-1]}</span>
            </button>
          )
        })}
      </div>
      <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400 w-20">Accord</span>
    </div>
  )
}

function LikertFaces({ value, onChange, accent }: Omit<LikertProps, "style">) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      {[1,2,3,4,5].map(v => {
        const active = value === v
        return (
          <button key={v} onClick={() => onChange(v)} title={FACE_LABELS[v-1]}
            className="group flex-1 flex flex-col items-center gap-2 cursor-pointer">
            <svg viewBox="0 0 20 20" className="h-10 w-10 transition-all duration-200 group-active:scale-90"
              style={{ color: active ? accent : "#cbd5e1", filter: active ? `drop-shadow(0 6px 12px ${accent}60)` : "none" }}>
              <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/>
              <circle cx="7.5" cy="8.5" r=".9" fill="currentColor"/>
              <circle cx="12.5" cy="8.5" r=".9" fill="currentColor"/>
              <path d={FACE_PATHS[v-1]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${active ? "text-slate-900" : "text-slate-400"}`}>
              {FACE_LABELS[v-1].split(" ")[0]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function DiscLikert({ style, value, onChange, accent }: LikertProps) {
  if (style === "dots")  return <LikertDots  value={value} onChange={onChange} accent={accent}/>
  if (style === "faces") return <LikertFaces value={value} onChange={onChange} accent={accent}/>
  return <LikertNumbers value={value} onChange={onChange} accent={accent}/>
}
