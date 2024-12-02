import { app, startServer, stopServer } from "../app";

import mongoose from "mongoose";
import request from "supertest";

const mongoUri = "mongodb://localhost:27017/testdb";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    startServer();
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await stopServer();
});

const getCollection = (collectionName: string) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not established");
  }
  return db.collection(collectionName);
};

describe("GET /todos/:name", () => {
  beforeEach(async () => {
    await getCollection("users").deleteMany({});
  });

  it("should return the todos for an existing user", async () => {
    await getCollection("users").insertOne({
      name: "Jukka",
      todos: [
        { task: "Eat", checked: false },
        { task: "Sleep", checked: false },
      ],
    });

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      message: "Todos successfully fetched for user.",
      data: [
        { task: "Eat", checked: false },
        { task: "Sleep", checked: false },
      ],
    });
  });

  it("should return 404 if the user is not found", async () => {
    const response = await request(app).get("/todos/NonExistentUser");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      data: null,
      status: "error",
      message: "User not found.",
    });
  });
});

describe("POST /add", () => {
  beforeEach(async () => {
    await getCollection("users").deleteMany({});
  });

  it("should add a new todo for a new user", async () => {
    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: { todo: "Eat", checked: false } });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: [{ todo: "Eat", checked: false }],
    });

    const user = await getCollection("users").findOne({ name: "Jukka" });
    if (user) {
      expect(user.todos).toMatchObject([{ todo: "Eat", checked: false }]);
    } else {
      throw new Error("User not found");
    }
  });

  it("should add a new todo for an existing user", async () => {
    await getCollection("users").insertOne({
      name: "Jukka",
      todos: [{ todo: "Eat", checked: false }],
    });

    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: { todo: "Sleep", checked: false } });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: [
        { todo: "Eat", checked: false },
        { todo: "Sleep", checked: false },
      ],
    });

    const user = await getCollection("users").findOne({ name: "Jukka" });
    if (user) {
      expect(user.todos).toMatchObject([
        { todo: "Eat", checked: false },
        { todo: "Sleep", checked: false },
      ]);
    } else {
      throw new Error("User not found");
    }
  });
});

describe("DELETE /delete", () => {
  beforeEach(async () => {
    await getCollection("users").deleteMany({});
  });

  it("should delete the user", async () => {
    await getCollection("users").insertOne({
      name: "Jukka",
      todos: [
        { task: "Eat", checked: false },
        { task: "Sleep", checked: false },
      ],
    });

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "User deleted successfully.",
      data: null,
    });

    const user = await getCollection("users").findOne({ name: "Jukka" });
    expect(user).toBeNull();
  });

  it("should return 404 if the user is not found", async () => {
    const response = await request(app)
      .delete("/delete")
      .send({ name: "NonExistentUser" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      status: "error",
      message: "User not found.",
      data: null,
    });
  });
});

describe("PUT /update", () => {
  beforeEach(async () => {
    await getCollection("users").deleteMany({});
  });

  it("should delete a todo successfully", async () => {
    await getCollection("users").insertOne({
      name: "John Doe",
      todos: [
        { todo: "Buy milk", checked: false },
        { todo: "Walk the dog", checked: false },
      ],
    });

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: { todo: "Buy milk", checked: false } });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      message: "Todo deleted successfully.",
      data: [{ todo: "Walk the dog", checked: false }],
    });

    const user = await getCollection("users").findOne({ name: "John Doe" });
    if (user) {
      expect(user.todos).toMatchObject([
        { todo: "Walk the dog", checked: false },
      ]);
    } else {
      throw new Error("User not found");
    }
  });

  it("should return an error if the todo is not found", async () => {
    await getCollection("users").insertOne({
      name: "John Doe",
      todos: [{ task: "Walk the dog", checked: false }],
    });

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: { todo: "Buy milk", checked: false } });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: "error",
      message: "Todo not found.",
    });
  });

  it("should return an error if the user is not found", async () => {
    const response = await request(app)
      .put("/update")
      .send({
        name: "NonExistentUser",
        todo: { task: "Buy milk", checked: false },
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      status: "error",
      message: "User not found.",
    });
  });
});
