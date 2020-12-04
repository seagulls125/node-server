var locationmodule = require('../../module/location');

function get(req,res)
{
    locationmodule.get(req.query,function(data){
        res.send(data);
    })
}

module.exports = {
    get:get
}