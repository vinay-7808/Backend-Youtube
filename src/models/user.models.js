import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"; // generate tokens not normal readable conytains headers and data. It contains secret code to decrypt
import bcrypt from "bcrypt" // bearer token, used to hash password for encryption and decryption

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // for searching optimisation
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //Cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true})

userSchema.pre("save", async function (next) { // execute code just before saving (password encrypt)
    if(!this.isModified("password")) return next() // if password is created or modified then only change

    this.password = await bcrypt.hash(this.password, 10) //hash round
    next();
}) 

userSchema.methods.isPasswordCorrect = async function (password) { // to check password is correct or not
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () { 
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () { 
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)