// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');

// Charger les fichiers proto pour les films et les séries TV
const movieProtoPath = 'movie.proto';
const tvShowProtoPath = 'tvShow.proto';

const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'graphql-gateway',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const sendKafkaMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    movie: (_, { id }) => {
      const client = new movieProto.MovieService('localhost:50051',
        grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getMovie({ movie_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.movie);
        });
      });
    },

    movies: () => {
      const client = new movieProto.MovieService('localhost:50051',
        grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchMovies({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.movies);
        });
      });
    },

    tvShow: (_, { id }) => {
      const client = new tvShowProto.TVShowService('localhost:50052',
        grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getTvshow({ tvShowId: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.tv_show);
        });
      });
    },

    tvShows: () => {
      const client = new tvShowProto.TVShowService('localhost:50052',
        grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchTvshows({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.tv_shows);
        });
      });
    },
  },

  Mutation: {
    createMovie: async (_, { title, description }) => {
      const client = new movieProto.MovieService('localhost:50051',
        grpc.credentials.createInsecure());

      return new Promise((resolve, reject) => {
        client.createMovie({ title, description }, async (err, response) => {
          if (err) reject(err);
          else {
            await sendKafkaMessage('movies_topic', response.movie);
            resolve(response.movie);
          }
        });
      });
    },

    createTVShow: async (_, { title, description }) => {
      const client = new tvShowProto.TVShowService('localhost:50052',
        grpc.credentials.createInsecure());

      return new Promise((resolve, reject) => {
        client.createTvshow({ title, description }, async (err, response) => {
          if (err) reject(err);
          else {
            await sendKafkaMessage('tvshows_topic', response.tv_show);
            resolve(response.tv_show);
          }
        });
      });
    }
  },
};

module.exports = resolvers;
