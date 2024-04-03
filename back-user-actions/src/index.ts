import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { consumeMessages } from './consume-messages.js';
import { ACTIONS_PATH, CLOSEST_EVENT_PATH } from './const.js';
import { getClosestEvent, getUserActionByPurchaseId, getUserActions, refundTickets } from './routes.js';

dotenv.config();

const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3004;

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
    methods: ['GET', 'POST', 'PUT'],
    // credentials: true,  // TODO - remove? Frontend needs to send cookies with requests
}));

app.put(ACTIONS_PATH, refundTickets);
app.get(ACTIONS_PATH, getUserActions)
app.get(`${ACTIONS_PATH}/:purchase_id`, getUserActionByPurchaseId)
app.get(CLOSEST_EVENT_PATH, getClosestEvent);

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
