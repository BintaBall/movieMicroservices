# MovieMicroservice

Un projet de microservices Node.js utilisant **gRPC**, **Kafka** et **GraphQL** pour la gestion des films et séries TV.

## Contenu du projet

- **MovieMicroservice** : Service gRPC pour la gestion des films (`movieMicroservice.js`).
- **TVShowMicroservice** : Service gRPC pour la gestion des séries TV (`tvShowMicroservice.js`).
- **API Gateway** : Interface GraphQL pour interagir avec les deux microservices (`apiGateway.js`).
- **Kafka** : (en cours d'intégration) Utilisé pour la communication événementielle.
- **Protobufs** : Définition des messages et services (`movie.proto` et `tvShow.proto`).
- **Resolvers** : Résolveurs GraphQL (`resolvers.js`).

---

## Architecture

```
[ Client GraphQL ]
       ↓
[ API Gateway (Apollo Server) ]
       ↓
[ Microservices gRPC ]
    ↙          ↘
MovieService  TVShowService
```

Chaque création de film ou de série est également envoyée à Kafka.

---

## Installation

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/BintaBall/movieMicroservices
   cd MovieMicroservice
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Installer Kafka (optionnel pour démarrer Kafka localement)** :
   Exemple rapide avec Docker :
   ```bash
   docker run -d --name kafka -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 wurstmeister/kafka
   ```

---

## Lancer les services

**1. Démarrer Movie Microservice**  
```bash
node movieMicroservice.js
```

**2. Démarrer TV Show Microservice**  
```bash
node tvShowMicroservice.js
```

**3. Démarrer l'API Gateway**  
```bash
node apiGateway.js
```

---

## API GraphQL - Endpoints

Accédez à **http://localhost:4000/graphql** pour utiliser les requêtes suivantes :

### Queries

- **Obtenir un film par ID** :
  ```graphql
  query {
    movie(id: "1") {
      id
      title
      description
    }
  }
  ```

- **Lister tous les films** :
  ```graphql
  query {
    movies {
      id
      title
      description
    }
  }
  ```

- **Obtenir une série TV par ID** :
  ```graphql
  query {
    tvShow(id: "1") {
      id
      title
      description
    }
  }
  ```

- **Lister toutes les séries TV** :
  ```graphql
  query {
    tvShows {
      id
      title
      description
    }
  }
  ```

### Mutations

- **Créer un nouveau film** :
  ```graphql
  mutation {
    createMovie(title: "Inception", description: "Film de science-fiction.") {
      id
      title
      description
    }
  }
  ```

- **Créer une nouvelle série TV** :
  ```graphql
  mutation {
    createTVShow(title: "Breaking Bad", description: "Série dramatique sur un professeur de chimie.") {
      id
      title
      description
    }
  }
  ```

---

## Structure du projet

```
MovieMicroservice/
├── apiGateway.js
├── movieMicroservice.js
├── tvShowMicroservice.js
├── resolvers.js
├── movie.proto
├── tvShow.proto
└── README.md
```

---

## Pré-requis techniques

- Node.js (v18 ou plus)
- Kafka
- Protobufs : `@grpc/proto-loader`, `@grpc/grpc-js`

---

## Remarques

- Les mutations `createMovie` et `createTVShow` sont en cours d'intégration avec Kafka.
- La sécurisation (TLS, Auth) n'est pas encore implémentée.
- Les futures versions incluront une base de données MongoDB/PostgreSQL.

---

## Auteur

Projet réalisé pour l'apprentissage des microservices modernes avec **Node.js**, **gRPC**, **GraphQL**, et **Kafka**.

