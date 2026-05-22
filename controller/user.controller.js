import User from "../models/user.model.js";

export async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, '-password'); // excludes password
        res.status(200).json(users); // Return array directly
    } catch(e) {
        return res.status(500).json({ message: "Error retrieving users", error: e.message });
    }
}

export async function updateProfile(req, res) {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) {
            // Check if email already registered by someone else
            if (email.toLowerCase() !== user.email) {
                const emailExists = await User.findOne({ email: email.toLowerCase() });
                if (emailExists) {
                    return res.status(400).json({ message: "Email already in use" });
                }
                user.email = email.toLowerCase();
            }
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch(e) {
        res.status(500).json({ message: "Error updating user profile", error: e.message });
    }
}