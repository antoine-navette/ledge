# TODO

Ce qu'il reste à faire avant de merger `refactor/domain-entities`, par catégorie. Le but est d'aligner le projet sur
Saffy (`../saffy`), qui utilise quasiment les mêmes technos. Une entrée terminée est retirée dans le commit qui la
termine.

## API

- **Routes nommées d'après les use cases** plutôt qu'en CRUD. Le front s'aligne ensuite dessus (voir Web).
- **Tuples pour les retours de fonction**, surtout pour les use cases, à la place de l'actuel Result
  `{ success, data | code }`.
- **Inscription atomique** : c'est le repository qui signale que l'email existe déjà (index unique), au lieu d'une
  vérification préalable dans le use case. Un seul appel en base au lieu de deux.
- **`if` + `satisfies never` dans les routes** à la place des `switch` sur les codes d'erreur des use cases.
- **Séparer `Transaction` en deux entités** (revenu et dépense) grâce au polymorphisme.
- **Logs** :
  - `LOG_TARGETS` : `console`, `betterstack`, ou les deux. `LOG_FORMAT` (`json` ou `pretty`) n'est obligatoire qu'avec
    `console`, la source et le token Better Stack qu'avec `betterstack`.
  - En dev : `console` + `pretty`. En prod : `console` + `betterstack`, en `json`, pour envoyer aux deux à la fois.
  - Améliorer `pino.ts` en conséquence.
- **Simplifier `env.ts`** (à voir une fois `LOG_TARGETS` en place, et avec les valeurs passées en dur côté Docker).
- **`tsconfig.json`** : activer toutes les « Style Options » (`noImplicitReturns`, `noUnusedLocals`…).
- **`scripts/`** :
  - Sous-dossiers `docs/generate.ts` et `migrations/run.ts`, avec des fonctions `generate()` et `run()` à la place de
    `main()`.
  - À terme : se passer d'Umzug et passer à des migrations datées plutôt qu'à un numéro incrémenté à la main.

## Web

- **Vraies entités** avec un mapping depuis les réponses de l'API, au lieu d'utiliser directement les types générés
  (les dates y sont typées `string`, par exemple).
- **`config/api.ts` → `http.ts`**, comme dans Saffy.
- **Services en fonctions à plat**, nommées comme les routes de l'API (donc comme les use cases), au lieu d'objets.
- **Tuples pour les retours des services**, comme côté API.

## Infra

- **Projet uniquement sous Docker** :
  - Supprimer `web/.env.example` et passer ses valeurs en dur. Même chose pour certaines valeurs de l'API.
  - En profiter pour simplifier la config nginx.
- **`.env` et `.env.example`** : mieux les gérer, moins déléguer à Docker en dev, ajouter `dotenv`. Mettre à jour
  `api/.dockerignore` en conséquence.
- **Ne plus exposer MongoDB** : binder sur `127.0.0.1`.
- **Healthchecks** : revoir le système actuel.
- **`npm audit`** sur l'API et le web, et corriger ce qui peut l'être.
- **CI/CD** : tout revoir pour que ce soit cohérent, et mettre en place un vrai versionnage des images (plutôt que le
  SHA + `latest`).

## Tests

- **Tests unitaires des entités et des use cases** (`Transaction.validate`, `User.register` / `verifyEmail`,
  `Session.extend`…). Seuls les adapters sont couverts pour l'instant. Pas bloquant pour le merge.

## Documentation

- **Supprimer `api/README.md`**, obsolète.
- **Écrire une vraie doc**, à l'occasion (voir `docs/` dans Saffy).
