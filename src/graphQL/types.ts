import {Request as ExpressRequest} from 'express';
import {PassportContext} from 'graphql-passport';
import User from '../users/models/users.schema';

export type AppContext = PassportContext<User, ExpressRequest>;
