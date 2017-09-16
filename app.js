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
  var obj = JSON.parse(setDays(req.body.days));
  console.log(obj[0]);
  // database.weeklyShift.update({name:req.params.username},{$set:{eval("monday:true")}},function(err,result) {
  //   if(err)
  //     console.log("Could not update weeklyShift:\n"+err);
  //     res.redirect('/'+req.params.username);
  //   else {
  //     console.log(result);
  //     res.redirect('/'+req.params.username);
  //   }
  // });
});
// Managing paths for logins
app.post("/home/login",function(req, res) {
  console.log(req.body);
  if (req.body.username == "Admin") {
    res.redirect(req.body.username);
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
        console.log("Era yam:\n"+err);
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
            console.log("successfuly registered:\n"+doc);
            req.flash("regSuccess","New account successfuly registered!");
            // Creating an entry for this new user in the weeklyShift collection
            var workerShifts = new database.weeklyShift({name:newUser.name});
            workerShifts.save(function(err, doc) {
              if(err)
                console.log("Error creating entry for new employee in weeklyShift:\n"+err);
              else {
                console.log("Entry created for new employee in the weeklyShift collection:\n"+doc);
                res.redirect("/");
              }
            }); // end of inner save
          } // end of outer else
        }); // end of save
      }
    });
  }
});
var port = process.env.PORT || 3000;
var host = process.env.HOST || "http://localhost";
app.listen(port, function() {
  console.log("Server running at "+host+":"+port+"/");
});
function setDays(days) {
  var result = "{"+days[0]+":"+true;
  for(var i=1; i<days.length; i++){
    result += ", "+days[i]+":"+true;
  }
  return result+"}";
}
