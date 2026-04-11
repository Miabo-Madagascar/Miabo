/**
 * Page messagerie — liste des conversations.
 * Sur mobile : liste seule. Sur desktop : split-view avec placeholder.
 */

import { ConversationList } from "@/components/messaging/ConversationList"

interface Props { params: Promise<{ locale: string }> }

export default async function MessagesPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] shadow-[var(--shadow-sm)]">
      {/* ── Liste des conversations ────────────────────────────── */}
      <aside className="w-full shrink-0 overflow-y-auto border-r border-[var(--border-default)] sm:w-72 lg:w-80">
        <div className="border-b border-[var(--border-default)] px-4 py-3">
          <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
        </div>
        <ConversationList locale={locale} />
      </aside>

      {/* ── Placeholder desktop ────────────────────────────────── */}
      <div className="hidden flex-1 items-center justify-center sm:flex">
        <p className="text-sm text-[var(--text-tertiary)]">
          Sélectionnez une conversation pour commencer
        </p>
      </div>
    </div>
  )
}
