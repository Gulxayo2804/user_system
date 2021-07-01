
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const config = require('../config/config')


const UserSchema = new mongoose.Schema({
    name:{ 
        type : String,
        required : [true , 'Iltimos ismingizni kiriting'],
        trim: true
    },
    surname:{ 
        type : String,
        required : [true , 'Iltimos ismingizni kiriting'],
        trim: true
    },
    email:{ 
        type : String,
        required : [true , 'Iltimos pochtangizni kiriting'],
        unique : [true , `Bu pochta allaqachon registratsiyadan o'tgan`],
        trim: true,
    },
    password: { 
        type : String,
        required : [true , 'Iltimos parolni kiriting'],
        trim: true,
        select: false
    },
    phone:{ 
        type: String, 
        required: true,
        unique: true
    },
    role:{
        type:String,
        role:{type:String, enum:['1','2','3'], default:'3'},
        required: true
    }
},{
    timestamps:true 
})



// Encrypt password using bcrypt
UserSchema.pre('save' , async function(next) {
    if(!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
});
// Sign JWT and return
UserSchema.methods.getSignedJWT = function() {
    return JWT.sign({ id: this._id } , config.JWT_SECRET , {
        expiresIn: config.JWT_EXPIRE
    });
}

//  Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare( enteredPassword, this.password);
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10*60*1000;
    return resetToken;
}


module.exports = mongoose.model('User', UserSchema)