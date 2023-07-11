import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import MasterRouter from "./routers/MasterRouter.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";

/**
 * Express server application class.
 * @description Will later contain the routing system.
 */
class Server {
  public app = express();
  public router = new MasterRouter().router;
}

// initialize server app
const server = new Server();

server.app.use(helmet());
server.app.use(cors());
server.app.use(express.json());
server.app.use("/api", server.router);

server.app.use(errorHandler);
server.app.use(notFoundHandler);

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.app.listen(port, () => console.log(`> Listening on port ${port}`));
})();
