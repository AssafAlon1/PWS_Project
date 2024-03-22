import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

import { HTTPError, UserRole, TokenData } from "./types.js";

import { doesUserExist, queryUserByCredentials, queryUserRoleById, queryUserRoleByUsername, registerUser, updateUserPermission } from "./db.js";
import { userSchema } from "./models/CSUser.js";
import { isHTTPError } from "./utils.js";

dotenv.config();
const secretKey = process.env.SECRET_KEY || "NOT a secret key, pls don't hack";


// TODO - read more ^^
// Read more here: https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
// Read about the diffrence between jwt.verify and jwt.decode.
// Verify JWT token
const verifyJWT = (token: string): TokenData | false => {
  try {
    const verifiedToken = jwt.verify(token, secretKey);
    if (!verifiedToken.id) {
      return false;
    }
    return verifiedToken;

  } catch (err) {
    return false;
  }
};

const getRequiredRole = (req: IncomingMessage): UserRole => {
  switch (req.method) {
    case 'GET':
      // The current API allows all authenticated users to GET any information available.
      return UserRole["Worker"];

    case 'POST':
      // The only PROTECTED routes with POST methods can be done by managers and admins
      return UserRole["Manager"];

    case 'DELETE':
      // The current API allows ONLY ADMINS to DELETE information.
      return UserRole["Admin"];

    case 'PUT':
      // The current API allows ONLY ADMINS to update privileges.
      if (req.url.match(/^\/api\/permission$/)) {
        return UserRole["Admin"];
      }
      // The current API allows MANAGERS and ADMINS to update events.
      else if (req.url.match(/^\/api\/event\/\w+$/)) {
        return UserRole["Manager"];
      }
      // Shouldn't get here. For security reasons, we will return the highest role.
      return UserRole["Admin"];

    default:
      // Shouldn't get here. For security reasons, we will return the highest role.
      return UserRole["Admin"];
  }
}

const hasPermission = async (userId: string, requiredRole: UserRole): Promise<boolean> => {
  // As long as the user is authenticated, it has permissions of at least a worker
  // This check possibly saves a query to the DB.
  if (requiredRole === UserRole["Worker"]) {
    return true;
  }
  const userRole = await queryUserRoleById(userId);
  return userRole <= requiredRole;
}

// authorization header needs to look like that: Bearer <JWT>.
// So, we just take to <JWT>.
const getTokenFromAuthHeader = (req: IncomingMessage, res: ServerResponse): string => {
  let authHeader;
  try {
    // Check if the authorization header is present
    authHeader = req.headers["authorization"] as string;

    if (!authHeader) {
      throw Error("No authorization header.");
    }
    const authHeaderSplited = authHeader.split(" ");

    // Validate the format
    if (authHeaderSplited.length !== 2 || authHeaderSplited[0] !== "Bearer") {
      throw Error("Invalid autorization header.")
    }
    return authHeaderSplited[1];
  }
  catch (error) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Bad Request." }));
    return HTTPError["ERROR_401"];
  }
}

// Middelware for all protected routes. You need to expend it, implement premissions and handle with errors.
export const protectedRoute = async (req: IncomingMessage, res: ServerResponse): Promise<TokenData | HTTPError> => {
  // Token existance handeled here
  const token = getTokenFromAuthHeader(req, res);

  if (isHTTPError(token)) {
    // res was already handeled in getTokenFromAuthHeader
    return HTTPError["ERROR_401"];
  }

  const user = verifyJWT(token);

  // Invalid token
  if (!user) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Authentication failed" }));
    return HTTPError["ERROR_401"];
  }

  // Check user role for permission
  const requiredRole = getRequiredRole(req);
  if (!(await hasPermission(user.id, requiredRole))) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    // By Piazza @87 - body is OK (won't be checked)
    res.end(JSON.stringify({ message: "You have insufficient permission to perform this operation." }));
    return HTTPError["ERROR_403"];
  }

  return user;
};

export const loginRoute = (req: IncomingMessage, res: ServerResponse) => {
  // Read request body.
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Parse request body as JSON
      const credentials = JSON.parse(body);
      const { value, error } = userSchema.validate(credentials);

      if (error) {
        console.log("failed body validation.");
        console.log(error);
        throw Error("Bad Request.");
      }

      const user = await queryUserByCredentials(value.username, value.password);
      if (!user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Invalid username or password." }));
        return;
      }

      // Create JWT token.
      // This token contain the userId in the data section.
      const token = jwt.sign({ id: user._id }, secretKey, {
        expiresIn: 86400, // expires in 24 hours
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ token: token }));
    }
    catch (err) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request." }));
    }
  });
};

export const signupRoute = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {

      // Parse request body as JSON
      const credentials = JSON.parse(body);
      const { value, error } = userSchema.validate(credentials);

      if (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Bad Request." }));
        return;
      }

      if (await doesUserExist(value.username)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "User already exists." }));
        return;
      }

      const password = await bcrypt.hash(value.password, 10);
      let result = await registerUser(value.username, password);
      if (result == HTTPError["ERROR_400"]) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Bad Request." }));
        return;
      }

      if (result == HTTPError["ERROR_500"]) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Internal Server Error." }));
        return;
      }

      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ username: value.username }));
    }
    catch (err) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request.", }));
    }
  });
};

export const updatePrivilegesRoute = async (req: IncomingMessage, res: ServerResponse) => {
  const userAuth = await protectedRoute(req, res); // Protects for admins only ;)
  if (isHTTPError(userAuth)) {
    return;
  }
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    let updatePermissionRequest;

    try {
      updatePermissionRequest = JSON.parse(body) as { username: string, permission: string };
      if (!updatePermissionRequest.username || !updatePermissionRequest.permission || (updatePermissionRequest.permission !== "W" && updatePermissionRequest.permission !== "M")) {
        throw Error("Bad request body.");
      }

      // Cannot demote admin
      const currentPermission = await queryUserRoleByUsername(updatePermissionRequest.username);
      if (currentPermission === UserRole["Admin"]) {
        throw Error("Cannot change admin permission.");
      }
    }
    catch (error) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Bad Request." }));
      return;
    }

    if (!(await doesUserExist(updatePermissionRequest.username))) {
      // TODO - Should this be 400?
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "User does not exist." }));
      return;
    }

    try {
      let updateResult = updateUserPermission(updatePermissionRequest.username, updatePermissionRequest.permission);
      if (!updateResult) {
        throw new Error("Failed to update permission.")
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Updated permission" }));
      return;
    }
    catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal Server Error." }));
      return;
    }
  });
}
