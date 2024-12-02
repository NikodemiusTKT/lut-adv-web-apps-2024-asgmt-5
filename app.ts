import { dataFilePath, initializeDataFile } from "./src/dataFileUtils";
import express, { Express, Router } from "express";

import { errorHandler } from "./src/errors";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import router from "./src/index";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", router);
app.use(errorHandler);

let server: any;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to connect to MongoDB: ${error.message}`);
    } else {
      console.error("Failed to connect to MongoDB: Unknown error");
    }
    process.exit(1);
  }
})();

export { app, server };
