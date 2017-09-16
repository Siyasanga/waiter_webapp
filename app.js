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
// Rendering the home page
app.get("/",function(req, res) {
  res.render("home");
});
// Rendering view for the logged in employee
app.get("/:username",function(req, res) {
  res.render("empLogin");
});
// Rendering screen for the logged in admin
app.get("/home/Admin",function(req, res) {
  res.render("adminLogin");
});
// Updating availability of the logged in employee
app.post("/:username",function(req, res) {
  console.log(req.params.username+'\n'+req.body.days);
  res.redirect('/' + req.params.username);
});
// Managing paths for logins
app.post("/home/login",function(req, res) {
  if (req.body.username == "Admin") {
    res.redirect(req.body.username);
  }else {
    res.redirect("/"+req.body.username);
  }
});
// Processing the registration of a new employee
app.post("/home/registration",function(req, res) {
  // Making sure that password and confirmation password are identical
  if(req.body.pass !== req.body.confirm){
    req.flash("mismatch","Your password and confirmation do not match.");
    res.redirect("/");
  }else {
    // Checking if this is not a duplicate user
    database.employee.findOne({username:req.body.username},function(err,doc) {
      if(err) {
        console.log(err);
      }else if(doc){
        req.flash("duplicateUser","Username already exists.");
        res.redirect("/");
      }
      else {
        // registering the new user
        var newUser = new database.employee({name:req.body.firstname, username:req.body.username, password:req.body.pass});
        newUser.save(function(err, doc) {
          if(err)
            console.log(err);
          else {
            // Creating an entry for this new user in the weeklyShift collection
            var workerShifts = new database.weeklyShift(newUser.name);
            console.log(workerShifts);
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
