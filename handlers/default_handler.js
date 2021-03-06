const fs = require("fs");
let realTimePath = "./data/data.json";
let testPath = process.env.TESTPATH;
let path = testPath || realTimePath;
let data = fs.readFileSync(path, "utf8");
let ToDoApp = require("../lib/userHandler.js");
let todoApp = new ToDoApp();
todoApp.retrive(data);
let registered_users = [{
  userName: 'ashishm',
  name: 'ashish mahindrakar'
}];
todoApp.registered_users =registered_users;
class DefaultHandler {
  constructor () {
    this.app = todoApp;
  }
  execute(){}
  getRequestHandler(){
    return this.execute.bind(this);
  }
}

module.exports = DefaultHandler
