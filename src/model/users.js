const mongoose = require('mongoose');


const subscriptionSchema = new mongoose.Schema({
    subscriptionID: { type: String }, 
    planId: { type: String },
    status: { type: String },
    start: { type: Date },
    end: { type: Date },
    lastBillDate: { type: Date },
    nextBillDate: { type: Date },
    paymentsMode: { type: Number },
    paymentsRemaining: { type: Number }
});
const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
   role: { type: String, required: true, default: 'admin' },
    adminId : { type: mongoose.Schema.Types.ObjectId, ref: 'User',index: true }, 
});

module.exports = mongoose.model('User', userSchema);