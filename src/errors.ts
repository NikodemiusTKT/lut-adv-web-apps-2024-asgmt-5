import { NextFunction, Request, Response } from "express";

class UserNotFoundError extends Error {
  constructor(message: string = "User not found.") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
class WriteDataFileError extends Error {
  constructor(message: string = "Failed to write data file.") {
    super(message);
    this.name = "WriteDataFileError";
  }
}
function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(error);
  if (error instanceof UserNotFoundError) {
    res
      .status(404)
      .json({ status: "error", message: error.message, data: null });
  } else if (error instanceof BadRequestError) {
    res
      .status(400)
      .json({ status: "error", message: error.message, data: null });
  } else if (error instanceof WriteDataFileError) {
    res
      .status(500)
      .json({ status: "error", message: error.message, data: null });
  } else if (error instanceof Error) {
    res
      .status(500)
      .json({ status: "error", message: error.message, data: null });
  } else {
    res.status(500).json({
      status: "error",
      message: "Unknown error occurred.",
      data: null,
    });
  }
}

export { UserNotFoundError, BadRequestError, WriteDataFileError, errorHandler };
