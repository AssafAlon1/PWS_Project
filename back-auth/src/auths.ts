import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const secretKey = process.env.JWT_SECRET;

export type TokenData = { username: string };

export enum HTTPError {
    ERROR_400 = "ERROR_400",
    ERROR_401 = "ERROR_401",
    ERROR_403 = "ERROR_403",
    ERROR_404 = "ERROR_404",
    ERROR_500 = "ERROR_500"
}

const isHTTPError = (value: string | number | TokenData) => {
    return Object.values(HTTPError).includes(value as HTTPError);
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
    res.status(401).send('No token provided');
    return null;
  }
};

export const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<TokenData | HTTPError> => {
    // Token existence handled here
    const token = getTokenFromCookie(req, res);
  
    if (isHTTPError(token)) {
      // res was already handled in getTokenFromAuthHeader
      return HTTPError["ERROR_401"];
    }
  
    const user = verifyJWT(token);
  
    // Invalid token
    if (!user) {
        res.status(401).send({ message: "Authentication failed" });
      return HTTPError["ERROR_401"];
    }
  
    // Check user role for permission
    // const requiredRole = getRequiredRole(req);
    // if (!(await hasPermission(user.id, requiredRole))) {
    //   res.status(403).send({ message: "You have insufficient permission to perform this operation." });
    //   return HTTPError["ERROR_403"];
    // }
    next();
};
