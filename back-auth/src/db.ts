import { UserRole } from "./const.js";
import User from './models/user.js';

export const queryUserRole = async (username: string): Promise<number> => {
  try {
    const user = await User.findOne({ username: username });
    return user.role;
  } catch (error) {
    console.error("Error querying user role for " + username);
    return UserRole.Unauthenticated;
  }
}

export const hasPermission = async (username: string, requiredRole: UserRole): Promise<boolean> => {
  const userRole = await queryUserRole(username);
  console.log(" > User role: " + userRole);
  return userRole <= requiredRole;
}
