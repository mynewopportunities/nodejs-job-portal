import userModel from "../models/userModel.js";

// Register Controller
export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name) {
      return res.status(400).send("Name is required");
    }
    if (!email) {
      return res.status(400).send("Email is required");
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be greater than 6 characters");
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists. Please log in.");
    }

    // Create user
    const user = await userModel.create({ name, email, password });

    // Token
    const token = user.createJWT();
    res.status(201).send({
      success: true,
      message: "User created successfully",
      user: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login Controller
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send("Please provide all fields");
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid username or password");
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next("Invalid username or password");
    }

    // Generate token
    user.password = undefined;
    const token = user.createJWT();
    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
