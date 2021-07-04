//import express from 'express';
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import morganBody from "morgan-body";
import setupRoutes from "./routes";

async function startServer() {
  const app = express();

  const port = process.env.PORT || 5001;

  // Common middleware
  app.use(cors());
  app.use(compression({ level: 9 }));
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.text({ type: "plain/text" }));

  const morganOptions = process.env.MORGAN_OPTS;
  if (morganOptions) {
    morganBody(app, JSON.parse(morganOptions));
  } else {
    morganBody(app);
  }

  // Set Up the controllers and routes
  setupRoutes(app);
  app.listen(port, () => console.log(`Server is on port ${port}`));
}

export default startServer;
