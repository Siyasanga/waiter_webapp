const exhbs = require('express-handlebars');
const express = require('express');
var app = express();
app.engine("hbs",exhbs({ defaultLayout:"main",
                         extname:"hbs"}));
app.set("view engine","hbs");
app.use(express.static("public"));
app.get("/",function(req, res) {
  res.render("days");
});
app.get("/user",function(req, res) {
  res.render("empLogin");
});

var port = process.env.PORT || 3000;
var host = process.env.HOST || "http://localhost";
app.listen(port, function() {
  console.log("Server running at "+host+":"+port+"/");
});
