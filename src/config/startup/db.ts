import 'dotenv/config';
import {dbString} from './database';
import mongoose, {ConnectOptions} from 'mongoose';

export default async function Startdb() {
  try {
    await mongoose.connect(dbString || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('Connected to zwilt-client db');
  } catch (error) {
    console.error(error);
  }
}
