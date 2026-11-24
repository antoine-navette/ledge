# TODO

Ce qu'il reste à faire sur le projet, par catégorie. Les conventions sont celles des plugins `api-conventions`,
`web-conventions` et `docker-conventions` (`antoine-navette/claude-plugins`, déclarés dans `.claude/settings.json`). Une
entrée terminée est retirée dans le commit qui la termine.

## Alignement sur les conventions

Dans cet ordre, une étape par branche ou par commit :

1. **Renommages, sans changement de comportement** :
   - API : séparer les use cases en `commands/` et `queries/` (`LoginCommand`, `GetUserTransactionsQuery`…).
2. **Le reste** :
   - Prolonger la session au plus une fois par jour (`EXTENSION_INTERVAL`, comme dans Saffy), au lieu d'une écriture en
     base à chaque requête authentifiée.
   - Décider si les deux modales de transaction restent des composants ou rejoignent `MonthPage`, comme
     `TransactionsOverview` et `TransactionListSection`.

## API

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

- **Indenter le front à 2 espaces** au lieu de 4 : la norme de l'écosystème React et la valeur par défaut de Prettier, et
  le JSX s'imbrique vite. Un réglage dans la config Prettier du web, puis un `prettier --write`, dans un commit à part
  qui ne contient que ça.

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

## Limites connues

De simples détails, notés pour ne pas les redécouvrir, sans action prévue.

- **`bcrypt` ignore tout ce qui dépasse 72 octets d'un mot de passe.** La troncature a lieu à la création du hash comme
  à la comparaison, donc la connexion fonctionne normalement : seuls les octets au-delà ne comptent pas. 72 octets, c'est
  72 caractères ASCII (moins avec des accents ou des emojis), largement assez pour un mot de passe sûr. Le vrai danger
  de cette troncature, concaténer quelque chose avant le mot de passe pour le hacher, ne nous concerne pas : seul le mot
  de passe est haché. À revoir si on passe un jour à argon2, comme Saffy, qui n'a pas cette limite.
