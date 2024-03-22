
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {
    loginRoute,
    logoutRoute,
    signupRoute,
    usernameRoute,
} from './routes.js';

import {
    LOGIN_PATH,
    LOGOUT_PATH,
    SIGNUP_PATH,
    USERNAME_PATH,
} from './const.js';

dotenv.config();

/* Set the dbUri variable to your atlas connection string */
const dbUri = process.env.DB_CONNECTION_STRING;
if (!dbUri) {
    console.error('Missing MongoDB URI');
    process.exit(1);
}
/* ========== */
await mongoose.connect(dbUri);

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
});
