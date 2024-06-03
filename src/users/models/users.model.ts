import {getModelForClass} from '@typegoose/typegoose';
import User from './users.schema';

const UserModel = getModelForClass(User);

export default UserModel;
