import jwt from "jsonwebtoken";
import User from "../model/user.js";

const Userdata = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "user not login..",
      });
    }
  
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.userId).select("-password");
    res.json({
      name: user.name,
      email: user.email,
    });

  } catch (error) {
    console.error("internal issue", error);
    return res.status(500).json({
      message: "server error",
    });
  }
};

export default Userdata;