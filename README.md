# The 5th Weekly Assignment For LUT Advanced Web Applications 2024 Course

This project implements a Todo application with MongoDB integration. It allows users to add, retrieve, update, and delete todos from a database. The app uses **Express**, **MongoDB**, **Mongoose**, and **TypeScript** for the backend, with a simple **Materialize CSS** frontend.

## Requirements

Before running the application, ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: [Download MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - If you prefer a GUI, you can use **MongoDB Compass**: [Download Compass](https://www.mongodb.com/products/compass)
- **Materialize CSS**: This will be included via CDN for styling.

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/todo-mongo-app.git
   cd todo-mongo-app
   ```

2. **Install Dependencies:**
   In the root of your project directory, run:
   ```bash
   npm install
   ```

3. **Start MongoDB:**
   Make sure you have MongoDB running on your local machine. If using the default settings, it should be accessible at `mongodb://127.0.0.1:27017/testdb`.

4. **Run the Application:**
   To start the server, run:
   ```bash
   npm start
   ```
   The app should now be accessible at `http://localhost:3000`.

## Project Structure

- `src/` - Contains the main source code for the backend.
  - `models/` - Contains Mongoose models for User and Todo.
  - `index.ts` - Main entry point for the application and server routes.
- `public/` - Contains the static frontend files.
  - `index.html` - The main HTML page for interacting with the app.
  - `style.css` - Custom styles, if any (Materialize is used via CDN).
- `package.json` - Lists dependencies and scripts.
- `tsconfig.json` - TypeScript configuration.

## Features

### 1. **Save Todos to Database**
   - Users and their todos are saved in MongoDB. A `User` schema contains a `name` field and an array of `todos`, each with a `todo` (string) and `checked` (boolean) fields.
   - Use the `/add` route to add a new todo for a user.

### 2. **Get Todos from Database**
   - A GET request to `/todos/:id` will retrieve the todos for a specific user from the database.
   - The frontend displays all the todos associated with the user.

### 3. **Delete Todos**
   - A PUT request to the `/update` route is used to delete a specific todo by its name.
   - Users can delete todos directly from the frontend by clicking on a delete button next to each todo.

### 4. **Update Todos (Mark as Completed)**
   - Each todo has a checkbox to mark it as completed. The `checked` value of the todo is updated in the database via a PUT request to `/updateTodo`.
   - This request updates the corresponding todo in the database.

### 5. **Styling**
   - Materialize CSS is used for styling the frontend. 
   - A NavBar has been added for a better user interface, and all buttons are styled using Materialize classes (`btn`).

## API Endpoints

- `POST /add`: Adds a new user and their todos to the database.
- `GET /todos/:id`: Retrieves all todos for a specific user.
- `PUT /updateTodo`: Updates the "checked" status of a todo (marks it as completed).
- `PUT /update`: Deletes a specific todo by its name.

## Frontend Structure

The frontend consists of the following:

- A **NavBar** using Materialize.
- Two main sections:
  1. **Add New Todo**: A form to add new todos.
  2. **Search and View Todos**: Displays the todos of a specific user.
- A list of todos, where each todo has a checkbox to mark it as completed and a delete link to remove it.

The application uses **Materialize CSS** for layout and styling, ensuring a responsive and modern design.

## Example Database Document

A sample document in the MongoDB database might look like this:

```json
{
  "_id": "605c72ef1532071b8c46ed10",
  "name": "John Doe",
  "todos": [
    {
      "todo": "Buy groceries",
      "checked": false
    },
    {
      "todo": "Finish homework",
      "checked": true
    }
  ]
}
```

## MongoDB Models

In the `src/models` directory, we define the Mongoose models for the User and Todo schemas:

- **ITodo Interface**: Defines the attributes of each todo (including `todo` and `checked`).
- **IUser Interface**: Extends Mongoose’s `Document` and defines `name` and an array of `todos`.

## Technologies Used

- **Node.js**: Server runtime environment.
- **Express**: Web framework for handling requests.
- **MongoDB**: Database for storing user data and todos.
- **Mongoose**: MongoDB object modeling tool.
- **TypeScript**: Adds static typing to the project.
- **Materialize CSS**: Frontend framework for styling.

## Conclusion

This project demonstrates how to build a full-stack application with MongoDB and TypeScript. It covers key concepts such as database integration, RESTful API development, and frontend design.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to modify and add more details based on any specific requirements or additional features you may have in your assignment.