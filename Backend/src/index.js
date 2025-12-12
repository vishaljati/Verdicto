import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app.js";
import { connectDB } from "./db/index.js";

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        console.error("Error starting server:", err);
      } else {
        console.log(`Server started at: http://localhost:${port}`);
      }
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection failed !!", error);
  });

