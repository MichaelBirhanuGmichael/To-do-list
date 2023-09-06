const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

mongoose.connect("mongodb+srv://Michael_Birhanu:Michael%400986@cluster0.jyi8byz.mongodb.net/todolistDB");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "put something"],
  },
});

const Items = mongoose.model("Item", ItemSchema);

const Item1 = new Items({
  name: "welcome to your To-do-list",
});

const Item2 = new Items({
  name: " Hit the + button to add a new Items ",
});

const Item3 = new Items({
  name: "Hit the checkbox to delete an Items ",
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = new mongoose.Schema({
  name: String,
  list: [ItemSchema],
});

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

const day = date.getDay();

app.get("/", function (req, res) {
  Items.find({})
    .exec()
    .then((itemsFound) => {
      if (itemsFound.length === 0) {
        Items.insertMany(defaultItems)
          .then(() => {
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
         
      } else {
        res.render("list", { ListTitle: day, newitems: itemsFound });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .exec()
    .then((listFound) => {
      if (!listFound) {
        const list = new List({
          name: customListName,
          list: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          ListTitle: listFound.name,
          newitems: listFound.list,
        });
      }
    });
});

app.post("/", function (req, res) {
  const newItem = req.body.addlist;
  const listName = req.body.list;
  const itemName = new Items({
    name: newItem,
  });

  if (listName === day) {
    itemName.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .exec()
      .then((foundItems) => {
        foundItems.list.push(itemName);
        foundItems.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Items.findByIdAndRemove(checkedItem)
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { list: { _id: checkedItem } } }
    )
      .exec()
      .then(() => {
        res.redirect("/" + listName);
      });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/work", function (req, res) {
  res.render("list", { ListTitle: "work list", newitems: workItems });
});

app.listen(process.env.PORT||3000, function () {
  console.log("server has started successfully");
});
