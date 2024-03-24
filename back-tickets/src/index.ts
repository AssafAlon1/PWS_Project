import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { ALL_Ticket_PATH, Ticket_PATH } from './const.js';
import { insertTicket, queryAllTicketsByEventID, queryAvailableTicketsByEventID } from './db.js';

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
  methods: ['GET', 'POST'],
  credentials: true,  // Frontend needs to send cookies with requests
}));

// TODO - add routes
app.get(`${ALL_Ticket_PATH}/:eventID`, queryAllTicketsByEventID);
app.get(`${Ticket_PATH}/:eventID`, queryAvailableTicketsByEventID);

app.post(`${Ticket_PATH}/:eventID`, insertTicket);


app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
  