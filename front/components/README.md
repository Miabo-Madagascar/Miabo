# components/

Composants React organisés par domaine fonctionnel.

## Structure

```
components/
├── ui/              # Primitives génériques (Button, Input, Badge, Modal…)
│                    # Basées sur shadcn/ui + variantes CVA
├── layout/          # Shell de l'application (Header, Sidebar, Footer, Nav)
├── auth/            # Formulaires login/register, guard de route
├── dashboard/       # Widgets stats par rôle (StudentStats, TutorStats…)
├── sessions/        # Carte session, formulaire réservation, calendrier
├── tutors/          # TutorCard, TutorGrid, filtres de recherche
├── messaging/       # ConversationList, MessageBubble, ChatInput
├── canope/          # Tests VAK/RIASEC/DISC, fiche bilan, ressources
└── notifications/   # Toast, NotificationBell, NotificationPanel
```

## Conventions

- Un fichier = un composant (PascalCase)
- Props typées via `@/types`
- Variantes via CVA importées depuis `@/themes/default`
- Pas de logique métier dans les composants — déléguer aux hooks
