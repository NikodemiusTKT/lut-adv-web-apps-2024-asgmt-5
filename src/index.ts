import { BadRequestError, UserNotFoundError } from "./errors";
import { ITodo, IUser, User } from "./models/User";
import { NextFunction, Request, Response, Router } from "express";
import mongoose, { Types } from "mongoose";

let router = Router();

type TUser = {
  name: string;
  todos: ITodo[];
};
function asyncHandler<P>(
  fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<void>
): (req: Request<P>, res: Response, next: NextFunction) => void {
  return function (req: Request<P>, res: Response, next: NextFunction): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get(
  "/todos/:name",
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const user = await User.findOne({ name: name });
    if (user) {
      res.json({
        status: "success",
        message: "Todos successfully fetched for user.",
        data: user.todos,
      });
    } else {
      throw new UserNotFoundError();
    }
  })
);
router.post(
  "/add",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, todo } = req.body;
    if (!name || !todo) {
      throw new BadRequestError("Name and todo are required.");
    }
    let user = await User.findOne({ name: name });
    if (user) {
      user.todos.push(todo);
    } else {
      user = new User({ name: name, todos: [todo] });
    }
    await user.save();
    res.json({
      status: "success",
      message: `Todo added successfully for user ${name}.`,
      data: user.todos,
    });
  })
);

router.delete(
  "/delete",
  asyncHandler(async (req: Request, res: Response) => {
    const { name }: { name: string } = req.body;
    if (!name) {
      throw new BadRequestError("Name is required.");
    }
    const decodedName = decodeURIComponent(name);
    const user = await User.findOneAndDelete({ name: decodedName });
    if (user) {
      res.status(200).json({
        message: "User deleted successfully.",
        status: "success",
        data: null,
      });
    } else {
      throw new UserNotFoundError();
    }
  })
);

router.put(
  "/update",
  asyncHandler(async (req: Request, res: Response) => {
    const name = req.body.name;
    const todo: ITodo = req.body.todo;
    if (!name || !todo) {
      throw new BadRequestError("Name and todo are required.");
    }
    const user = await User.findOne({ name: name });
    if (user) {
      const todoIndex = user.todos.findIndex((t) => t.todo === todo.todo);
      if (todoIndex) {
        user.todos.splice(todoIndex, 1);
        await user.save();
        res.status(200).json({
          message: "Todo deleted successfully.",
          status: "success",
          data: user.todos,
        });
      } else {
        throw new BadRequestError("Todo not found.");
      }
    } else {
      throw new UserNotFoundError();
    }
  })
);
export default router;
