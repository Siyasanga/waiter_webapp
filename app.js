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
var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
// Rendering the home page
app.get("/",function(req, res) {
  res.render("home");
});
// Rendering view for the logged in employee with relevent data
app.get("/:username",function(req, res) {
  database.weeklyShift.findOne({name:req.params.username},function(err, doc) {
    if(err)
      console.log("Error accessing the collection: \n"+err);
    else {
      res.render("empLogin",{name:req.params.username, account:doc});
    }
  }) // end of findOne()
}); // end of get()
app.get("/admin/:day",function(req, res) {
  var condition = {};
  condition[req.params.day.toLowerCase()] = true;
  database.weeklyShift.find(condition,function(err, waiters) {
    if(err)
      console.log("Error trying to find waiters for: "+req.params.day+"\n"+err);
    else {
      res.render("adminLogin",{current:req.params.day, waiter:waiters});
    }
  })
})
app.get("/home/Admin/reset",function(req, res) {
  database.weeklyShift.remove({},function(err) {
    if(err)
      console.log("Error trying to reset the weeklyShift collection:\n"+err);
    else {
      console.log("Database collection: weeklyShift cleared");
      req.flash("reset","Schedule cleared and ready for the new week!");
      res.redirect("/home/Admin");
    }
  })
})
// Rendering screen for the logged in admin
app.get("/home/Admin",function(req, res) {
  var totals = [];
  getDaySubs().then(function(weeklySchedule) {
    var adminData = [];
    for(i in days){
      day = {};
      day.day = days[i];
      day.subs = weeklySchedule[i];
      adminData.push(day);
    }
    res.render("adminLogin",{day:adminData});
  });
});
// Updating availability of the logged in employee
app.post("/:username",function(req, res) {
  // Removing the old entry for the employee
  database.weeklyShift.remove({name:req.params.username},function(err) {
    if(!err)
      updateDays(req,res);
    else
      console.log("Error removing entry for"+req.params.username+" in weeklyShift:\n"+err);
  }); // end of remove()
}); // end of post
// Managing paths for logins
app.post("/home/login",function(req, res) {
  console.log(req.body);
  if (req.body.username == "Admin") {
    res.redirect(req.body.username);
    return;
  }
  database.employee.findOne({username:req.body.username, password:req.body.password},function(err,doc) {
    if(err)
      console.log("Error finding these credetials on the database:\n"+err);
    else if(doc) {
      console.log("These credetials match:\n"+doc);
      res.redirect("/"+doc.name);
    }else {
      req.flash("failedLogin","Incorrect username and password.");
      res.redirect("/");
    }
  }) // end of findOne
}); // end post()
// Processing the registration of a new employee
app.post("/home/registration",function(req, res) {
  // Making sure that password and confirmation password are identical
  if(req.body.pass !== req.body.confirm){
    req.flash("mismatch","Your password and confirmation do not match.");
    res.redirect("/");
  }else {
    // Checking if this is not a duplicate user
    database.employee.findOne({username:req.body.username},function(err,doc) {
      if(err)
        console.log("Error, lost connection to the database:\n"+err);
      else if(doc){
        req.flash("duplicateUser","Username already exists.");
        res.redirect("/");
      }
      else
        registerUser(req,res);
    });
  } // End of outer else
});
var port = process.env.PORT || 3000;
var host = process.env.HOST || "http://localhost";
app.listen(port, function() {
  console.log("Server running at "+host+":"+port+"/");
});
// registering the new user
function registerUser(req,res) {
  var newUser = new database.employee({name:req.body.firstname, username:req.body.username, password:req.body.pass});
  newUser.save(function(err, doc) {
    if(err)
      console.log(err);
    else {
      req.flash("regSuccess","New account successfuly registered!");
      res.redirect("/");
    } // end of outer else
  }); // end of save
} // end of registerUser()
// Collecting data for employee in weeklyShift
function setDays(user, days) {
  var result = {name:user};
  if(!days)
    return {name:user};
  if(typeof(days)=="string"){
    result[days] = true;
    return result;
  }
  for(var i=0; i<days.length; i++){
    result[days[i]] = true;
  }
  console.log(result);
  return result;
}
// Update days for logged in employee
function updateDays(req,res) {
  var workerShifts = new database.weeklyShift(setDays(req.params.username,req.body.days));
  workerShifts.save(function(err, doc) {
    if(err){
      console.log("Could not update weeklyShift:\n"+err);
      res.redirect('/'+req.params.username);
    }else {
      console.log(doc);
      req.flash("submitted","true");
      req.flash("feedback","true");
      res.redirect('/'+req.params.username);
    }
  }); // end of save()
}
// Get total number of subscribers for each day
function getDaySubs() {
  var dayz = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  var totals = [];
  var daysQueries = dayz.map(function(day){
    var condition = {};
    condition[day] = true;
    return database.weeklyShift.find(condition,"name").count();
  });
  // Wait for all the promises to complete
  return Promise.all(daysQueries);
}
