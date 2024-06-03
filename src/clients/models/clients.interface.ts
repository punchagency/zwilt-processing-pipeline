import User from "../../users/models/users.schema";

  export interface ClientData {
    user: User | null | undefined;
  }