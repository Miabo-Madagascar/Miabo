# docs/

Documentation technique du projet MIABO v2.

## Fichiers

| Fichier | Contenu |
|---|---|
| `database-schema.drawio` | Schéma entité-relation — ouvrir avec draw.io ou diagrams.net |
| `ARCHITECTURE.md` | Vue d'ensemble technique, flux de données, décisions d'architecture |
| `CONVENTIONS.md` | Conventions de code (nommage, structure, règles TypeScript/Python) |

## Schéma BDD

Le fichier `database-schema.drawio` représente les 19 tables regroupées par domaine :
- **Bleu** : Utilisateurs & Auth (profiles, student_profiles, tutor_profiles…)
- **Vert** : Sessions & Disponibilités
- **Orange** : Paiements & Escrow
- **Gris** : Messagerie & Notifications
- **Violet** : CANOPE/COSP (assessments, resources, reviews)
