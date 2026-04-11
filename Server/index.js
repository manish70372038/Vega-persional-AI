import express from "express";
import Connectdb from "./database/db.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";
import router from "./router/api.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieparser());

app.use(cors({
    origin: "https://vega-persional-ai.onrender.com",
    credentials: true
}));

app.use("/api", router);

const port = process.env.PORT || 5000;

Connectdb().then(() => {
    app.listen(port, () => {
        console.log("Server is running on port", port);
    });
});