// src/auth/interfaces/user-identity.interface.ts
export interface UserIdentity {
    sub: string;
    email: string;
    name: string;
    preferred_username: string;
    given_name?: string;
    family_name?: string;
    [key: string]: any;
  }
  