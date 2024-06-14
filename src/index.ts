import {
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
import {buildContext} from 'graphql-passport';
import http from 'http';
import 'reflect-metadata';
import {buildSchema} from 'type-graphql';
import {dbString} from './config/startup/database';
import Startdb from './config/startup/db';
import {authChecker} from './graphQL/authChecker';
import {resolvers} from './graphQL/graphQL.resolvers';
import Routes from './restAPIs/routes';
import {graphqlUploadExpress} from 'graphql-upload';
import { startBackgroundJobs } from './utilities/queue';
// import { pubSub } from './config/redis-config';
import { BackgroundTask } from './utilities/cron/backgroundTask';


async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  // Instantiate DB
  Startdb();


  const schema = await buildSchema({
    resolvers,
    authChecker,
    // pubSub,
  });


  const whitelist = [
    process.env.CLIENT_SIDE_URL,
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
      cookie: {
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

  // Create the apollo server
  const apolloServer = new ApolloServer({
    schema,
    context: ({req, res}: {req: any; res: any}) => buildContext({req, res}),
    plugins: [
      process.env.NODE_ENV !== 'local'
        ? ApolloServerPluginLandingPageProductionDefault({footer: false})
        : ApolloServerPluginLandingPageLocalDefault({footer: false}),
    ]
  });

  Routes(app);

  await apolloServer.start();
  app.use(graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10}));

  // apply middleware to server
  apolloServer.applyMiddleware({app, path: '/graphql', cors: corsOptions});
  startBackgroundJobs();


  // app.listen on express server
  app.use('*', (req, res) =>
    res.send(`route not found for ${req.originalUrl}`)
  );

  await new Promise<void>(resolve =>
    httpServer.listen({port: process.env.PORT}, resolve)
  );
  console.log(
    `💡Server started on http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
  );

  new BackgroundTask().start()
}

bootstrap();
