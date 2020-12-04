var meds = require('../../module/problem/meds');
function info(req,res)
{
	meds.getinfo(req.query,function(data){
		res.send(data);
	})
}

function detail(req,res)
{
	meds.getdetail(req.params.id,function(data){
		res.send(data);
	})
}

function addindication(req,res)
{
	meds.addindication(req.params.type,req.params.id,req.body,function(data){
		res.send(data);
	})
}

function addallergy(req,res)
{
	meds.addallergy(req.body,function(data){
		res.send(data);
	})
}
module.exports = {
	info:info,
	detail:detail,
	addindication:addindication,
	addallergy:addallergy
}