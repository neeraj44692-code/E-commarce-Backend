import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/productRoutes.js";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

//middelwares
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", Credential: true }));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});
