
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import { StatusCodes } from "http-status-codes";


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
  res.cookie('token', token, { httpOnly: true, sameSite:sameSite, secure, maxAge: 172800000 }); 
  res.send('Logged in');
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

export async function usernameRoute(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).send('Not logged in');
    return;
  }

  let username;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    username = (payload as JwtPayload).username;
  }
  catch (e) {
    res.status(StatusCodes.UNAUTHORIZED).send('Invalid token');
    return;
  }

  res.status(StatusCodes.OK).send({username});
}
