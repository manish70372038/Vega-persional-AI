import bcrypt from "bcrypt";
import User from "../model/user.js";
import genratedtoken from "../utils/token.js";

const Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            console.log({ email, password });
            return res.status(400).json({ message: "All fields are required" });
        }

        const useremail = await User.findOne({ email });
        if (!useremail) {
            return res.status(400).json({ message: "Email not found" });
        }

        const isMatch = await bcrypt.compare(password, useremail.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }
     
        const token = genratedtoken(useremail._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000
            
        });
    
        return res.status(200).json({ message: "User login successfully!" });

    } catch (error) {
        console.error("Internal server error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default Login;