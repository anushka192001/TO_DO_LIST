const express =  require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
  
  
mongoose.connect("mongodb://localhost:27017/to_do_list_DB",{useNewUrlParser: true}) ; 
  
const item = new mongoose.Schema({
   name: String
});
   
const ITEMS = mongoose.model("ITEMS",item);  
  
const lists = new mongoose.Schema({
 title: String,
 items: [item]
});

const LISTS = mongoose.model("LIST_TITLES",lists);


app.get("/",function(req,res){

var today = new Date();

var options = {
weekday: "long",
day: "numeric",
month: "long",
}

var day = today.toLocaleDateString("en-US",options);

LISTS.find({},function(err,found_items){
  if(err){
   console.log("failed to show the lists titles");
  }else{
    console.log("sucessfull");
    res.render("list",{DAY: day,CATEGORIES:found_items,ACTIVITY:"CHOOSE"});
  }
});
})


app.post("/",function(req,res){
  const list_item = new LISTS ({
   title: req.body.add_a_list
  });

  list_item.save();
  
  res.redirect("/");
})


app.get("/:listTitle",function(req,res){
  var TITLE = req.params.listTitle.replace(/_/g,' ');  
  LISTS.findOne({title: TITLE},function(err,found_items){
  if(err){
   console.log("item cannot be added in the list");
  }else{
     res.render("list",{CATEGORIES:found_items.items,ACTIVITY:TITLE}); 
  }
  });
})


app.post("/:listTitle",function(req,res){
  var TITLE = req.params.listTitle.replace(/_/g,' ');  
  if(TITLE != 'delete'){
  const item = new ITEMS ({
    name: req.body.item
  });
  
  item.save();
  
  LISTS.findOne({title:TITLE},function(err,found_list){
  
    if(err){
     console.log("item cannot be added in the list");
    }else{
      found_list.items.push(item);
      found_list.save();
      res.redirect("/" + req.params.listTitle);
    }
    }); 
    
  }else{
   const checked_item_id = req.body.checkbox;
   const list_name = req.body.list_name;
   ITEMS.findByIdAndRemove(checked_item_id,function(err){
    if(!err){
    console.log("sucessfully deleted from ITEMS collection");
    }
   });
   
   LISTS.findOneAndUpdate({title:list_name},{$pull: {items: {_id: checked_item_id}}},function(error,found_list){
    if(!error){
     console.log("successfully removed");
    }
   });
   res.redirect("/" + list_name.replace(/\s+/g,'_'));
   }
  })

app.listen(3000,function(){
 console.log("sucessfully started");
});



app.post("/delete/list",function(req,res){
 const checked_list_id = req.body.checkbox;
 LISTS.findByIdAndRemove(checked_list_id,function(err){
  if(!err){
  console.log("sucessfully deleted from ITEMS collection");
  }
 });
 res.redirect("/");
})