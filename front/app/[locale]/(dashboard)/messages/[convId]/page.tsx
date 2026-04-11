/**
 * Page conversation individuelle — split-view liste + chat.
 */

import { ConversationList } from "@/components/messaging/ConversationList"
import { ChatWindowWrapper } from "@/components/messaging/ChatWindowWrapper"

interface Props {
  params: Promise<{ locale: string; convId: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { locale, convId } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] shadow-[var(--shadow-sm)]">
      {/* ── Liste des conversations ────────────────────────────── */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-[var(--border-default)] sm:block lg:w-80">
        <div className="border-b border-[var(--border-default)] px-4 py-3">
          <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
        </div>
        <ConversationList locale={locale} activeConvId={convId} />
      </aside>

      {/* ── Fenêtre de chat ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatWindowWrapper convId={convId} locale={locale} />
      </div>
    </div>
  )
}
