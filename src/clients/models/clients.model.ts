import {getModelForClass} from '@typegoose/typegoose';
import Client from './clients.schema';

const ClientModel = getModelForClass(Client);

export default ClientModel;
