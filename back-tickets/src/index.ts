import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { createTickets, getALLTicketsByEventId, lockTicket, purchaseTicket } from './routes.js';
import { ALL_TICKET_PATH, TICKET_PATH } from './const.js';
import { Request, Response, NextFunction } from 'express';
import { PublisherChannel } from './publisher-channel.js';
import { consumeMessages } from './consume-messages.js';

dotenv.config();
const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3000;

const publisherChannel = new PublisherChannel();


if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}

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

function keepSensitiveInfo(req: Request, res: Response, next: NextFunction) {
  req.keepSensitiveInfo = true;
  next();
}

// TODO - add routes
app.get(`${ALL_TICKET_PATH}/:eventId`, getALLTicketsByEventId);
app.get(`${ALL_TICKET_PATH}/backoffice/:eventId`, keepSensitiveInfo, getALLTicketsByEventId);

app.post(`${TICKET_PATH}s`, createTickets);

// Middleware to attach publisherChannel to the request
function attachPublisherChannel(req: Request, res: Response, next: NextFunction) {
  req.publisherChannel = publisherChannel;
  next();
}
app.put(TICKET_PATH, attachPublisherChannel, purchaseTicket);

app.put(`${TICKET_PATH}/:eventId`, lockTicket);


app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});
