export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Create = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
};
