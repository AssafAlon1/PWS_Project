import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { createComment, getComment } from "./routes.js";
import { COMMENT_PATH } from "./const.js";
import { Request, Response, NextFunction } from 'express';
import { PublisherChannel } from './publisher-channel.js';

dotenv.config();
const dbUri = process.env.DB_CONNECTION_STRING;
const port = process.env.PORT || 3000;

const publisherChannel = new PublisherChannel();

if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}
mongoose.set('strictQuery', true);
await mongoose.connect(dbUri);

const app = express();

app.use(express.json());
app.use(cookieParser());

let origin = process.env.ORIGIN;
app.use(cors({
  origin: origin,
  methods: ['GET', 'POST'],
  // credentials: true,  // TODO - remove? Frontend needs to send cookies with requests
}));

app.get(`${COMMENT_PATH}/:eventId`, getComment);

// Middleware to attach publisherChannel to the request
function attachPublisherChannel(req: Request, res: Response, next: NextFunction) {
  req.publisherChannel = publisherChannel;
  next();
}
app.post(COMMENT_PATH, attachPublisherChannel, createComment);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});
