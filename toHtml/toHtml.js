const fs = require("fs");
const itemTemp = fs.readFileSync("templates/todoItem.html","utf8");
const todoTitle = fs.readFileSync("templates/todoTitle.html","utf8");
exports.convertIntoListTag = function(text){
  return text;
}


exports.toInputTag = function(title,toDoItem){
  if(toDoItem.isDone()) {
    return `<input type="text" class="strikethrough"id=${toDoItem} ${title} disabled value="${toDoItem.text}">`;
  }
    return `<input type="text" id=${toDoItem} ${title} disabled value="${toDoItem.text}">`;
}

exports.item = (title,toDoItems)=>{
  return toDoItems.map((item)=>{
    let temp = exports.toInputTag(title,item);
    let htmlItem = itemTemp.replace(/item_Holder/,temp);
    htmlItem = htmlItem.replace(/listAndItem/g,`${title}__${item.text}`);
    return htmlItem;
  })
}

exports.getToDoList = (title)=>{
  let html = todoTitle.replace(/todoTitle/g,title);
    return html;
  }
