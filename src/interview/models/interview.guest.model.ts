import {getModelForClass} from '@typegoose/typegoose';
import Guest from './interview.guest.schema';

const GuestModel = getModelForClass(Guest);

export default GuestModel;
