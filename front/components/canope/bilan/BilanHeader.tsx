import Image from "next/image"
import type { Assessment } from "@/types"
import { AssessmentStatus } from "@/types"

interface Props {
  assessment:     Assessment
  completedCount: number
  total:          number
}

export function BilanHeader({ assessment, completedCount, total }: Props) {
  const isLocked = assessment.status === AssessmentStatus.Validated
  const progress = (completedCount / total) * 100
  const name     = assessment.external_young_full_name ?? assessment.student_full_name ?? "Élève MIABO"
  const idShort  = assessment.id.slice(0, 8)
  const dateStr  = new Date(assessment.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  })

  return (
    <header className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="relative p-7 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div aria-hidden className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(70% 50% at 0% 0%, rgba(58,108,248,.10), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(34,197,94,.10), transparent 60%)" }}/>

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-700 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"/>
              Bilan d&apos;orientation SESAME
            </span>
            <span className="text-[11px] font-semibold text-slate-500">#{idShort}</span>
          </div>

          <h1 className="font-display text-[34px] sm:text-[40px] leading-[1.05] font-bold tracking-tight text-slate-900">
            {name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
            {assessment.serie && (
              <><span>Série {assessment.serie}</span><span className="text-slate-300">·</span></>
            )}
            <span>Débuté le {dateStr}</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              isLocked
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              <span className={`flex h-2 w-2 rounded-full ${isLocked ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`}/>
              {isLocked ? "Bilan validé et verrouillé" : "En cours de réalisation"}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: isLocked ? "#16a34a" : "#3a6cf8" }}/>
              </div>
              <span className="tabular-nums">{completedCount}/{total} modules</span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          <Image src="/logos/sesame.png" alt="Programme SESAME" width={120} height={48}
            className="object-contain" priority/>
        </div>
      </div>
    </header>
  )
}
