import fs from "fs";
import path from "path";

const dataFilePath = path.resolve(__dirname, "../../data.json");

async function initializeDataFile(filepath: string): Promise<void> {
  try {
    await checkFileAccess(filepath);
    console.log(`File ${filepath} is accessible.`);
  } catch (error: unknown) {
    await handleFileAccessError(error, filepath);
  }
}

/* Check if the file exists and is accessible */
async function checkFileAccess(filepath: string): Promise<void> {
  await fs.promises.access(
    filepath,
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
  );
}

/* If the file does not exist, create a new file */
async function handleFileAccessError(
  error: unknown,
  filepath: string
): Promise<void> {
  const err = error as NodeJS.ErrnoException;
  if (err.code === "ENOENT") {
    console.log(`File ${filepath} does not exist. Creating new file.`);
    await createDataFile(filepath);
  } else if (err.code === "EACCES") {
    console.error(`Permission denied accessing file ${filepath}.`);
    throw new Error("Permission denied accessing data file.");
  } else {
    throw error;
  }
}

async function createDataFile(filepath: string): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify([]));
    console.log(`File ${filepath} created with initial data: []`);
  } catch (error: unknown) {
    throw new Error("Failed to create data file.");
  }
}

async function readDataFile<T>(filepath: string): Promise<T[]> {
  try {
    const data = await fs.promises.readFile(filepath, "utf-8");
    return JSON.parse(data);
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      console.error(`File not found: ${filepath}`);
      throw new Error(`File not found: ${filepath}`);
    } else {
      console.error(`Failed to read data file in ${filepath}: ${err.message}`);
      throw new Error(
        `Failed to read data file in ${filepath}: ${err.message}`
      );
    }
  }
}

async function writeDataFile<T>(filepath: string, data: T[]): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), {
      encoding: "utf-8",
    });
    console.log(`File ${filepath} has been updated successfully.`);
  } catch (error: unknown) {
    throw new Error("Failed to write data file.");
  }
}

export { initializeDataFile, readDataFile, writeDataFile, dataFilePath };
