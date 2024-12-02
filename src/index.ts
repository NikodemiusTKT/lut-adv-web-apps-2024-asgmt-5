import { BadRequestError, UserNotFoundError } from "./errors";
import { ITodo, IUser, User } from "./models/User";
import { NextFunction, Request, Response, Router } from "express";
import { dataFilePath, readDataFile, writeDataFile } from "./dataFileUtils";

let router = Router();

type TUser = {
  name: string;
  todos: string[];
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
    const user: IUser | null = await User.findOne({ name: name });
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
    const { name, todo }: { name: string; todo: string } = req.body;
    if (!name || !todo) {
      throw new BadRequestError("Name and todo are required.");
    }
    const users: TUser[] = await readDataFile(dataFilePath);
    let user: TUser | undefined = users.find((user) => user.name === name);
    if (user) {
      user.todos.push(todo);
    } else {
      user = { name: name, todos: [todo] };
      users.push(user);
    }
    await writeDataFile(dataFilePath, users);
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
    let users: TUser[] = await readDataFile(dataFilePath);
    const userIndex = users.findIndex((user) => user.name === decodedName);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      await writeDataFile(dataFilePath, users);
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
    const { name, todo }: { name: string; todo: string } = req.body;
    if (!name || !todo) {
      throw new BadRequestError("Name and todo are required.");
    }
    const decodedName = decodeURIComponent(name);
    const decodedTodo = decodeURIComponent(todo);
    const users: TUser[] = await readDataFile(dataFilePath);
    const user = users.find((user) => user.name === decodedName);
    if (user) {
      const todoIndex = user.todos.indexOf(decodedTodo);
      if (todoIndex !== -1) {
        user.todos.splice(todoIndex, 1);
        await writeDataFile(dataFilePath, users);
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
