export type UserCredentials = { username: string, password: string };

export enum HTTPError {
    ERROR_400 = "ERROR_400",
    ERROR_401 = "ERROR_401",
    ERROR_403 = "ERROR_403",
    ERROR_404 = "ERROR_404",
    ERROR_500 = "ERROR_500"
}

export enum Routes {
    GET_EVENT = "GET /api/event/",
    GET_EVENT_ORG = "GET /api/event/organizer/",
    POST_EVENT = "POST /api/event/",
    UPDATE_EVENT = "PUT /api/event/",
    DELETE_EVENT = "DELETE /api/event/",
    GET_HOME = "GET /",
    LOGIN = "POST /api/login",
    SIGNUP = "POST /api/signup",
    UPDATE_PRIVILEGES = " PUT /api/permission",
    NOT_FOUND = "NOT_FOUND"
}

export enum UserRole { Admin, Manager, Worker };
export type TokenData = { id: string };