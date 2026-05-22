import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // auto-detect admin role based on email to facilitate testing
    const role = email.toLowerCase() === 'admin@bottle.com' ? 'admin' : 'user';

    // create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Server error during registration",
      error: e.message,
    });
  }
}

export async function login(req, res) {
  try {
    const inputEmail = req.body.email || req.body.username;
    const { password } = req.body;

    if (!inputEmail || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: inputEmail.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Server error during login",
      error: e.message
    });
  }
}