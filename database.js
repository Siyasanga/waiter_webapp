const mongoose = require('mongoose');
var mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/resturant";
mongoose.connect(mongoURL, function(err, result) {
  if (err)
    console.log(err);
  else
    console.log("Database connection established.");
});
var employee = mongoose.model("employee", {
  name:{type:String},
  username:{type:String},
  password:{type:String}
});
var weeklyShift = mongoose.model("weeklyShift", {
  name:{type:String},
  monday:{type:String, default:null},
  tuesday:{type:String, default:null},
  wednesday:{type:String, default:null},
  thursday:{type:String, default:null},
  friday:{type:String, default:null},
  saturday:{type:String, default:null},
  sunday:{type:String, default:null}
});
module.exports = { "employee":employee,
                   "weeklyShift":weeklyShift};
