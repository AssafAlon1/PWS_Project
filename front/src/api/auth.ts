import axios from "axios";
import { APIStatus } from "../types";
import { API_GATEWAY_URL } from "../const";

interface Credentials {
    username: string;
    password: string;
}

const axiosInst = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL })

export const AuthApi = {
    login: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
            // Make a request to the server to login
            await axiosInst.post('/api/login', { username, password });
            console.log("Logged in as: ", username);
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
    getUserInfo: async (): Promise<{ username: string, role: number } | null> => {
        try {
            const response = await axiosInst.get('/api/userinfo');
            return response.data;
        } catch (e) {
            return null;
        }
    },
};

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