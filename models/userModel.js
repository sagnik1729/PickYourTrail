
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //it is built in module

//----------------------------------------------------------------------------------------------------------------
//SCHEMA
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
        maxlength: [40, "A user name must have less or equal then 40 characters"],
        unique: true,
        trim: true,

    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],

    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
        validate: {
            validator: function (val) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val);
            },
            message: "Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 special character"
        }

        //^                             start
        //(?=.* [a - z])               at least 1 small
        //(?=.* [A - Z])               at least 1 capital
        //(?=.*\d)                     at least 1 number
        //(?=.* [@$! %*?&])            at least 1 special
        //[A - Za - z\d @$!%*?&]{ 8,}  allowed chars + min 8
        // $                           end
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords are not the same!"
        },
        // select: false -> dont need this, as we already undefined it in pre middleware
    },
    passwordChangedAt: {
        type: Date,
        select: false, //select false mean-> this field will not be sent to the client; also this.passwordChangedAt = undefined
        default: Date.now() - 5000

    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    userName: {
        type: String,
        unique: true,
        required: [true, "A user must have a userName"],
        validate: {
            validator: val => /^[a-zA-Z0-9_.]+$/.test(val),
            message: "Username can only contain letters, numbers, underscore (_) and dot (.)"
        },
        trim: true
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
//--------------------------------------------------------------------------------------------------------------------

//INSTANCE METHOD: it will be available on all user documents

// TO CHECK IF PASSWORD IS CORRECT
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword); //compare(plain, hash)
}

userSchema.methods.changePasswordAfter = (JWTTimeStamp, passwordChangedAt) => {

    passwordChangedAt = parseInt(passwordChangedAt.getTime() / 1000, 10);
    // console.log(passwordChangedAt, JWTTimeStamp);

    //false -> mean password not changed
    return JWTTimeStamp < passwordChangedAt

}


userSchema.methods.passwordResetTokenFn = function (token) {
    const resetToken = crypto.randomBytes(32).toString("hex"); //this is real token
    //but we will not save this token in the database
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    //passwordResetExpires -> will save as a timestamp;
    // (but in new Date(Date.now() + 10 * 60 * 1000).toISOString() format in the database)
    console.log({ resetToken }, this.passwordResetToken);
    return resetToken

}



//----------------------------------------------------------------------------------------------------
//MIDDLEWARE

//DOCUMENT MIDDLEWARE
userSchema.pre("save", function () {
    if (!this.isModified("password") || this.isNew) return
    //if the password is modified  we change the passwordChangedAt
    this.passwordChangedAt = Date.now() - 5000;

})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    //a salt is random data added to a password before it is processed by a hashing function
    //12 is the number of salt rounds-> cost parameter
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;

});

userSchema.pre(/^find/, function () {
    this.find({ active: { $ne: false } });

})

userSchema.pre("aggregate", function () {
    this.pipeline().unshift({ $match: { active: { $ne: false } } });

})








//--------------------------------------------------------------------------------------------------------------------
//USER MODEL
const User = mongoose.model("User", userSchema);
module.exports = User;