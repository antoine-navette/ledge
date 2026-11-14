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
- **Migrations** : à terme, se passer d'Umzug et passer à des migrations datées plutôt qu'à un numéro incrémenté à la
  main.

## Web

- **Messages d'erreur lisibles** : traduire les codes d'erreur en messages (comme `constants/errors.ts` dans Saffy) au
  lieu d'afficher le code brut.

## Infra

- **`npm audit`** sur l'API et le web, et corriger ce qui peut l'être.
- **CI/CD** : tout revoir pour que ce soit cohérent, et mettre en place un vrai versionnage des images (plutôt que le
  SHA + `latest`).

## Déploiement

- **Mettre à jour `api/.env` sur le serveur (prod et staging) avant de merger**, sinon l'API ne démarre plus :
  - Supprimer `NODE_ENV`, `PINO_TARGET`, `BETTERSTACK_URL` et `BETTERSTACK_TOKEN`.
  - Ajouter `LOG_TARGETS="console,betterstack"`, `LOG_LEVEL="info"`, `CONSOLE_LOG_FORMAT="json"`,
    `BETTERSTACK_LOGS_URL` et `BETTERSTACK_LOGS_TOKEN` (les anciennes valeurs de `BETTERSTACK_URL` et
    `BETTERSTACK_TOKEN`).
- **Nettoyer les `.env` devenus inutiles sur le serveur** (prod et staging) : supprimer `web/.env`, et retirer `PORT` de
  `api/.env` (ignoré désormais).
- **Faire un backup de Mongo avant de merger** : les migrations 013 à 015 tournent au déploiement et ne se rejouent pas
  en arrière.

## Tests

- **Tests unitaires des entités et des use cases** (`Transaction.validate`, `User.register` / `verifyEmail`,
  `Session.extend`…). Seuls les adapters sont couverts pour l'instant. Pas bloquant pour le merge.

## Documentation

- **Supprimer `api/README.md`**, obsolète.
- **Écrire une vraie doc**, à l'occasion (voir `docs/` dans Saffy).
