//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yasir:test-123@cluster0.drcge.mongodb.net/todoListDB");

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const pen = new Item({
  name: "Pen"
})
const pencil = new Item({
  name: "Pencil"
})
const book = new Item({
  name: "Book"
})

const defaultItems = [pen, pencil, book];


app.get("/", function(req, res) {

  Item.find({}, function(err, results){
    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: results});
    }
  })



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){

    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, listFound){
      listFound.items.push(item);
      listFound.save();
      res.redirect("/" + listName);
    })
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Deleteed Successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, listFound){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })
  }

})

app.get("/:listRoutes",function(req, res){
  const listNames = _.capitalize(req.params.listRoutes);

  List.findOne({name: listNames}, function(err, listFound){
    if (!err) {
      if (!listFound) {
        console.log("Doesnt exist");
        const list = new List({
          name:listNames,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listNames);
      } else {
        console.log("exist");
        res.render("list", {listTitle: listFound.name, newListItems: listFound.items});
      }
    }
  });

})
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if(port == null || port = ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
