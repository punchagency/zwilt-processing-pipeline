import {ApolloServerErrorCode} from '@apollo/server/errors';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import {ApolloServer} from 'apollo-server-express';
import MdStore from 'connect-mongodb-session';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import session from 'express-session';
import {GraphQLError} from 'graphql';
import {buildContext} from 'graphql-passport';
import {Context} from 'graphql-ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import http from 'http';
import 'reflect-metadata';
import {buildSchema} from 'type-graphql';
import {Container} from 'typedi';
import {WebSocketServer} from 'ws';
import {dbString} from './config/startup/database';
import Startdb from './config/startup/db';
import {authChecker} from './graphQL/authChecker';
import {resolvers} from './graphQL/graphQL.resolvers';
import Routes from './restAPIs/routes';
import {graphqlUploadExpress} from 'graphql-upload';
import { startBackgroundJobs } from './utilities/queue';
import { pubSub } from './config/redis-config';
// import { BackgroundTask } from './utilities/cron/backgroundTask';



async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  // Instantiate DB
  Startdb();


  const schema = await buildSchema({
    resolvers,
    nullableByDefault: true,
    container: Container,
    validate: false,
    authChecker,
    pubSub,
  });


  const whitelist = [
    process.env.CLIENT_SIDE_URL,
    process.env.ADMIN_URL,
    process.env.GRAPH_STUDIO,
  ];
  const corsOptions = {
    origin(
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) {
      if (
        origin === undefined ||
        whitelist.indexOf(origin) !== -1 ||
        /^https:\/\/(.*\.)?zwilt.com$/.test(origin) ||
        (process.env.NODE_ENV !== 'production' &&
          /^https?:\/\/localhost:\d{4}$/.test(origin))
      ) {
        // console.log('origin allowed ===>', origin);
        callback(null, true);
      } else {
        console.log('origin not allowed ===>', origin);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  };

  // protecting our api from unauthorized origins
  app.use(cors(corsOptions));
  app.use(express.json());

  const MongodbStore = MdStore(session);
  // store each user session identifier on db
  const store = new MongodbStore({
    uri: dbString as string,
    collection: 'ZwiltUserSession',
  });

  // initializing session and httpOnly cookies
  if (process.env.NODE_ENV !== 'local') {
    app.set('trust proxy', 1);
  }

  app.use(
    session({
      name: 'zwilt',
      secret: dbString as string,
      resave: false,
      saveUninitialized: false,
      // proxy: false,
      // secure: process.env.NODE_ENV !== "production",
      cookie: {
        // maxAge: 10000, // One day
        maxAge: 1000 * 60 * 60 * 24, // One day
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        secure: process.env.NODE_ENV !== 'local' ? true : false,
      },
      store,
      unset: 'destroy',
    })
  );

  
  app.set('trust proxy', 1);

  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

  // This middleware should be added before calling `applyMiddleware`.
  // app.use(graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10}));

  const getDynamicContext = async (ctx: Context) => {
    if (ctx.connectionParams?.user) {
      return {currentUser: ctx.connectionParams.user};
    }
    // Otherwise let our resolvers know we don't have a current user
    return {currentUser: null};
  };

  // Create the apollo server
  const apolloServer = new ApolloServer({
    schema,
    context: ({req, res}: {req: any; res: any}) => buildContext({req, res}),
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({httpServer: httpServer}),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              wsServer.close();
            }
          };
        }
      },
      process.env.NODE_ENV !== 'local'
        ? ApolloServerPluginLandingPageProductionDefault({footer: false})
        : ApolloServerPluginLandingPageLocalDefault({footer: false}),
    ],
    formatError: (formattedError: GraphQLError) => {
      const isProd = process.env.NODE_ENV !== 'local';
      if (!isProd) {
        return formattedError;
      } else {
        switch (formattedError.extensions.code) {
          case ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED:
            return {
              message:
                "Your query doesn't match the schema. Try double-checking it!",
            };

          case ApolloServerErrorCode.INTERNAL_SERVER_ERROR:
            const predefinedErrorMessages = [
              'Invalid email or password',
              'User already exist',
              'Talent has a client, cannot update',
              'Could not upload assesment videos',
              'User not found for the talent profile',
              'Talent profile not found',
              'Access denied! You need to be authorized to perform this action!',
            ];

            const errorMessage = predefinedErrorMessages.find(
              message => message === formattedError.message
            );

            const internalServerError = {
              ...formattedError,
              message: errorMessage || 'Internal server error',
            };

            return {
              message: internalServerError.message,
            };

          default:
            return {
              message: 'Something went wrong!!!!!',
            };
        }
      }
    },
  });

  Routes(app);

  await apolloServer.start();
  app.use(graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10}));

  // apply middleware to server
  apolloServer.applyMiddleware({app, path: '/graphql', cors: corsOptions});
  startBackgroundJobs();

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: ctx => {
        return getDynamicContext(ctx);
      },
    },
    wsServer
  );

  // Save the returned server's info so we can shutdown this server later
  // const serverCleanup = useServer({schema}, wsServer);

  // app.listen on express server
  app.use('*', (req, res) =>
    res.send(`route not found for ${req.originalUrl}`)
  );

  await new Promise<void>(resolve =>
    httpServer.listen({port: process.env.PORT}, resolve)
  );
  console.log(
    `🚀 Server started on http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
  );
}

bootstrap();
