export interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  googleId: string;
  email: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
