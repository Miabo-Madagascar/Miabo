"use client"

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"

interface PendingTutor {
  id: string
  full_name: string
  email: string
  phone: string
  created_at: string
  validation_status: string
  bio: string
  subjects: string[]
}

export function PendingTutorsClient() {
  const [tutors, setTutors] = useState<PendingTutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadTutors = () => {
    setIsLoading(true)
    api.get<PendingTutor[]>("/admin/tutors/pending")
      .then(data => setTutors(data))
      .catch(err => setError(err instanceof ApiError ? err.detail : "Erreur lors du chargement des tuteurs en attente"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadTutors()
  }, [])

  const handleValidation = async (tutorId: string, status: "validated" | "rejected") => {
    setProcessingId(tutorId)
    try {
      await api.put(`/tutors/${tutorId}/validate`, { status })
      setTutors(prev => prev.filter(t => t.id !== tutorId))
    } catch (err: any) {
      alert(err.detail || "Erreur lors de la validation")
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-bg-muted" />)}
    </div>
  )

  if (error) return (
    <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-error">{error}</p>
  )

  if (tutors.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-bg-subtle p-12 text-center mt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
         <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
         </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-text-primary">Aucun tuteur en attente</p>
        <p className="text-sm text-text-secondary mt-1">Tous les tuteurs inscrits ont déjà été validés ou refusés.</p>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {tutors.map((t) => (
        <div key={t.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-bg-base p-6 shadow-sm transition-all hover:border-primary-300 hover:shadow-md">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-text-primary">{t.full_name}</h3>
                <p className="text-sm text-text-muted">{t.email} • {t.phone}</p>
              </div>
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-warning">
                En attente
              </span>
            </div>
            
            <p className="text-sm text-text-secondary mt-3 line-clamp-3 italic">
              "{t.bio || "Aucune description fournie"}"
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {t.subjects && t.subjects.map(s => (
                <span key={s} className="rounded-md bg-bg-subtle border px-2 py-1 text-xs text-text-secondary">
                  {s}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              className="flex-1 border-error text-error hover:bg-error/10"
              isLoading={processingId === t.id}
              disabled={processingId !== null}
              onClick={() => handleValidation(t.id, "rejected")}
            >
              Rejeter
            </Button>
            <Button 
              className="flex-1 bg-success hover:bg-success/90"
              isLoading={processingId === t.id}
              disabled={processingId !== null}
              onClick={() => handleValidation(t.id, "validated")}
            >
              Approuver
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
