var dynamic = require('../../module/problem/dynamic');

function save(req,res)
{
	dynamic.save(req.body,function(data){
		res.send(data);
	})
}

function get(req,res)
{
	dynamic.get(req.params.id,function(data){
		res.send(data);
	})
}

function search(req,res)
{
	dynamic.search(req.query,function(data){
		res.send(data);
	})
}

module.exports = {
	save:save,
	get:get,
	search:search
}