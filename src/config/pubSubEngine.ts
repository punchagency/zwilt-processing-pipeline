import {MongoosePubSub} from 'graphql-mongoose-subscriptions';
import {dbString} from './startup/database';


const mongoose = require('mongoose');
mongoose.connect(dbString || '', {useNewUrlParser: true, useUnifiedTopology: true});
export const pubSub = new MongoosePubSub();