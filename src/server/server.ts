import express from "express";
import bodyParser from "body-parser";

import authRoutes from "../routes/auth";

const app = express();
const port = 3000; // You can change this to your preferred port

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
