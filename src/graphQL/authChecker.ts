import {AppContext} from './types';
import {AuthChecker} from 'type-graphql';

// create auth checker function
export const authChecker: AuthChecker<AppContext> = ({context: {getUser}}) => {
  const user = getUser();
  if (user) {
    return true;
  } else {
    return false;
  }
};
