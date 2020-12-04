var macro = require('../../module/macro');

function getccproblem(req,res)
{
	macro.getccproblem(req.body.id,function(data){
		res.send(data);
	})
}

function gethpiproblems(req,res)
{
	macro.gethpiproblems(req.body.id,function(data){
		res.send(data);
	})
}

function getproblems(req,res)
{
	macro.getproblems(req.query.query,function(data){
		res.send(data);
	})
}

function getsymptoms(req,res)
{
	macro.getsymptoms(req.query.query,function(data){
		res.send(data);
	})
}

function getallergy(req,res)
{
	macro.getallergy(req.query.query,function(data){
		res.send(data);
	})
}

function add(req,res)
{
	macro.add(req.body.data,function(data){
		res.send(data);
	})
}

function deletemacro(req,res)
{
	macro.deletemacro(req.body.id,function(data){
		res.send(data);
	})
}

function getdataplan(req,res)
{
	macro.getdataplan(function(data){
		res.send(data);
	})	
}

function search(req,res)
{
	macro.search(req.query,function(data){
		res.send(data);
	})
}

module.exports = {
	getccproblem:getccproblem,
	gethpiproblems:gethpiproblems,
	getproblems:getproblems,
	getsymptoms:getsymptoms,
	getallergy:getallergy,
	add:add,
	deletemacro:deletemacro,
	getdataplan:getdataplan,
	search:search
}