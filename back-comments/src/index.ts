import { createServer, IncomingMessage, ServerResponse } from "http";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
// import with .js, and not ts.
// for more info: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#type-in-package-json-and-new-extensions
import { createRoute, createComment, getComment, mainRoute } from "./routes.js";
import { GET_COMMENT, POST_COMMENT } from "./const.js";

// For environment-variables
dotenv.config();

const port = process.env.PORT || 3000;

// Connect to mongoDB

/* Replaced with my connection string and add your DBPASS to a .env file */
// const dbURI = `mongodb+srv://wsp:${process.env.DBPASS}@cluster0.fn26nur.mongodb.net/?retryWrites=true&w=majority`;
const dbURI = `mongodb+srv://Abro:${process.env.DBPASS}@abrocluster.rq4spkc.mongodb.net/?retryWrites=true&w=majority`;
/* ========== */

await mongoose.connect(dbURI);

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const route = createRoute(req.url, req.method);

  switch (route) {
    case POST_COMMENT:
      createComment(req, res);
      break;
    case route.match(`^${GET_COMMENT}`)?.input:
      getComment(req, res);
      break;
    default:
      mainRoute(req, res);
      break;
  }
});

server.listen(port);
console.log(`Server running! port ${port}`);
