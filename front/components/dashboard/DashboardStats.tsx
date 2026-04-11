"use client"
/**
 * DashboardStats — affichage de statistiques et graphiques premium.
 */

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { TrendingUp, Users, Calendar, Clock } from "lucide-react"

const DATA_TUTOR = [
  { name: "Lun", sessions: 2, revenue: 40000 },
  { name: "Mar", sessions: 4, revenue: 80000 },
  { name: "Mer", sessions: 3, revenue: 60000 },
  { name: "Jeu", sessions: 5, revenue: 100000 },
  { name: "Ven", sessions: 2, revenue: 40000 },
  { name: "Sam", sessions: 6, revenue: 120000 },
  { name: "Dim", sessions: 1, revenue: 20000 },
]

interface DashboardStatsProps {
  role: "tutor" | "student"
}

export function DashboardStats({ role }: DashboardStatsProps) {
  const isTutor = role === "tutor"

  return (
    <div className="flex flex-col gap-6">
      {/* ── Cartes de résumé ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<Calendar className="text-blue-500" />} 
          label="Sessions" 
          value={isTutor ? "23" : "12"} 
          trend="+12%" 
        />
        <StatCard 
          icon={<Clock className="text-purple-500" />} 
          label="Heures" 
          value={isTutor ? "46h" : "24h"} 
          trend="+5%" 
        />
        {isTutor ? (
          <StatCard 
            icon={<TrendingUp className="text-emerald-500" />} 
            label="Revenus (Ar)" 
            value="460,000" 
            trend="+18%" 
          />
        ) : (
          <StatCard 
            icon={<Users className="text-orange-500" />} 
            label="Tuteurs" 
            value="4" 
            trend="Stable" 
          />
        )}
        <StatCard 
          icon={<TrendingUp className="text-pink-500" />} 
          label="Score" 
          value="4.9/5" 
          trend="+0.1" 
        />
      </div>

      {/* ── Graphique ─────────────────────────────────────────── */}
      <div className="rounded-2xl bg-bg-base p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-text-primary">
            {isTutor ? "Aperçu de l'activité hebdomadaire" : "Ma progression"}
          </h3>
          <select className="text-xs bg-bg-subtle border border-border rounded-lg px-2 py-1 outline-none">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isTutor ? (
              <AreaChart data={DATA_TUTOR}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: 'var(--bg-base)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary-500)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={DATA_TUTOR}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: 'var(--bg-base)'
                  }} 
                />
                <Bar 
                  dataKey="sessions" 
                  fill="var(--color-primary-500)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: any, label: string, value: string, trend: string }) {
  return (
    <div className="p-5 rounded-2xl bg-bg-base border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-bg-subtle">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-bg-subtle text-text-muted"
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    </div>
  )
}
