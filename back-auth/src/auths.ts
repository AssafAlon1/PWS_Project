import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "./const.js";
import { hasPermission } from "./db.js";

const secretKey = process.env.JWT_SECRET;

export type TokenData = { username: string };

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

const getRequiredRole = (req: Request): UserRole => {
  const url = new URL(req.originalUrl, `http://${req.headers.host}`).pathname;
  // |================|
  // | Paths for Auth |
  // |================|
  if (url.match(/^\/api\/userinfo$/) && req.method === "GET") { // get user info
    return UserRole["Guest"];
  }

  // |==================|
  // | Paths for Events |
  // |==================|
  if (url.match(/^\/api\/event$/)) {
    if (req.method === "GET") { // get available events 
      return UserRole["Guest"];
    }
    if (req.method === "POST") { // create event 
      return UserRole["Manager"];
    }
  }

  if (url.match(/^\/api\/event\/all$/) && req.method == "GET") { // get all events 
    return UserRole["Worker"];
  }

  if (url.match(/^\/api\/event\/backoffice\/[^\/]+$/) && req.method == "GET") { // get event by id - back office 
    return UserRole["Worker"];
  }

  if (url.match(/^\/api\/event\/[^\/]+$/)) { 
    if(req.method === "GET") { // get event by id - regular user
      return UserRole["Guest"];
    }
    // TODO - needs implementation!
    if(req.method === "PUT") { // update event start time
      return UserRole["Manager"];
    }
  }

  // |===================|
  // | Paths for Tickets |
  // |===================|
  if (url.match(/^\/api\/ticket\/all\/[^\/]+$/) && req.method == "GET") { // get all tickets for event 
    return UserRole["Guest"];
  }
  if (url.match(/^\/api\/ticket\/all\/backoffice\/[^\/]+$/) && req.method == "GET") { // get all tickets for event - back office
    return UserRole["Worker"];
  }
  if (url.match(/^\/api\/ticket$/) && req.method === "PUT") { // purchase ticket
    return UserRole["Guest"];
  }

  // The events microservice handles it
  // if (url.match(/^\/api\/tickets$/) && req.method === "POST") { // create all tickets as part of creating an event
  //   return UserRole["manager"];
  // }
  
  // |====================|
  // | Paths for Comments |
  // |====================|
  if (url.match(/^\/api\/comment(\/[^\/]+)?$/) && ["GET", "POST"].includes(req.method)) { // get && post comments for event
    return UserRole["Guest"];
  }
  
  // |========================|
  // | Paths for User Actions |
  // |========================|

// app.get(`${ACTIONS_PATH}/:purchase_id`, getUserActionByPurchaseId)
// app.get(CLOSEST_EVENT_PATH, getClosestEvent);

  if (url.match(/^\/api\/user_actions$/) && ["GET", "PUT"].includes(req.method)) { // get && put user actions
    return UserRole["Guest"];
  }
  if (url.match(/^\/api\/user_actions\/[^\/]+$/) && req.method == "GET") { // get user action by purchase id
    return UserRole["Guest"];
  }
  // if (url.match(/^\/api\/refund_options$/) && req.method == "GET") { // get non refunded purchases
  //   return UserRole["Guest"];
  // } 
  if (url.match(/^\/api\/closest_event$/) && req.method == "GET") { // get closest event
    return UserRole["Guest"];
  }

  // TODO - add this route!
  if (url.match(/^\/api\/permission$/)) { // update user role
    return UserRole["Admin"];
  }
  
  // Shouldn't get here, require highest role.
  console.log(" > Haven't entered a SINGLE if statement...");
  return UserRole["Admin"];
}

export const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<TokenData | number> => {
  // Token existence handled here
  const token = getTokenFromCookie(req, res);

  if (!token) {
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
  const requiredRole = getRequiredRole(req);
  if (!(await hasPermission(user.username, requiredRole))) {
    res.status(403).send({ message: "You have insufficient permission to perform this operation." });
    return StatusCodes.FORBIDDEN;
  }
  console.log(" > User is authorized!");
  next();
};
