import dotenv from 'dotenv';

dotenv.config();


export const EVENT_API_URL = process.env.EVENT_API_URL;
export const TICKET_API_URL = process.env.TICKET_API_URL;


export const LOGIN_PATH = "/api/login";
export const LOGOUT_PATH = "/api/logout";
export const SIGNUP_PATH = "/api/signup";
export const USERNAME_PATH = "/api/username";
