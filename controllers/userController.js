import userModel from "../models/userModel.js";

export const updateUserController = async (req, res, next) => {
  const { name, email, lastName, location } = req.body;

  // Validate input fields
  if (!name || !email || !lastName || !location) {
    return next("Please Provide All Fields");
  }

  try {
    // Find user by ID from JWT payload
    const user = await userModel.findOne({ _id: req.user.userId });
    if (!user) {
      return next("User not found");
    }

    // Update user fields
    user.name = name;
    user.lastName = lastName;
    user.email = email;
    user.location = location;

    // Save updated user
    await user.save();

    // Generate new token
    const token = user.createJWT();

    // Send response
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    next("Error updating user");
  }
};
