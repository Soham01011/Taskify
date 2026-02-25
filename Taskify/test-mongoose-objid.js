const mongoose = require("mongoose");
console.log(mongoose.Types.ObjectId.isValid("not-a-valid-id"));
console.log(mongoose.Types.ObjectId.isValid("699ed62434a107145fcf5a89"));
