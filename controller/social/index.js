var social = require('../../module/social');

function get(req,res)
{
    social.get(function(data){
        res.send(data);
    })
}
module.exports = {
    get:get
}