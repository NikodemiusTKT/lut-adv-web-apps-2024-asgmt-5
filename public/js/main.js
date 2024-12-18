document.addEventListener("DOMContentLoaded", () => init());

let currentUser = null;

const handleError = (error, displayFunction) => {
  const errorMessage = error instanceof Error ? error.message : error;
  displayFunction(errorMessage);
};

const init = () => {
  document
    .getElementById("todoForm")
    .addEventListener("submit", handleAddTodos);
  document
    .getElementById("searchForm")
    .addEventListener("submit", handleSearchTodos);
  document
    .getElementById("search")
    .addEventListener("click", handleSearchTodos);
};

const apiRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const { success, message, data } = result;
    if (response.ok) {
      return { success: true, data: data, message: message };
    } else {
      return { success: false, message: message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const handleAddTodos = async (event) => {
  event.preventDefault();
  const userInput = document.getElementById("userInput").value.trim();
  const todoInput = document.getElementById("todoInput").value;

  if (!userInput || !todoInput) {
    displayErrorMsg("User and Todo are required.");
    return;
  }

  const result = await addTodo(userInput, todoInput);
  if (result.success) {
    displaySuccessMessage(result.message);
    currentUser = userInput;
    renderTodos(result.data);
  } else {
    handleError(result.message, displayErrorMsg);
  }
  clearInputFields(["todoInput"]);
};

const handleSearchTodos = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();

  if (!searchInput) {
    displayErrorMsg("User is required.");
    return;
  }

  currentUser = searchInput;
  document.getElementById("userInput").value = currentUser;
  const result = await fetchAndDisplayTodos(currentUser);
  if (result.success) {
    displaySuccessMessage(result.message);
  } else {
    displayErrorMsg(result.message);
  }
  clearInputFields(["searchInput"]);
};

const handleDeleteUser = async () => {
  if (!currentUser) {
    displayErrorMsg("No user selected.");
    return;
  }
  const result = await deleteUser(currentUser);
  if (result.success) {
    displaySuccessMessage(result.message);
    document.getElementById("todoList").innerHTML = "";
    currentUser = null;
  } else {
    handleError(result.message, displayErrorMsg);
  }
};

const handleUpdateTodo = async (event, todo) => {
  const checked = event.target.checked;
  const result = await apiRequest("/updateTodo", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: currentUser,
      todo: todo.todo,
      checked: checked,
    }),
  });
  if (result.success) {
    displaySuccessMessage(result.message);
    renderTodos(result.data);
  } else {
    handleError(result.message, displayErrorMsg);
  }
};

const addTodo = (user, todo) =>
  apiRequest("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: user,
      todo: { todo: todo, checked: false },
    }),
  });

const fetchTodos = async (user) =>
  await apiRequest(`/todos/${user}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

const fetchAndDisplayTodos = async (user) => {
  const result = await fetchTodos(user);
  if (result.success) {
    renderTodos(result.data);
    currentUser = user;
  } else {
    handleError(result.message, displayErrorMsg);
    document.getElementById("todoList").innerHTML = "";
    hideCurrentUserSection();
  }
  return result;
};

const handleDeleteTodo = async (event, todo) => {
  event.preventDefault();
  const result = await apiRequest("/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: currentUser,
      todo: todo.todo,
    }),
  });

  if (result.success) {
    displaySuccessMessage(result.message);
    renderTodos(result.data);
  } else {
    handleError(result.message, displayErrorMsg);
  }
};

const renderTodoItem = (todo, index) => {
  const todoList = document.getElementById("todoList");
  const newTodoItem = document.createElement("li");
  const label = document.createElement("label");
  const checkBox = document.createElement("input");
  const span = document.createElement("span");
  const deleteLink = document.createElement("a");
  checkBox.type = "checkbox";
  checkBox.checked = todo.checked;
  checkBox.className = "checkBoxes";
  checkBox.id = "myCheckbox";
  deleteLink.addEventListener("click", (event) =>
    handleDeleteTodo(event, todo)
  );
  checkBox.addEventListener("change", (event) => handleUpdateTodo(event, todo));
  deleteLink.innerText = todo.todo;
  deleteLink.className = "delete-task";
  deleteLink.dataset.index = index;
  deleteLink.dataset.todo = todo.todo;
  span.appendChild(deleteLink);
  label.appendChild(checkBox);
  label.appendChild(span);
  newTodoItem.appendChild(label);
  todoList.appendChild(newTodoItem);
};

const renderTodos = (todos) => {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";
  todos.forEach((todo, index) => renderTodoItem(todo, index));
};

const displayMessage = (message, colorClass) => {
  const responseMessage = document.getElementById("responseMessage");
  responseMessage.className = `card-panel ${colorClass} center-align`;
  responseMessage.innerText = message;
  responseMessage.hidden = false;
};

const clearInputFields = (fieldIds) => {
  fieldIds.forEach((id) => (document.getElementById(id).value = ""));
};

const displayErrorMsg = (message) => displayMessage(message, "red lighten-4");
const displaySuccessMessage = (message) => {
  displayMessage(message, "teal lighten-4");
};
