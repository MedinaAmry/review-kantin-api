import { db } from '../db';
import { users } from '../schema';

const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};

export const getAllUsers = async () => {
  return db.select(publicColumns).from(users);
};