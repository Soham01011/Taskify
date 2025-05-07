const mongoose = require('mongoose');
const bcrypt = require('bcrypt');   

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    refreshToken: {
        type: String,
        default: null
    }
});

UserSchema.pre('save', async function(next) {
    if ( this .isModified  ('password') || this.isNew ) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);