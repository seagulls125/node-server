var chartmodule = require('../../module/charttype');

function get(req,res)
{
    chartmodule.get(req.params.id,function(data){
        res.send(data);
    })
}

module.exports = {
    get:get
}