const exhbs = require('express-handlebars');
const body = require('body-parser');
const express = require('express');
var app = express();
app.engine("hbs",exhbs({ defaultLayout:"main",
                         extname:"hbs"}));
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
  res.render("empLogin");
});
app.post("/:username",function(req, res) {
  console.log(req.params.username+'\n'+req.body.days);
  res.redirect('/' + req.params.username);
});

app.post("/login",function(req, res) {
  console.log(req.body);
  if (req.body.username == "Admin") {
    res.render("adminLogin");
  }else {
    res.redirect("/"+req.body.username);
  }
});
app.post("/registration",function(req, res) {
  console.log(req.body);
  res.render("adminLogin");
});

var port = process.env.PORT || 3000;
var host = process.env.HOST || "http://localhost";
app.listen(port, function() {
  console.log("Server running at "+host+":"+port+"/");
});
