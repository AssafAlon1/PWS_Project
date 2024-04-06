import jwt from "jsonwebtoken";
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { consumeMessages } from './consume-messages.js';
import { ACTIONS_PATH, CLOSEST_EVENT_PATH } from './const.js';
import { getClosestEvent, getUserActionByPurchaseId, getUserActions, refundTickets } from './routes.js';

dotenv.config();

const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3004;
const sharedKey = process.env.SHARED_SECRET;

if (!dbUri) {
    console.error('Missing MongoDB URI');
    process.exit(1);
}

mongoose.set('strictQuery', true);
await mongoose.connect(dbUri);

consumeMessages();

const app = express();
app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
    origin: origin,
    methods: ['GET', 'PUT'],
    // credentials: true,  // TODO - remove? Frontend needs to send cookies with requests
}));

const verifyJWT = (token: string): { username: string } | false => {
    try {
      const verifiedToken = jwt.verify(token, sharedKey) as { username: string };
      if (!verifiedToken.username) {
        throw new Error("Invalid token");
      }
      return verifiedToken;
    }
    catch (err) {
      console.error("Invalid token provided");
      return false;
    }
  };
  
  function validateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).send('Unauthorized');
      return;
    }
  
    const result = verifyJWT(token);
    if (!result) {
      res.status(401).send('Unauthorized');
      return;
    }
  
    req.headers['username'] = result.username;
  
    next();
  }

app.put(ACTIONS_PATH, validateToken, refundTickets);
app.get(ACTIONS_PATH, validateToken, getUserActions)
app.get(`${ACTIONS_PATH}/:purchase_id`, validateToken, getUserActionByPurchaseId)
app.get(CLOSEST_EVENT_PATH, validateToken, getClosestEvent);

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
