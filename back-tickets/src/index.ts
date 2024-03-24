import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { ALL_Ticket_PATH, Ticket_PATH } from './const.js';
import { createTicket, getALLTicketsByEventId, getAvailableTicketsByEventId, getTicketByName, purchaseTicket } from './routes.js';
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
app.get(`${ALL_Ticket_PATH}/:eventId`, getALLTicketsByEventId);
app.get(`${Ticket_PATH}/:eventId`, getAvailableTicketsByEventId);
app.get(`${Ticket_PATH}/:eventId/:ticketName`, getTicketByName);

app.post(`${Ticket_PATH}/:eventId`, createTicket);

app.put(Ticket_PATH, purchaseTicket);


app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
  