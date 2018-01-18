const fs = require('fs');
const loginPage = fs.readFileSync("public/login.html", "utf8");
let todoItemTemps = fs.readFileSync("templates/todoItems", "utf8");
const toHtml = require("../toHtml/toHtml.js");
const DefaultHandler = require("./default_handler.js");

let registered_users = [{
  userName: 'ashishm',
  name: 'ashish mahindrakar'
}];

class ToDoActionHandler extends DefaultHandler {
  constructor() {
    super();
    this.acceptedUrls = [
      "/markAsDone",
      "/markAsNotDone",
      "/editToDoList",
      "/deleteToDoList",
      "/addAToDoList",
      "/showToDoItems",
      "/addToDoItem",
      "/loadAllToDoList",
      "/deleteItem",
      "/editItem"
    ]
  }
  isValid(req){
    return req.method=="POST"&& req.user;
  }
  valid(req) {
    return this.acceptedUrls.includes(req.url) && this.isValid(req);
  }
  updateDB() {
    let dataBase = JSON.stringify(this.app,null,2);
    let realTimePath = "./data/data.json";
    let testPath = process.env.TESTPATH;
    let path = testPath || realTimePath;
    fs.writeFileSync(path, dataBase);
  }
  execute(req, res) {
    if (!this.valid(req)) return
    let action = actions[req.url];
    action.call(this, req, res);
    this.updateDB();
  }
}

let actions = {
  "/showToDoItems": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let titleOfToDoList = req.body.title;
    let allToDoItems = user.getToDoItemsOf(titleOfToDoList);
    allToDoItems = toHtml.item(titleOfToDoList, allToDoItems);
    allToDoItems = allToDoItems.map(toHtml.convertIntoListTag).join("<br>");
    allToDoItems = todoItemTemps.replace("todoItemsHolder", allToDoItems);
    res.setHeader("Content-Type", "text/html");
    res.write(allToDoItems);
    res.end();
  },
  "/addToDoItem": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let todoItem = req.body.text;
    let todoList = req.body.todoList;
    user.addTodoItem(todoItem, todoList);
    res.write(todoItem);
    res.end();
  },
  "/addAToDoList": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    let description = req.body.description;
    user.addTodo(title, description);
    res.redirect("/home");
  },
  "/deleteToDoList": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    user.removeTodo(title);
    res.end();
  },
  "/loadAllToDoList": function (req, res) {
    if (req.user) {
      let todoApp = this.app;
      let userName = req.user.userName;
      let user = todoApp.users[userName];
      let titles = user.getTodoTitles();
      let html = ""
      titles.forEach(title => html += toHtml.getToDoList(title));
      res.setHeader("Content-Type", "text/html");
      res.statusCode = 200;
      res.write(html);
      res.end();
    }
  },
  "/editToDoList": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let oldTitle = req.body.previousTitle;
    let newTitle = req.body.newTitle;
    let description = req.body.description;
    user.editTitleOf(oldTitle, newTitle, description);
    let html = toHtml.getToDoList(newTitle);
    res.setHeader("Content-Type", "text/html");
    res.write(html);
    res.end();
  },
  "/markAsDone": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    let item = req.body.item;
    user.markAsDone(title, item);
    res.end();
  },
  "/markAsNotDone": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    let item = req.body.item;
    user.markAsNotDone(title, item);
    res.end();
  },
  "/editItem": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    let oldItemText = req.body.oldText;
    let newText = req.body.newText;
    user.editTodoItemText(oldItemText, newText, title);
    res.end();
  },
  "/deleteItem": function (req, res) {
    let userName = req.user.userName;
    let user = this.app.getUser(userName);
    let title = req.body.title;
    let item = req.body.item;
    user.removeTodoItem(item, title);
    res.end();
  }
}
module.exports = ToDoActionHandler;