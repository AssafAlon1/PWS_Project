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
  methods: ['GET', 'POST', 'PUT'], // TODO - PUT, DELETE?
  // credentials: true,  // TODO - remove? Frontend needs to send cookies with requests
}));


function keepSensitiveInfo(req: Request, res: Response, next: NextFunction) {
  req.keepSensitiveInfo = true;
  next();
}

app.get(EVENT_PATH, getUpcomingAvailableEvents); // Added for the frontend - only fetch events with available tickets
app.get(`${EVENT_PATH}/all`, getUpcomingEvents); // Gets ALL events (even those who have no tickets left)
app.get(`${EVENT_PATH}/:eventId`, getEventById);
app.get(`${EVENT_PATH}/backoffice/:eventId`, keepSensitiveInfo, getEventById); 
app.get("/api/closest_event", getClosestEvent); // !! NOTE: this is NOT exposed to the API Gateway (therefore it's OK that it shares the same path as the user-actions service)

app.post(EVENT_PATH, createEvent);

app.put(`${EVENT_PATH}/:eventId/postpone`, updateEvent);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});
