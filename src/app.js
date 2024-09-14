import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // middleware to allow requests from these origin

app.use(express.json({limit: "16kb"})); // middleware for accepting json of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // middleware for parsing the url
app.use(express.static("public")) //middleware for keeping files in public folder
app.use(cookieParser()) // middleware to perform crud operation on cookie of browser

export { app }