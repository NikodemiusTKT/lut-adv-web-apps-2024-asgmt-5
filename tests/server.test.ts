import { Todo, User } from "../models"; // Assuming you have defined Mongoose models for User and Todo
import { app, server } from "../app";

import mongoose from "mongoose";
import request from "supertest";

const mongoUri = "mongodb://localhost:27017/testdb";

beforeAll(async () => {
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await new Promise<void>((resolve) => {
    server.close(() => {
      console.log("Server closed.");
      resolve();
    });
  });
});

describe("POST /add", () => {
  beforeEach(async () => {
    await User.deleteMany({});
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

    const user = await User.findOne({ name: "Jukka" });
    expect(user.todos).toEqual(["Eat"]);
  });

  it("should add a new todo for an existing user", async () => {
    await new User({ name: "Jukka", todos: ["Eat"] }).save();

    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "Todo added successfully for user Jukka.",
      data: ["Eat", "Sleep"],
    });

    const user = await User.findOne({ name: "Jukka" });
    expect(user.todos).toEqual(["Eat", "Sleep"]);
  });

  it("should handle multiple users", async () => {
    await new User({ name: "Jukka", todos: ["Eat"] }).save();

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

    const users = await User.find({});
    expect(users).toEqual([
      { name: "Jukka", todos: ["Eat", "Sleep"] },
      { name: "Matti", todos: ["Work"] },
    ]);
  });
});

describe("GET /todos/:name", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should return the todos for an existing user", async () => {
    await new User({ name: "Jukka", todos: ["Eat", "Sleep"] }).save();

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

  it("should return 500 if there is an error reading the data", async () => {
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("Read error"));

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to read data.",
      status: "error",
    });
  });
});

describe("DELETE /delete", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should delete the user", async () => {
    await new User({ name: "Jukka", todos: ["Eat", "Sleep"] }).save();

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "User deleted successfully.",
      data: null,
    });

    const user = await User.findOne({ name: "Jukka" });
    expect(user).toBeNull();
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

  it("should return 500 if there is an error reading the data", async () => {
    jest
      .spyOn(User, "findOneAndDelete")
      .mockRejectedValueOnce(new Error("Read error"));

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      data: null,
      message: "Failed to read data.",
      status: "error",
    });
  });

  it("should return 500 if there is an error writing the data", async () => {
    await new User({ name: "Jukka", todos: ["Eat", "Sleep"] }).save();
    jest
      .spyOn(User, "findOneAndDelete")
      .mockRejectedValueOnce(new Error("Write error"));

    const response = await request(app)
      .delete("/delete")
      .send({ name: "Jukka" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Failed to write data.",
      data: null,
    });
  });
});

describe("PUT /update", () => {
  const mockUsers = [{ name: "John Doe", todos: ["Buy milk", "Walk the dog"] }];

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should delete a todo successfully", async () => {
    await new User({
      name: "John Doe",
      todos: ["Buy milk", "Walk the dog"],
    }).save();

    const response = await request(app)
      .put("/update")
      .send({ name: "John Doe", todo: "Buy milk" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Todo deleted successfully.",
      status: "success",
      data: ["Walk the dog"],
    });

    const user = await User.findOne({ name: "John Doe" });
    expect(user.todos).toEqual(["Walk the dog"]);
  });

  it("should return an error if the todo is not found", async () => {
    await new User({ name: "John Doe", todos: ["Walk the dog"] }).save();

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
    await new User({ name: "Jane Doe", todos: ["Buy milk"] }).save();

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
