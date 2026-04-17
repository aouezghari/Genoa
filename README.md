# Genoa - Système de Gestion d'Arbre Généalogique Collaboratif

## 1. Introduction

Genoa est une application complète de généalogie permettant de créer, visualiser et gérer des arbres familiaux de manière collaborative. Contrairement aux outils classiques, Genoa permet à plusieurs utilisateurs de travailler sur le même arbre avec des permissions spécifiques, garantissant une synchronisation parfaite des données familiales entre les membres d'une même lignée.

## 2. Prallables & Installation

### Configuration Requise

* **Node.js** : Version strictement supérieure à 14 et strictement inférieure à 25 (Version 24 maximum recommandée).
* **MongoDB** : Une instance MongoDB (Locale ou Atlas).
* **Gestionnaire de paquets** : npm ou yarn.

### Mise en route rapide

1. Cloner le dépôt :

```bash
git clone [URL_DU_PROJET]
cd Genoa=
```

2. Lancer le Backend :

```bash
cd Backend
npm install
npm run start
```

3. Lancer le Frontend :

```bash
cd Frontend
npm install
npm run start
```

## 3. Configuration réseau & CORS (Important)

> **Remarque sur la sécurité (.env)** : Normalement, le fichier `.env` ne doit jamais être poussé sur un dépôt public. Cependant, pour faciliter votre évaluation et l'utilisation immédiate de l'application, nous avons choisi de le laisser exceptionnellement.

### Correction des adresses IP

Pour garantir la communication entre le mobile et le serveur et éviter les erreurs de protection CORS, vous devez impérativement mettre à jour l'adresse IP locale dans les 3 fichiers suivants :

1. `Frontend/services/auth-api.js`
2. `Frontend/services/tree-api.js`
3. `Backend/controllers/auth.controller.js` (pour les liens de réinitialisation).

### Comment trouver la bonne IP ?

1. Démarrez le frontend avec `npm run start`.
2. Le terminal Expo affichera une adresse du type : `exp://192.168.x.x:8081`.
3. Copiez cette adresse IP (ex: `192.168.x.x`) et remplacez les anciennes adresses dans les fichiers cités ci-dessus par celle-ci.

## 4. Explication du projet

### Backend

Le backend est construit avec Node.js, Express et MongoDB. Il repose sur une **Architecture en couches (Layered Architecture)** qui sépare strictement les responsabilités entre les middlewares (sécurité), les contrôleurs (orchestration), et les services (logique métier). Cette structure garantit une maintenance facilitée et une isolation totale des données entre les différents arbres familiaux. Les fonctionnalités principales incluent :

* **Authentification et Sécurité** : Système complet basé sur JWT (JSON Web Token). Le backend gère l'inscription, la connexion sécurisée, et la réinitialisation de mot de passe via l'envoi d'emails (Nodemailer). Chaque utilisateur est lié à un arbre spécifique dès son inscription, soit en créant le sien, soit en rejoignant un arbre existant si son email y est déjà référencé.
* **Gestion de l'Arbre Généalogique** : Opérations CRUD avancées pour les membres et leurs relations. Le backend gère la cohérence des liens bidirectionnels (conjoints, parents/enfants) et assure un nettoyage automatique des relations lors d'une suppression pour éviter les données orphelines.
* **Administration et Modération** : Un module robuste permet aux administrateurs de valider les nouveaux comptes utilisateurs, de modifier les rôles (passage de `reader` à `editor`).

Les fichiers clés incluent :

* `auth.controller.js` & `auth.service.js` : Gèrent toute la logique d'authentification, la création des tokens JWT et la gestion des profils.
* `tree.controller.js` & `tree.service.js` : Orchestrent la logique métier de l'arbre, les calculs de relations et les interactions avec MongoDB.
* `tree.middleware.js` : Middleware crucial qui identifie automatiquement l'arbre de l'utilisateur connecté et vérifie ses permissions avant toute modification.
* `User.js`, `Tree.js` & `Member.js` : Modèles Mongoose définissant la structure de données pour les utilisateurs, les espaces collaboratifs et les membres de la famille.

### Frontend (Mobile & Web)

L'interface est développée avec **React Native (Expo)**. Elle est divisée en deux pôles majeurs : un module d'authentification sécurisé et un moteur de rendu d'arbre dynamique utilisant **D3.js**. Nous avons privilégié une intégration directe de D3.js dans `treeUtils.js` pour permettre un contrôle total sur le layout, les courbes de Bézier et l'affichage des conjoints, ce que les bibliothèques standards ne permettaient pas.

**Le pôle Authentification** inclut :

* `auth-context.js` : Gère l'état global de la session utilisateur et la persistance du token.
* `login-screen.jsx` & `register-screen.jsx` : Écrans principaux de connexion et d'inscription utilisant des composants dédiés comme `PasswordStrengthMeter.js`.
* `auth-api.js` : Service centralisant les appels vers les routes d'authentification et d'administration du backend.

**Le pôle Arbre et Administration** inclut :

* `FamilyTreeScreen.jsx` : L'écran maître affichant l'arbre interactif avec support du zoom et du déplacement.
* `treeUtils.js` : Le moteur logique qui transforme la base de données plate en hiérarchie et génère les UUID pour éviter toute collision d'identifiants entre collaborateurs.
* **Modales d'action** : Un ensemble complet de modales (`AddMemberModal.jsx`, `EditMemberModal.jsx`, `FamilyTreeDeleteModal.jsx`) permet de manipuler l'arbre selon le rôle de l'utilisateur.
* `advanced-screen.jsx` (Admin) : Interface permettant aux administrateurs de valider les comptes et de gérer les utilisateurs de la plateforme.
* `stats-screen.jsx` : Composant de visualisation des statistiques de l'arbre (nombre de membres, générations, répartition par genre).

## 5. Contributions

Le développement de Genoa a été un effort collaboratif intense. Afin de garantir une cohérence parfaite entre la logique de l'arbre et la sécurité des données, chaque membre a participé aux réflexions globales, tout en se spécialisant sur des briques critiques du projet. Voici un aperçu de nos contributions :

### Authentification et Gestion des Profils

* **OUEZGHARI Assia** : Conception et architecture de l'API d'authentification, mise en œuvre du système de session sécurisé via JWT dans `auth.service.js`, et développement du contexte global de session dans `auth-context.js`. Elle a également conçu les formulaires complexes `register-form.jsx` et les écrans de réinitialisation de mot de passe.
* **AIT M'HAND Mohamed Yassine** : Implémentation des routes d'authentification dans `auth.controller.js`, développement des composants d'interface utilisateur pour l'accès aux comptes, incluant `login-form.jsx` et les composants de sécurité visuelle comme `PasswordInput.js`.

### Moteur de l'Arbre et Logique Métier

* **OUEZGHARI Assia** : Développement du moteur logique central dans `treeUtils.js` (calculs de hiérarchie D3, layout dynamique et génération d'UUID). Elle a conçu la logique métier complexe des relations familiales et de suppression en cascade dans `tree.service.js`, garantissant l'intégrité des données lors des modifications d'arbres.
* **AIT M'HAND Mohamed Yassine** : Intégration de la visualisation D3 dans `FamilyTreeScreen.jsx`, création des cartes de membres personnalisées en SVG dans `PersonCard.jsx`, et implémentation des modales d'interaction telles que `AddMemberModal.jsx` et `FamilyTreeActionModal.jsx`.

### Administration et Statistiques

* **OUEZGHARI Assia** : Conception de l'architecture d'administration et des routes protégées, mise en œuvre de la logique de validation des utilisateurs, et développement de l'écran d'administration avancée `advanced-screen.jsx`. Elle a également créé les fonctions d'agrégation MongoDB pour le moteur de statistiques.
* **AIT M'HAND Mohamed Yassine** : Développement des composants visuels pour les statistiques dans `stats-screen.jsx`, gestion de l'intégration des services API dans `tree-api.js`, et création de l'interface de gestion des profils dans `params.jsx`.

## 6. Conclusion

Genoa est une plateforme de généalogie moderne et robuste qui réussit le pari de combiner un backend structuré en couches avec une interface mobile fluide et hautement interactive. Grâce à l'utilisation de React Native et d'un moteur de rendu D3.js sur mesure, l'application offre une expérience utilisateur unique pour la gestion collaborative des mémoires familiales. Les choix architecturaux, tant sur la sécurité JWT que sur la gestion des relations par UUID, font de Genoa un outil fiable, évolutif et prêt à répondre aux besoins des familles connectées.