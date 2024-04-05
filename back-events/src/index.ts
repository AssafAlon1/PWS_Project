import jwt from "jsonwebtoken";
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

import {
  getEventById,
  createEvent,
  updateEvent,
  getUpcomingEvents,
  getUpcomingAvailableEvents,
  getClosestEvent,
} from "./routes.js";

import {
  EVENT_PATH
} from './const.js';
import { consumeMessages } from './consume-messages.js';

dotenv.config();
const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3000;
const sharedKey = process.env.SHARED_SECRET;

if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}
/* ========== */

consumeMessages();

mongoose.set('strictQuery', true);
await mongoose.connect(dbUri);
const app = express();

app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
  origin: origin,
  methods: ['GET', 'POST', 'PUT'],
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

function keepSensitiveInfo(req: Request, res: Response, next: NextFunction) {
  req.keepSensitiveInfo = true;
  next();
}

app.get(EVENT_PATH, validateToken, getUpcomingAvailableEvents); // Added for the frontend - only fetch events with available tickets
app.get(`${EVENT_PATH}/all`, validateToken, getUpcomingEvents); // Gets ALL events (even those who have no tickets left)
app.get(`${EVENT_PATH}/:eventId`, validateToken, getEventById);
app.get(`${EVENT_PATH}/backoffice/:eventId`, validateToken, keepSensitiveInfo, getEventById);
app.get("/api/closest_event", getClosestEvent); // !! NOTE: this is NOT exposed to the API Gateway (therefore it's OK that it shares the same path as the user-actions service)

app.post(EVENT_PATH, createEvent);

app.put(`${EVENT_PATH}/:eventId/postpone`, updateEvent);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});
