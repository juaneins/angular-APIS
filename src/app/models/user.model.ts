export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
}

export interface CreateUserDTO extends Omit<User, 'id'> {}
