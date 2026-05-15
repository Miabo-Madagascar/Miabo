/**
 * LikertQuestion — carte question avec échelle Likert 1–5, partagée entre les tests.
 */

interface LikertQuestionProps {
  index:      number
  text:       string
  value:      number | undefined
  onChange:   (value: number) => void
  leftLabel?: string
  rightLabel?: string
}

export function LikertQuestion({
  index, text, value, onChange, leftLabel = "Non", rightLabel = "Oui !",
}: LikertQuestionProps) {
  return (
    <div className={`flex flex-col items-center group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
      value
        ? "border-primary-100 bg-primary-50"
        : "border-border bg-bg-base hover:border-primary-200 hover:shadow-sm"
    }`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-muted text-[10px] font-bold text-text-secondary group-hover:bg-primary-100 group-hover:text-primary">
          {index + 1}
        </span>
        <p className="text-base font-medium leading-normal text-text-primary">{text}</p>
      </div>

      <div className="relative flex items-center w-[80%] justify-between gap-4 px-2 sm:px-12">
        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">
          {leftLabel}
        </span>

        <div className="flex flex-1 items-center justify-around gap-5">
          {[1, 2, 3, 4, 5].map(val => (
            <button
              key={val}
              onClick={() => onChange(val)}
              className={`h-10 w-10 flex items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-90 ${
                value === val
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/30"
                  : "border-border text-text-secondary hover:border-primary-300 hover:text-primary"
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">
          {rightLabel}
        </span>
      </div>
    </div>
  )
}
