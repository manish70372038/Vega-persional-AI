import jwt from "jsonwebtoken";

const Isauthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(404).json({ message: "do login first.." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("internal issued..", error);
    return res.status(500).json({ message: "internal server crashed.." });
  }
};

export default Isauthenticated;