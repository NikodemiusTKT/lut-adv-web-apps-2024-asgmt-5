import mongoose, { Document, Schema, Types } from "mongoose";

interface ITodo {
  todo: string;
  checked?: boolean;
}

interface IUser extends Document {
  name: string;
  todos: ITodo[];
}

const TodoSchema = new Schema<ITodo>({
  todo: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  todos: [TodoSchema],
});

const User = mongoose.model<IUser>("User", UserSchema);

export { User, IUser, ITodo };
