const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userId:{
        type: String,
        required: true

    },
    amount:{
        type: Number,
        required: true
    },
    created_at: Date
});

const CouponSchema = mongoose.Schema({
    code: {
        type: String, 
        required: true, 
        unique: true 
    },
    isPercent: { 
        type: Boolean, 
        required: true, 
        default: true 
    },
    amount: { 
        type: Number, 
        required: true 
    }, // if is percent, then number must be ≤ 100, else it’s amount of discount
    expireDate: { 
        type: String, 
        required: true, 
        default: "" 
    },
    remeningNumber: {
        type: Number,
        required: true
    },
    isActive: { 
        type: Boolean, 
        required: true, 
        default: true 
    },

    created_at:{
        type: Date
    },

    updated_at: {
        type: Date
    },

    users:[UserSchema]
});


CouponSchema.pre("save", function (next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
        this.updated_at = null;
    }
    next();
});





var Coupon = mongoose.model("Coupon", CouponSchema);

module.exports = Coupon;

// module.exports.coupongenerator = () => {
//     return 
// }