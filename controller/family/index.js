var familymodule = require('../../module/family');

function get(req,res)
{
	familymodule.get(req.params.id,function(data){
		res.send(data);
	})
}

function save(req,res)
{
	familymodule.save(req.body,function(data){
		res.send(data);
	})
}

function deletefamily(req,res)
{
	familymodule.deletefamily(req.params.id,function(data){
		res.send(data);
	})
}


function getrelation(req,res)
{
	familymodule.getrelation(function(data){
		res.send(data);
	})
}


module.exports = {
	get:get,
	save:save,
	delete:deletefamily,
	getrelation:getrelation
}