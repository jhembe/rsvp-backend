const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rsvp: { type: Boolean, default: false },
    qrCode: { type: String },
    verified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Guest', GuestSchema);
