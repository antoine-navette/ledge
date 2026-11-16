# TODO

Ce qu'il reste à faire sur le projet, par catégorie. Saffy (`../saffy`), qui utilise quasiment les mêmes technos, sert
de référence pour les conventions. Une entrée terminée est retirée dans le commit qui la termine.

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

## Web

- **Messages d'erreur lisibles** : traduire les codes d'erreur en messages (comme `constants/errors.ts` dans Saffy) au
  lieu d'afficher le code brut.

## Infra

- **Relancer `npm audit fix`** (sans `--force`) sur l'API et le web quand les correctifs des outils de dev seront
  disponibles : `vitest` et `minimatch` (via `typescript-eslint`). Ne concerne pas l'image de prod (`--omit=dev`).
- **Passer `mongodb` en v7** : corrige CVE-2026-126837 (connexion `mongodb+srv://`) et CVE-2026-126835 (authentification
  OIDC), qui ne nous concernent pas aujourd'hui. Montée de version majeure du driver, à faire à part.
- **Sauvegardes de Mongo** :
  - Les copier hors du serveur, chiffrées (par exemple une étape `rclone` à la fin de `backup/backup.sh`) : elles ne
    protègent aujourd'hui que d'une erreur ou d'une migration ratée, pas d'une panne du serveur ni de son disque.
  - Être prévenu si celle de la nuit échoue (par exemple un heartbeat Better Stack).
- **CI/CD** :
  - **Politique de rétention sur GHCR** : chaque build y pousse trois images (API, web, backup), jamais supprimées.
    Chacune y apparaît en trois versions : l'index taggé `sha-…`, l'image `linux/arm64` et l'attestation de provenance
    (`unknown/unknown`). Désactiver les attestations (`provenance: false` dans `build.yaml`) diviserait par trois le
    nombre de versions et simplifierait le nettoyage ; à trancher, personne ne les lit aujourd'hui.
  - Plus tard : des tests d'intégration avec un Mongo jetable (`services: mongo`) dans `checks.yaml`, et des tests E2E
    après le build, contre les images lancées dans le runner, avant tout déploiement.
  - À terme : déployer depuis un runner GitHub par SSH à travers un tunnel (Cloudflare Access ou Tailscale, sans port
    ouvert), pour ne plus avoir de runner auto-hébergé sur le serveur, risqué pour un repo public.

## Tests

- **Tests unitaires des entités et des use cases** (`Transaction.validate`, `User.register` / `verifyEmail`,
  `Session.extend`…). Seuls les adapters sont couverts pour l'instant.

## Documentation

- **Écrire une vraie doc**, à l'occasion (voir `docs/` dans Saffy).
