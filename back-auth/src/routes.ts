
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import { StatusCodes } from "http-status-codes";
import { UserRole } from './const.js';
import { queryUserRole, updateRole } from './db.js';
import Joi from 'joi';

const changePermissionSchema = Joi.object({
  username: Joi.string().required(),
  permission: Joi.string().valid("W", "M", "G").required()
});


export async function loginRoute(req: Request, res: Response) {
  const credentials = req.body;
  try {
    await User.validate(credentials);
  }
  catch (e) {
    res.status(StatusCodes.BAD_REQUEST).send('Invalid credentials');
    return;
  }

  let user;

  try {
    user = await User.findOne({ username: credentials.username });
  }
  catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal server error');
    return;
  }

  if (!user || !await bcrypt.compare(credentials.password, user.password)) {
    res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials');
    return;
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '2d' })

  const secure = process.env.NODE_ENV === 'production';
  const sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'strict';
  // We are Deployed - must use secure cookies with sameSite none
  res.cookie('token', token, { httpOnly: true, sameSite: sameSite, secure, maxAge: 172800000 });
  res.send('Logged in');
  console.log("User logged in: " + user.username);
}

export async function logoutRoute(req: Request, res: Response) {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'strict';
  // We are Deployed - must use secure cookies with sameSite none
  res.clearCookie('token', { httpOnly: true, sameSite: sameSite, secure });
  res.status(StatusCodes.OK).send('Logged out');
}

export async function signupRoute(req: Request, res: Response) {
  const user = new User(req.body);
  user.role = UserRole.Guest;
  try {
    const error = await user.validate();
  }
  catch (e) {
    res.status(StatusCodes.BAD_REQUEST).send('Invalid credentials');
    return;
  }
  if (await User.exists({ username: user.username })) {
    res.status(StatusCodes.BAD_REQUEST).send('Username already exists');
    return;
  }

  user.password = await bcrypt.hash(user.password, 10);

  try {
    await user.save();
  }
  catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error creating user');
    return;
  }

  res.status(StatusCodes.CREATED).send('User created');
}

export async function userInfoRoute(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).send('Not logged in');
    return;
  }

  let username;
  let role = UserRole.Guest;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    username = (payload as JwtPayload).username;
    role = await queryUserRole(username);
  }
  catch (e) {
    res.status(StatusCodes.UNAUTHORIZED).send('Invalid token');
    return;
  }

  res.status(StatusCodes.OK).send({ username, role });
}

export async function updatePrivilegesRoute(req: Request, res: Response) {
  // Token validation and permission checking for the user initiating this request is done in isAuthorized middleware

  const updatePermissionRequest = req.body as { username: string, permission: string };

  const { error } = changePermissionSchema.validate(updatePermissionRequest);
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).send('Bad request');
    return;
  }

  const currentRole = await queryUserRole(updatePermissionRequest.username);
  if (currentRole === UserRole.Admin) {
    res.status(StatusCodes.BAD_REQUEST).send('Cannot change admin permission');
    return;
  }

  if (currentRole === UserRole.Unauthenticated) {
    res.status(StatusCodes.NOT_FOUND).send('User not found');
    return;
  }

  try {
    const role = updatePermissionRequest.permission === "M" ? UserRole.Manager :
      updatePermissionRequest.permission === "W" ? UserRole.Worker : UserRole.Guest;
    const updateResult = updateRole(updatePermissionRequest.username, role);
    if (!updateResult) {
      throw new Error("Failed to update permission.")
    }

    res.status(StatusCodes.OK).send('Updated permission');
    return;
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal server error');
    return;
  }
}