import axios from "axios";
import { APIStatus } from "../types";

interface Credentials {
    username: string;
    password: string;
}

const APIUrl = 'http://localhost:3000'; // TODO - Change this to the server URL
const axiosInst = axios.create({ withCredentials: true, baseURL: APIUrl })

export const AuthApi = {
    login: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
            // Make a request to the server to login
            await axiosInst.post('/api/login', { username, password });
            return APIStatus.Success;
        } catch (e) {
            return handleError(e);
        }
    },
    signUp: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
            // Make a request to the server to sign up
            await axiosInst.post('/api/signup', { username, password });
            return APIStatus.Success;
        } catch (e) {
            console.error(e);
            return handleError(e);
        }
    },
    logout: async (): Promise<APIStatus> => {
        try {
            // Make a request to the server to logout
            await axiosInst.post('/api/logout');
            return APIStatus.Success;
        } catch (e) {
            return handleError(e);
        }
    },
    getUserName: async (): Promise<string | APIStatus> => {
        try {
            // Make a request to the server to get the username
            const response = await axiosInst.get('/api/username');
            // return the username
            return response.data.username;
        } catch (e) {
            return handleError(e);
        }
    },
};

// TODO - Move to shared utils
const handleError = async (e: unknown): Promise<APIStatus> => {
    // Handle errors here, check status code and return the appropriate APIStatus
    if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 400) {
            return APIStatus.BadRequest;
        }
        if (e.response.status === 401) {
            return APIStatus.Unauthorized;
        }
    }
    return APIStatus.ServerError;
};