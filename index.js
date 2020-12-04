var express = require('express');
var bodyparser = require('body-parser');
var app = express();
var route = require('./route');
var path = require('path');


app.use(bodyparser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-timebase"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use(express.static(path.join(__dirname,"assets")));
app.use('/api',route.register);
app.listen(5183,function(req,res){
    console.log("your server is running in 5183 port");
})