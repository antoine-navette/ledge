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

## Fonctionnalités

- **Revoir l'authentification**, dans une même branche :
  - **Inscription par lien envoyé par email** : on saisit son email, le lien mène au choix du mot de passe, et le compte
    est créé avec un email forcément vérifié. Le formulaire répond toujours « vérifie ta boîte mail » (si le compte
    existe, l'email le dit à son propriétaire) : il ne révèle plus quels emails sont utilisés, et `EmailVerification`
    disparaît. À trancher : garder le mot de passe pour la connexion, ou se connecter par lien à chaque fois et le
    supprimer (les deux points suivants disparaissent alors).
  - **Modifier son mot de passe** depuis le profil, et **mot de passe oublié** par lien envoyé par email.
  - **Modifier son email**, confirmé par un lien envoyé à la nouvelle adresse.
  - **2FA** (TOTP, avec une application d'authentification).
  - À envisager : des value objects **`Email`** et **`Password`** (`Email.create(raw)`, comme `CalendarDate`), si la
    même règle finit par servir à plusieurs use cases (inscription, changement d'email ou de mot de passe,
    réinitialisation). `Password` ne serait jamais stocké, seulement validé. Les paramètres des use cases restent des
    `string`, puisque ce sont des données brutes.
- **Une page de graphiques** : la répartition des dépenses par catégorie sur un mois ou une année, l'évolution des
  dépenses mois après mois, le moment du mois où l'on dépense le plus… Avec la même case « Hide investments » que la
  page d'un mois.

## API

- **Reader CQRS pour l'authentification**, si besoin d'optimiser : charger la session et son user en une seule requête,
  au lieu de deux lectures dans `AuthenticateUseCase`.
- **Un script de seed** pour remplir la base de développement en une commande (`npm run seed`, à côté des scripts de
  migration) : un utilisateur de test et quelques mois de transactions variées (revenus, dépenses de chaque catégorie,
  plusieurs « Courses » le même mois). Passe par les entités, donc les données respectent les règles, et refuse de
  tourner hors développement. Avec une option pour vider ce qu'il a créé.
- **Rendre la catégorie obligatoire pour une dépense** : le `null` ne sert qu'aux dépenses saisies avant l'arrivée des
  catégories. Il faut d'abord classer ces anciennes dépenses en prod (à la main, ou une catégorie par défaut), puis une
  migration vérifie qu'il n'en reste plus. À faire à part, pour ne pas tout mélanger.

## Web

- **Indenter le front à 2 espaces** au lieu de 4 : la norme de l'écosystème React et la valeur par défaut de Prettier, et
  le JSX s'imbrique vite. Un réglage dans la config Prettier du web, puis un `prettier --write`, dans un commit à part
  qui ne contient que ça.
- **Surligner la transaction ajoutée ou modifiée** une seconde ou deux, avec un fond qui s'estompe : la liste est
  triée par montant, donc une petite dépense ajoutée atterrit souvent hors de l'écran. Complète le toast, qui confirme
  l'action sans montrer où est la transaction.
- **Langue, format régional et devise**, réglables dans le profil et stockés sur l'utilisateur (pour suivre d'un
  appareil à l'autre et servir aux emails), avec `navigator.language` par défaut à l'inscription :
  - **Langue** (EN/FR) : traduit tous les textes, avec une table typée par langue comme `ERROR_MESSAGES` (un texte
    manquant fait échouer le build), et les emails côté API. `react-i18next` seulement si les pluriels ou les langues
    se multiplient.
  - **Format régional** (`fr-FR`, `en-GB`…) : séparateur décimal, position du symbole, format des dates, tout passe par
    `Intl.NumberFormat` et `Intl.DateTimeFormat` plutôt que par des réglages séparés. Lié à la langue au départ. Le
    champ du montant accepte alors la virgule en plus du point (ignoré aujourd'hui).
  - **Devise** : une donnée et non de l'affichage, changer de devise ne convertit rien. Le nombre de décimales en
    dépend (le yen n'en a aucune), donc la règle des 2 décimales et le minimum de 0,01 aussi : l'occasion de stocker les
    montants en centimes entiers.

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
- **La staging envoie ses emails depuis le même domaine que la prod.** Une erreur en staging (des envois en boucle, des
  adresses de test qui rebondissent) entame la réputation du domaine de la prod. Pour les séparer, ajouter
  `staging.ledge.ovh` comme domaine dans Resend, avec ses propres enregistrements DNS, puis passer `EMAIL_FROM` à
  `no-reply@staging.ledge.ovh` dans le `.env` de la staging. Aucun changement de code.
