const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./src/routes/auth");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 3000; // You can change this to your preferred port

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${process.env.PORT}`);
});
