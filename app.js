const exhbs = require('express-handlebars');
const body = require('body-parser');
const express = require('express');
const database = require('./database');
const flash = require('express-flash');
const session = require('express-session');
var app = express();
app.engine("hbs",exhbs({ defaultLayout:"main",
                         extname:"hbs"}));
app.use(session({secret:"keyboard cat", cookie: { maxAge: 60000}}));
app.use(flash());
app.set("view engine","hbs");
app.use(express.static("public"));
app.use(body.urlencoded({
  extended:false
}));
app.use(body.json());
app.get("/",function(req, res) {
  res.render("home");
});
app.get("/:username",function(req, res) {
  console.log(req.params.username);
  res.render("empLogin");
});
app.get("/home/Admin",function(req, res) {
  res.render("adminLogin");
});
app.post("/:username",function(req, res) {
  console.log(req.params.username+'\n'+req.body.days);
  res.redirect('/' + req.params.username);
});
app.post("/home/login",function(req, res) {
  if (req.body.username == "Admin") {
    console.log(req.body.username);
    res.redirect(req.body.username);
  }else {
    res.redirect("/"+req.body.username);
  }
});
app.post("/home/registration",function(req, res) {
  if(req.body.pass !== req.body.confirm){
    req.flash("mismatch","Your password and confirmation do not match.");
    res.redirect("/");
  }else {
    database.employee.findOne({username:req.body.username},function(err,doc) {
      if(err) {
        console.log(err);
      }else if(doc){
        console.log("Inside findOne: \n"+doc);
        req.flash("duplicateUser","Username already exists.");
        res.redirect("/");
      }
      else {
        var newUser = new database.employee({name:req.body.firstname, username:req.body.username, password:req.body.pass});
        newUser.save(function(err, doc) {
          if(err)
            console.log(err);
          else {
            console.log("successfuly registered:\n"+doc);
            req.flash("regSuccess","New account successfuly registered!");
            res.redirect("/");
          }
        });
      }
    });
  }
});
var port = process.env.PORT || 3000;
var host = process.env.HOST || "http://localhost";
app.listen(port, function() {
  console.log("Server running at "+host+":"+port+"/");
});
