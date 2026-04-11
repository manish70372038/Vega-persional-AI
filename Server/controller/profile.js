import User from "../model/user.js";

const Profile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found.." });
        }

        return res.status(200).json({ message: "User profile fetched!", user });

    } catch (error) {
        console.error("internal server crashed..", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default Profile;