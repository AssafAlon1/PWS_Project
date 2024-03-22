
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {
    loginRoute,
    logoutRoute,
    signupRoute,
    usernameRoute,
} from './routes.js';

import {
    EVENT_API_URL,
    LOGIN_PATH,
    LOGOUT_PATH,
    SIGNUP_PATH,
    USERNAME_PATH, // TODO - remove?
} from './const.js';

dotenv.config();

/* Set the dbUri variable to your atlas connection string */
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

/* Set CORS headers appropriately using the cors middleware */
let origin = process.env.ORIGIN;
app.use(cors({
    origin: origin,
    methods: ['GET', 'POST'],
    credentials: true,  // Frontend needs to send cookies with requests
}));
/* ========== */

app.post(LOGIN_PATH, loginRoute);
app.post(LOGOUT_PATH, logoutRoute);
app.post(SIGNUP_PATH, signupRoute);

app.get(USERNAME_PATH, usernameRoute);

// PROXIES
const eventProxy = createProxyMiddleware({
    target: EVENT_API_URL,
    changeOrigin: true, // TODO - What is this?
});
app.use('/api/event', eventProxy);

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
    console.log("ORIGIN: " + origin);
});
