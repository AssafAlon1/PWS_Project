import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const secretKey = process.env.JWT_SECRET;

export type TokenData = { username: string };


const isHTTPError = (value: string | number | TokenData) => {
  return [400, 401, 403, 404, 500].includes(value as number);
}

const verifyJWT = (token: string): TokenData | false => {
  try {
    const verifiedToken = jwt.verify(token, secretKey) as TokenData;
    if (!verifiedToken.username) {
      return false;
    }
    return verifiedToken;
  }
  catch (err) {
    return false;
  }
};

// Function to get the JWT token from the cookie
const getTokenFromCookie = (req: Request, res: Response) => {
  try {
    const token = req.cookies['token'];

    // If the token is not found, you can decide to send an error response or handle it accordingly
    if (!token) {
      throw new Error("No token provided")
    }
    return token;
  }
  catch {
    res.status(StatusCodes.UNAUTHORIZED).send('No token provided');
    return null;
  }
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction): TokenData | number => {
  // Token existence handled here
  const token = getTokenFromCookie(req, res);

  if (isHTTPError(token)) {
    // res was already handled in getTokenFromAuthHeader
    return StatusCodes.UNAUTHORIZED;
  }

  const user = verifyJWT(token);

  // Invalid token
  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).send({ message: "Authentication failed" });
    return StatusCodes.UNAUTHORIZED;
  }

  // Check user role for permission
  // const requiredRole = getRequiredRole(req);
  // if (!(await hasPermission(user.id, requiredRole))) {
  //   res.status(403).send({ message: "You have insufficient permission to perform this operation." });
  //   return HTTPError["ERROR_403"];
  // }
  console.log(" > User is authorized!");
  next();
};
