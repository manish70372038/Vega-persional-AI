// ✅ Sab import style karo
import express from "express";
import Sighn from "../controller/Auth.controller.js";
import Login from "../controller/Login.js";
import Logout from "../controller/logout.js";
import Isauthenticated from "../middleware/authsecurity.js";
import Profile from "../controller/profile.js";
import Userdata from "../controller/Getuser.js";
import gemnicontroller from "../controller/gemni.js";


const router = express.Router();
router.post("/signup", Sighn);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/profile", Isauthenticated, Profile);
router.get("/getuser", Isauthenticated, Userdata);
router.post("/chat" ,Isauthenticated ,gemnicontroller);

export default router;