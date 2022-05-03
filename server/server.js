const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth')

const app = express();
const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our data
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: authMiddleware
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../client/build')));
}


const startServer = async (typeDefs, resolvers) => {
	// start the Apollo Server
	await server.start();

	// integrate our Apollo server with the Express application as middleware
	// this will create a special '/graphql' endpoint for the 'Express.js' server
	server.applyMiddleware({ app });
	db.once('open', () => {
		app.listen(PORT, () => {
			console.log(`🌍 Now listening on localhost:${PORT}`)
			console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
		});
	});
}
startServer(typeDefs, resolvers);