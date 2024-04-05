
import express, { NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import {
  loginRoute,
  logoutRoute,
  signupRoute,
  updatePrivilegesRoute,
  userInfoRoute,
} from './routes.js';

import {
  CLOSEST_EVENT_PATH,
  COMMENT_API_URL,
  COMMENT_PATH,
  EVENT_API_URL,
  EVENT_PATH,
  LOGIN_PATH,
  LOGOUT_PATH,
  PERMISSION_PATH,
  SIGNUP_PATH,
  TICKET_API_URL,
  TICKET_PATH,
  USERINFO_PATH,
  USER_ACTION_API_URL,
  USER_ACTION_PATH,
} from './const.js';
import { isAuthorized } from './auths.js';

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
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,  // Frontend needs to send cookies with requests
}));
/* ========== */

// Events Microservice
const eventProxy = createProxyMiddleware({
  target: EVENT_API_URL,
  onProxyReq: fixRequestBody,
  changeOrigin: true,
});
app.use(EVENT_PATH, isAuthorized, eventProxy);

// Comments Microservice
const commentProxy = createProxyMiddleware({
  target: COMMENT_API_URL,
  onProxyReq: fixRequestBody,
  changeOrigin: true,
});
// Note on sanitizeInput - this was originally used to sanitize user input in request body to protect fron XSS attacks
// However, React sanitaizes all data by default so no need to sanitize again.
app.use(COMMENT_PATH, isAuthorized, /*sanitizeInput,*/ commentProxy);

// Tickets Microservice
const ticketProxy = createProxyMiddleware({
  target: TICKET_API_URL,
  onProxyReq: fixRequestBody,
  changeOrigin: true,
});
app.use(TICKET_PATH, isAuthorized, ticketProxy);

// User Actions Microservice
const userActionProxy = createProxyMiddleware({
  target: USER_ACTION_API_URL,
  onProxyReq: fixRequestBody,
  changeOrigin: true,
});
app.use(USER_ACTION_PATH, isAuthorized, userActionProxy);
app.use(CLOSEST_EVENT_PATH, isAuthorized, userActionProxy);

// user authentication routes
app.post(LOGIN_PATH, loginRoute);
app.post(LOGOUT_PATH, logoutRoute);
app.post(SIGNUP_PATH, signupRoute);
app.put(PERMISSION_PATH, isAuthorized, updatePrivilegesRoute);

// utility route
app.get(USERINFO_PATH, isAuthorized, userInfoRoute);


app.listen(port, () => {
  console.log(`Server running! port ${port}`);
  console.log("ORIGIN: " + origin);
});


/*
import express, { Request, Response, NextFunction } from 'express';


const app: express.Application = express();

app.use(express.json()); // Middleware to parse JSON bodies



// Apply sanitization middleware to all incoming requests
app.post('/data', sanitizeInput, (req: Request, res: Response): void => {
  // Validate request after sanitization
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Your logic after input has been sanitized
  res.status(200).json({ message: 'Data processed safely', data: req.body });
});

*/




/*
import * as express from 'express';
// const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to sanitize all fields against XSS
const sanitizeInput = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    // Escaping potentially dangerous characters
    body(key).escape().run(req);
  });
  next();
};

// Apply sanitization middleware to all incoming requests
app.post('/data', sanitizeInput, (req, res) => {
  // Validate request after sanitization
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Your logic after input has been sanitized
  res.status(200).json({ message: 'Data processed safely', data: req.body });
});

// Start your Express server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


*/