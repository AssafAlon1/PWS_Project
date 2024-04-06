import jwt from "jsonwebtoken";
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { NextFunction, Request, Response } from "express";
import { BUY_PATH, REFUND_PATH } from './const.js';
import { buyTickets, refundTickets } from './routes.js';
import { PublisherChannel } from './publisher-channel.js';

dotenv.config();

const port = process.env.PORT || 3005;
const sharedKey = process.env.SHARED_SECRET;

const publisherChannel = new PublisherChannel();


const app = express();
app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
    origin: origin,
    methods: ['POST'],
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

function attachPublisherChannel(req: Request, res: Response, next: NextFunction) {
    req.publisherChannel = publisherChannel;
    next();
}

app.post(BUY_PATH, validateToken, attachPublisherChannel, buyTickets);
app.post(REFUND_PATH, attachPublisherChannel, refundTickets);


app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
