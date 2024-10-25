import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    lastName: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password length should be greater than 6 characters"],
      select: false,
    },

    location: {
      type: String,
      default: "USA",
    },
  },
  { timestamps: true }
);

// Middlewares
userSchema.pre("save", async function (next) {
  // Check if the password is modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//compare password
userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

// JSON Web Token
userSchema.methods.createJWT = function () {
  return JWT.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default mongoose.model("User", userSchema);
