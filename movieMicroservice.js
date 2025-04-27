const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/moviesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log(' Connexion à MongoDB établie');
});

// Modèle Mongoose
const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
});
const Movie = mongoose.model('Movie', movieSchema);

// Charger le fichier movie.proto
const movieProtoPath = 'movie.proto';
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

// Implémentation du service Movie
const movieService = {
  // Récupérer un film par ID
  getMovie: async (call, callback) => {
    try {
      const movie = await Movie.findById(call.request.movieId);
      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Film non trouvé',
        });
      }
      callback(null, { movie });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Erreur serveur',
      });
    }
  },

  // Rechercher tous les films
  searchMovies: async (call, callback) => {
    try {
      const movies = await Movie.find({});
      callback(null, { movies });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Erreur serveur',
      });
    }
  },

  // Créer un nouveau film
  createMovie: async (call, callback) => {
    try {
      const { title, description } = call.request;
      const newMovie = new Movie({ title, description });
      const savedMovie = await newMovie.save();
      callback(null, { movie: savedMovie });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Erreur lors de la création du film',
      });
    }
  },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);

const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(' Erreur de démarrage du serveur gRPC:', err);
    return;
  }
  console.log(` Microservice Movie en cours d'exécution sur le port ${port}`);
  server.start();
});
