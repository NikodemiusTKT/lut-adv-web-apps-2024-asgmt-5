import { dataFilePath, initializeDataFile } from "./src/dataFileUtils";
import express, { Express, Router } from "express";

import { errorHandler } from "./src/errors";
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

(async () => {
  try {
    await initializeDataFile(dataFilePath);
    console.log("Data file initialized successfully.");
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to initialize data file: ${error.message}`);
    } else {
      console.error("Failed to initialize data file: Unknown error");
    }
    process.exit(1);
  }
})();

export { app, server };
