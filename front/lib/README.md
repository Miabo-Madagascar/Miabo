# lib/

Utilitaires et clients partagés — pas de logique UI ici.

## Fichiers clés

```
lib/
├── supabase/
│   ├── client.ts       # createBrowserClient() — côté composant
│   └── server.ts       # createServerClient() — Server Components / Route Handlers
├── api.ts              # fetch() wrappé vers FastAPI (baseURL, auth header JWT)
├── theme.ts            # Exports TS des design tokens (miroir de tokens.css)
├── utils.ts            # cn() (clsx + tailwind-merge), formatAriary(), formatDate()
└── validators/
    ├── session.ts      # Zod schemas pour CreateSessionRequest
    ├── auth.ts         # Zod schemas pour RegisterRequest
    └── payment.ts      # Zod schemas pour WithdrawRequest
```

## Règles

- `supabase/client.ts` : usage uniquement dans les Client Components (`"use client"`)
- `supabase/server.ts` : usage uniquement dans les Server Components et Route Handlers
- `api.ts` : toujours passer le JWT Supabase dans `Authorization: Bearer`
