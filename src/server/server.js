
var express_1 = require("express");

var app = (0, express_1.default)();
var port = 3000; 

app.get("/hello", function (req, res) { return res.send("Hello World"); });

app.listen(port, function () {
    console.log("Server is listening at http://localhost:".concat(port));
});
