import { app, server } from "../app";
import express, { Request, Response } from "express";
import {
  initializeDataFile,
  readDataFile,
  writeDataFile,
} from "../src/dataFileUtils";

import fs from "fs";
import path from "path";
import request from "supertest";

const testDataPath = "test_data.json";

afterAll((done) => {
  server.close(() => {
    console.log("Server closed.");
    done();
  });
});

describe("POST /add", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testDataPath, JSON.stringify([]));
  });

  afterEach(() => {
    fs.unlinkSync(testDataPath);
  });

  it("should add a new todo for a new user", async () => {
    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Eat" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: ["Eat"],
    });

    const data = await readDataFile(testDataPath);
    // expect(data).toEqual([{ name: "Jukka", todos: ["Eat"] }]);
  });

  it("should add a new todo for an existing user", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat"] }];
    await writeDataFile(testDataPath, initialData);

    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: ["Eat", "Sleep"],
    });

    const data = await readDataFile(testDataPath);
    expect(data).toEqual([{ name: "Jukka", todos: ["Eat", "Sleep"] }]);
  });

  it("should handle multiple users", async () => {
    await writeDataFile(testDataPath, [{ name: "Jukka", todos: ["Eat"] }]);

    const response1 = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    expect(response1.status).toBe(200);
    expect(response1.body).toEqual({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: ["Eat", "Sleep"],
    });

    const response2 = await request(app)
      .post("/add")
      .send({ name: "Matti", todo: "Work" });

    expect(response2.status).toBe(200);
    expect(response2.body).toEqual({
      status: "success",
      message: "Todo added successfully for user Matti.",
      data: ["Work"],
    });

    const data = await readDataFile(testDataPath);
    expect(data).toEqual([
      { name: "Jukka", todos: ["Eat", "Sleep"] },
      { name: "Matti", todos: ["Work"] },
    ]);
  });
});

describe("initializeDataFile", () => {
  const testFilePath = path.resolve(__dirname, "../../test_data.json");

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it("should create a new data file if it does not exist", async () => {
    await initializeDataFile(testFilePath);

    const data = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));
    expect(data).toEqual([]);
  });

  it("should not overwrite an existing data file", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat"] }];
    fs.writeFileSync(testFilePath, JSON.stringify(initialData));

    await initializeDataFile(testFilePath);

    const data = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));
    expect(data).toEqual(initialData);
  });
});

describe("GET /todos/:name", () => {
  beforeEach(async () => {
    await initializeDataFile(testDataPath);
  });

  afterEach(() => {
    fs.unlinkSync(testDataPath);
  });

  it("should return the todos for an existing user", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat", "Sleep"] }];
    await writeDataFile(testDataPath, initialData);

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Todos successfully fetched for user.",
      status: "success",
      data: ["Eat", "Sleep"],
    });
  });

  it("should return 404 if the user is not found", async () => {
    const response = await request(app).get("/todos/NonExistentUser");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found.",
      status: "error",
    });
  });

  it("should return 500 if there is an error reading the data file", async () => {
    jest
      .spyOn(fs.promises, "readFile")
      .mockRejectedValueOnce(new Error("Read error"));

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to read data file.",
      status: "error",
    });
  });
});

describe("DELETE /delete", () => {
  beforeEach(async () => {
    await initializeDataFile(testDataPath);
  });

  afterEach(() => {
    fs.unlinkSync(testDataPath);
  });

  it("should delete the user", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat", "Sleep"] }];
    await writeDataFile(testDataPath, initialData);

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "User deleted successfully.",
      data: null,
    });

    const data = await readDataFile(testDataPath);
    expect(data).toEqual([]);
  });

  it("should return 404 if the user is not found", async () => {
    const response = await request(app)
      .delete("/delete")
      .send({ name: "NonExistentUser" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      data: null,
      status: "error",
    });
  });

  it("should return 500 if there is an error reading the data file", async () => {
    jest
      .spyOn(fs.promises, "readFile")
      .mockRejectedValueOnce(new Error("Read error"));

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      data: null,
      message: "Failed to read data file.",
      status: "error",
    });
  });

  it("should return 500 if there is an error writing the data file", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat", "Sleep"] }];
    await writeDataFile(testDataPath, initialData);
    jest
      .spyOn(fs.promises, "writeFile")
      .mockRejectedValueOnce(new Error("Write error"));

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Failed to write data file.",
      data: null,
    });
  });
});

describe("PUT /update", () => {
  const mockUsers = [{ name: "John Doe", todos: ["Buy milk", "Walk the dog"] }];

  beforeEach(async () => {
    await initializeDataFile(testDataPath);
  });

  afterEach(() => {
    fs.unlinkSync(testDataPath);
  });

  it("should delete a todo successfully", async () => {
    await writeDataFile(testDataPath, mockUsers);

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: "Buy milk" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Todo deleted successfully.",
      status: "success",
      data: ["Walk the dog"],
    });

    const data = await readDataFile(testDataPath);
    expect(data).toEqual([{ name: "John Doe", todos: ["Walk the dog"] }]);
  });

  it("should return an error if the todo is not found", async () => {
    await writeDataFile(testDataPath, [
      { name: "John Doe", todos: ["Walk the dog"] },
    ]);

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: "Buy milk" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Todo not found.",
      status: "error",
    });
  });

  it("should return an error if the user is not found", async () => {
    await writeDataFile(testDataPath, [
      { name: "Jane Doe", todos: ["Buy milk"] },
    ]);

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: "Buy milk" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found.",
      status: "error",
    });
  });
});
