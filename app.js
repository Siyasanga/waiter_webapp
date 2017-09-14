const exhbs = require('express-handlebars');
const body = require('body-parser');
const express = require('express');
var app = express();
app.engine("hbs",exhbs({ defaultLayout:"main",
                         extname:"hbs"}));
app.set("view engine","hbs");
app.use(express.static("public"));
app.get("/",function(req, res) {
  res.render("home");
});
app.get("/user",function(req, res) {
  res.render("empLogin");
});
app.post("/",function(req, res) {
  res.render("empLogin",{submitted:true});
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
