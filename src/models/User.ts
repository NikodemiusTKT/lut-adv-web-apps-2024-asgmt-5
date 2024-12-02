import mongoose, { Document, Schema, Types } from "mongoose";

interface ITodo {
  _id: Types.ObjectId;
  todo: string;
  checked?: boolean;
}

interface IUser extends Document {
  name: string;
  todos: ITodo[];
}

const TodoSchema = new Schema<ITodo>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  todo: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  todos: [TodoSchema],
});

const User = mongoose.model<IUser>("User", UserSchema);

export { User, IUser, ITodo };
