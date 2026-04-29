
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import Connectdb from "./database/db.js";
import  dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieparser from "cookie-parser";
import router from "./router/api.js";



const app = express();

app.use(express.json());
app.use(cookieparser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://vega-persional-ai-u6wq.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use("/api", router);

const port = process.env.PORT || 5000;

Connectdb().then(() => {
    app.listen(port, () => {
        console.log("Server is running on port", port);
    });
});