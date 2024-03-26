import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {
  getEventById,
  createEvent,
  createTicketlessEvent,
  updateEvent,
  getUpcomingEvents,
  getUpcomingAvailableEvents,
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
  methods: ['GET', 'POST'], // TODO - PUT, DELETE?
  credentials: true,  // Frontend needs to send cookies with requests
}));


app.get(EVENT_PATH, getUpcomingAvailableEvents); // Added for the frontend - only fetch events with available tickets
app.get(`${EVENT_PATH}/all`, getUpcomingEvents); // chenged path for BO use
app.get(`${EVENT_PATH}/:eventId`, getEventById);

app.post(EVENT_PATH, createEvent);
app.post(`${EVENT_PATH}/ticketless`, createTicketlessEvent); // TODO - legacy, may remove

// TODO - Update event? Delete event (I think this is not required?)

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});
