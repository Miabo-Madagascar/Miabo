"use client"
/**
 * SessionsCalendar — vue calendrier des sessions.
 * Utilise react-calendar pour l'affichage mensuel.
 */

import { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Badge } from "@/components/ui/Badge"

interface Session {
  id:               string
  status:           string
  subject:          string
  scheduled_at:     string
  duration_minutes: number
  tutor?:           { full_name: string }
  student?:         { full_name: string }
}

interface SessionsCalendarProps {
  sessions: Session[]
  locale:   string
}

export function SessionsCalendar({ sessions, locale }: SessionsCalendarProps) {
  const [date, setDate] = useState(new Date())

  // Helper pour trouver les sessions d'un jour donné
  const getSessionsForDate = (d: Date) => {
    return sessions.filter(s => {
      const sDate = new Date(s.scheduled_at)
      return sDate.getFullYear() === d.getFullYear() &&
             sDate.getMonth() === d.getMonth() &&
             sDate.getDate() === d.getDate()
    })
  }

  // Personnalisation des tuiles du calendrier
  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== "month") return null
    const daySessions = getSessionsForDate(date)
    if (daySessions.length === 0) return null

    return (
      <div className="mt-1 flex flex-col gap-0.5">
        {daySessions.slice(0, 2).map(s => (
          <div key={s.id} className="text-[10px] truncate px-1 rounded-sm bg-primary-100 text-primary-700 font-medium">
            {s.subject}
          </div>
        ))}
        {daySessions.length > 2 && (
          <div className="text-[10px] text-text-muted px-1">
            + {daySessions.length - 2} autres
          </div>
        )}
      </div>
    )
  }

  const selectedSessions = getSessionsForDate(date)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="rounded-2xl bg-bg-base p-6 shadow-sm border border-border">
        <style>{`
          .react-calendar {
            width: 100%;
            border: none;
            font-family: inherit;
          }
          .react-calendar__tile {
            height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
            border-radius: 12px;
            transition: background 0.2s;
          }
          .react-calendar__tile--active {
            background: var(--color-primary-50) !important;
            color: var(--color-primary-600) !important;
            font-weight: 600;
          }
          .react-calendar__tile:hover {
            background: var(--bg-subtle) !important;
          }
          .react-calendar__navigation button {
            font-weight: 600;
            color: var(--text-primary);
          }
          .react-calendar__month-view__weekdays__weekday {
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-muted);
            padding-bottom: 12px;
          }
           abbr[title] {
            text-decoration: none;
          }
        `}</style>
        <Calendar
          onChange={(v) => setDate(v as Date)}
          value={date}
          locale={locale}
          tileContent={tileContent}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-text-primary">
          Sessions le {date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
        </h3>
        <div className="flex flex-col gap-3">
          {selectedSessions.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-border bg-bg-base hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={s.status === 'confirmed' ? 'success' : 'warning'}>
                  {s.status}
                </Badge>
                <span className="text-xs text-text-muted">
                  {new Date(s.scheduled_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="font-bold text-text-primary">{s.subject}</p>
              <p className="text-xs text-text-secondary mt-1">
                {s.tutor?.full_name || s.student?.full_name} • {s.duration_minutes} min
              </p>
            </div>
          ))}
          {selectedSessions.length === 0 && (
            <p className="text-sm text-text-muted italic text-center py-8">
              Aucune session prévue ce jour.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
