# app/ — Next.js App Router

Routes de l'application — un dossier = une route.

## Structure des routes

```
app/
├── (public)/               # Routes sans auth
│   ├── page.tsx            # Landing page
│   ├── tutors/             # Catalogue tuteurs public
│   └── auth/
│       ├── login/
│       └── register/
├── (app)/                  # Routes protégées (AuthGuard)
│   ├── layout.tsx          # Shell avec Header + Sidebar
│   ├── dashboard/          # Redirect selon rôle
│   ├── sessions/
│   │   ├── page.tsx        # Liste
│   │   ├── [id]/page.tsx   # Détail
│   │   └── new/page.tsx    # Réservation
│   ├── messages/
│   │   └── [id]/page.tsx
│   ├── profile/
│   ├── wallet/             # Tuteur uniquement
│   └── admin/              # Admin/CANOPE uniquement
├── api/                    # Route Handlers Next.js
│   └── webhooks/
│       ├── mvola/route.ts
│       └── orange/route.ts
└── layout.tsx              # Root layout (providers, fonts, PWA)
```

## Conventions

- Les groupes `(public)` / `(app)` ne créent pas de segment URL
- Pas de logique métier dans les `page.tsx` — déléguer aux hooks
- Les Route Handlers utilisent `supabase/server.ts`
