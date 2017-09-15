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
  monday:{type:Boolean, default:false},
  tuesday:{type:Boolean, default:false},
  wednesday:{type:Boolean, default:false},
  thursday:{type:Boolean, default:false},
  friday:{type:Boolean, default:false},
  saturday:{type:Boolean, default:false},
  sunday:{type:Boolean, default:false}
});
module.exports = { "employee":employee,
                   "weeklyShift":weeklyShift};
