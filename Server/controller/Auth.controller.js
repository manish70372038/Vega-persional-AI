import User from "../model/user.js";
import bcrypt from "bcrypt";
import genratedtoken from "../utils/token.js";

const Sighn = async (req, res) => {
  const { name, email, password } = req.body;
  console.log({ name, email, password });
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const Existingemail = await User.findOne({ email });
    if (Existingemail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hasshpassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hasshpassword,
    });

    await user.save();

    const token = genratedtoken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ message: "User successfully signed up!" });

  } catch (error) {
    console.error("Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default Sighn;