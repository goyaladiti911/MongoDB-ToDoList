const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aditi:youareincorrect@cluster0.sxkyg.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
	name: String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
	name: "Welcome to your todolist!"
});
const item2 = new Item({
	name: "Hit the + button to add a new item."
});
const item3 = new Item({
	name: "<-- Hit this to delete an item."
});

const defaultitems = [item1, item2, item3];
const listSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
	Item.find({}, function(err, foundItems){
		if(foundItems.length === 0){
			Item.insertMany(defaultitems, function(err){
	if(err){
		console.log(err);
	}else{
		console.log("successfully inserted!");
	}
	res.redirect("/");
});
		}else{
			res.render("list",{listtitle: "Today", newtodos: foundItems});
		}		
});
});
	
app.post("/",function(req,res){
	const addtodo = req.body.todo;
	const listName = req.body.list;

	const newItem = new Item({
		name: addtodo
	});

	if(listName === "Today"){
		newItem.save();
		res.redirect("/");
	}else{
		List.findOne({name: listName},function(err,foundList){
		foundList.items.push(newItem);
		foundList.save();
		res.redirect("/"+listName);
	});
	}		
});
app.post("/delete",function(req,res){
	const deleted = req.body.deletedItem;
	const listName=req.body.listName;
	if(listName === "Today"){
		Item.deleteOne({_id: deleted}, function(err){
		if(!err){
		
			console.log("successfully deleted!");
		res.redirect("/");
	}
	});
	}else{
		List.findOneAndUpdate({name: listName},{$pull:{items: {_id:deleted}}},function(err, foundList){
			if(!err){
				res.redirect("/"+listName);
			}
		});
	}
	
});


app.get("/:path",function(req,res){
	
	
	const newList = _.capitalize(req.params.path);
	List.findOne({name: newList}, function(err, foundList){
		if(!err){
			if(!foundList){
				const list = new List({
		name: newList,
		items: defaultitems
	});
				list.save();
				res.redirect("/"+newList);
			}else{
				res.render("list",{listtitle: foundList.name,newtodos:foundList.items});
			}
		}
	});
	
	
	
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
	console.log("Server has started successfully!");
});