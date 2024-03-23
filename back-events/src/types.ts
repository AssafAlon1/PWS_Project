export enum HTTPError {
    ERROR_400 = "ERROR_400",
    ERROR_401 = "ERROR_401",
    ERROR_403 = "ERROR_403",
    ERROR_404 = "ERROR_404",
    ERROR_500 = "ERROR_500"
}

export enum Routes {
    GET_EVENT = "GET /api/event/",
    POST_EVENT = "POST /api/event/",
    UPDATE_EVENT = "PUT /api/event/",
    DELETE_EVENT = "DELETE /api/event/",
    NOT_FOUND = "NOT_FOUND"
}

export enum UserRole { Admin, Manager, Worker };
