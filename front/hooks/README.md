# hooks/

Hooks React custom — logique métier découplée des composants.

## Structure

```
hooks/
├── useAuth.ts          # Session Supabase Auth, rôle courant, logout
├── useProfile.ts       # Profil utilisateur + mise à jour
├── useSessions.ts      # CRUD sessions, statuts, filtres
├── useAvailability.ts  # Créneaux tuteur
├── usePayment.ts       # Initier paiement MVola/Orange, polling statut
├── useMessages.ts      # Realtime Supabase — abonnement conversation
├── useNotifications.ts # Realtime — badge + liste notifications
├── useAssessment.ts    # Soumettre VAK/RIASEC/DISC, lire résultats
├── useTutorSearch.ts   # Recherche + score compatibilité RIASEC
└── useWallet.ts        # Solde tuteur, retrait
```

## Conventions

- Préfixe `use` obligatoire
- Retourner `{ data, isLoading, error }` au minimum
- Les mutations retournent `{ mutate, isPending }`
- Pas d'appels Supabase directement dans les composants
