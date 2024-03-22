
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {
  getEventById,
  createEvent,
  deleteEvent,
  updateEvent,
  getUpcomingEvents
} from "./routes.js";

import {
  EVENT_PATH
} from './const.js';

dotenv.config();
const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3000;

if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}
/* ========== */
await mongoose.connect(dbUri);

const app = express();

app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
console.log("ORIGIN: " + origin);
app.use(cors({
  origin: origin,
  methods: ['GET', 'POST'],
  credentials: true,  // Frontend needs to send cookies with requests
}));


app.get(EVENT_PATH, getUpcomingEvents);
app.get(`${EVENT_PATH}/:eventId`, getEventById);

app.post(`${EVENT_PATH}`, createEvent);

// TODO - Update event? Delete event (I think this is not required?)

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
