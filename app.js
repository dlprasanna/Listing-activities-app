const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date=require(__dirname+"/date.js");

const app=express();
                    //initial list of items

app.set("view engine",'ejs');
                    //this line should be below const app line to Set EJS as templating engine .ejs is template engine in node.js.It can inject data into HTML template at the client side and produce the final HTML
                    //app.set(name, value):Assigns setting name to value
app.use(bodyParser.urlencoded({extended:true}));//to usebodyparser
app.use(express.static("public"));
                    // app.use() to specify middleware(here bodyparser) as the callback function 
//before mongoose:let items= ["Buy Food", "Clean", "Wash dishes"]; 
// we can actual declare an array as const and still push elements into it
//before mongoose:let workItems = []; 
1

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true } );

const itemsSchema={
    name:String
};

const Item = mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Welcome to your todolist"
});
const item2=new Item({
    name:"hit + to add new item"
});
const item3=new Item({
    name:"hit delete  to delete new item"
});
const defaultItems=[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

 Item.find({}, function(err, foundItems){
     if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
       if (err) {
         console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
     res.redirect("/");
 }else{
    
 res.render("list", {listTitle: "Today", newListItems: foundItems});
}
 });
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



}); 
    
    
    
 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});
     
 


  /*List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});  */








// app.post to handle POST requests. on to website
//app.post("/",function(req,res)
        
  //  var item=req.body.newItem;
  //  items.push(item);
    
  //  res.redirect("/");


//to listen to this port and print om command prompt
app.listen(3000,function(){
    console.log("sever started on port 3000");
});






