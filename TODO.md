# TODO

Ce qu'il reste à faire avant de merger `refactor/domain-entities`, par catégorie. Le but est d'aligner le projet sur
Saffy (`../saffy`), qui utilise quasiment les mêmes technos. Une entrée terminée est retirée dans le commit qui la
termine.

## API

- **Prolonger la session au plus une fois par jour** (`EXTENSION_INTERVAL`, comme dans Saffy), au lieu d'une écriture en
  base à chaque requête authentifiée.
- **Reader CQRS pour l'authentification**, si besoin d'optimiser : charger la session et son user en une seule requête,
  au lieu de deux lectures dans `AuthenticateUseCase`.
- **Séparer `Transaction` en deux entités** (revenu et dépense) grâce au polymorphisme.
- **Type dédié pour `Transaction.date`**, un jour calendaire sans heure ni fuseau, au lieu d'une `Date` à minuit UTC.
  Piste privilégiée : une chaîne brandée `CalendarDate` (`"YYYY-MM-DD"`) avec un module de fonctions, comme les IDs
  brandés, côté API et front. Stockée telle quelle en base (l'ordre alphabétique est chronologique, donc les requêtes
  par période marchent toujours), avec une migration. Alternatives : un value object (classe) si la date porte un jour
  de vraies règles, ou `Temporal.PlainDate` quand Temporal sera disponible partout. À faire avec la séparation de
  `Transaction`.
- **Logs** :
  - `LOG_TARGETS` : `console`, `betterstack`, ou les deux. `LOG_FORMAT` (`json` ou `pretty`) n'est obligatoire qu'avec
    `console`, la source et le token Better Stack qu'avec `betterstack`.
  - En dev : `console` + `pretty`. En prod : `console` + `betterstack`, en `json`, pour envoyer aux deux à la fois.
  - Améliorer `pino.ts` en conséquence.
- **Simplifier `env.ts`** (à voir une fois `LOG_TARGETS` en place, et avec les valeurs passées en dur côté Docker).
- **Migrations** : à terme, se passer d'Umzug et passer à des migrations datées plutôt qu'à un numéro incrémenté à la
  main.

## Web

- **Messages d'erreur lisibles** : traduire les codes d'erreur en messages (comme `constants/errors.ts` dans Saffy) au
  lieu d'afficher le code brut.

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
