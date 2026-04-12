const Logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    return res.status(200).json({ message: "User logout Successfully" });
  } catch (error) {
    console.error("internal issue", error);
    return res.status(500).json({ message: "internal error with status.." });
  }
};

export default Logout;