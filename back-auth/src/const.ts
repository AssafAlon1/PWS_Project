import dotenv from 'dotenv';

dotenv.config();

export enum UserRole { Admin, Manager, Worker, Guest, Unauthenticated };

export const EVENT_API_URL = process.env.EVENT_API_URL;
export const COMMENT_API_URL = process.env.COMMENT_API_URL;
export const TICKET_API_URL = process.env.TICKET_API_URL;
export const USER_ACTION_API_URL = process.env.USER_ACTION_API_URL;


export const LOGIN_PATH = "/api/login";
export const LOGOUT_PATH = "/api/logout";
export const SIGNUP_PATH = "/api/signup";
export const USERNAME_PATH = "/api/username";
export const USERINFO_PATH = "/api/userinfo";
export const USER_ACTION_PATH = '/api/user_actions';
export const CLOSEST_EVENT_PATH = '/api/closest_event';
