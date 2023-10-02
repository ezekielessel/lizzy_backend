"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
/* import bodyParser from "body-parser";
import bcrypt from "bcrypt"; */
/* import * as authRoutes from './routes/auth'; */
var app = (0, express_1.default)();
var port = 3000; // You can change this to your preferred port
/* app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 */
/* app.use('/auth', authRoutes); */
app.get("/hello", function (req, res) { return res.send("Hello World"); });
app.listen(port, function () {
    console.log("Server is listening at http://localhost:".concat(port));
});
