import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { BUY_PATH, REFUND_PATH } from './const.js';
import { buyTickets, refundTickets } from './routes.js';

dotenv.config();

const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
    origin: origin,
    methods: ['POST'],
    credentials: true,  // Frontend needs to send cookies with requests
}));

app.post(BUY_PATH, buyTickets);
app.post(REFUND_PATH, refundTickets);


app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
