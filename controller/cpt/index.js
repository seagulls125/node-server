var cpt = require('../../module/cpt');

function get(req,res)
{
    cpt.get(req.query.search,function(data){
        res.send(data);
    })
}

//common data from cpt table
function common(req,res)
{
	cpt.common(function(data){
		res.send(data);
	})
}

function favourite(req,res)
{
	cpt.favourite(function(data){
		res.send(data);
	})
}

module.exports = {
    get:get,
    common:common,
    favourite:favourite
}