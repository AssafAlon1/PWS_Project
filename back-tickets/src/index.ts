import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { ALL_TICKET_PATH, TICKET_PATH } from './const.js';
import { createTicket, getALLTicketsByEventId, getAvailableTicketsByEventId, purchaseTicket } from './routes.js';
import { get } from 'http';

dotenv.config();
const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3000;

if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}
/* ========== */

// TODO - consume messages?
// TODO - attach publisher channle?

mongoose.set('strictQuery', true);
await mongoose.connect(dbUri);
const app = express();

app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
  origin: origin,
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,  // Frontend needs to send cookies with requests
}));

// TODO - add routes
app.get(`${ALL_TICKET_PATH}/:eventId`, getALLTicketsByEventId);
app.get(`${TICKET_PATH}/:eventId`, getAvailableTicketsByEventId); // Currently not used - maybe for BO?

app.post(`${TICKET_PATH}/:eventId`, createTicket);

app.put(TICKET_PATH, purchaseTicket);


app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
  