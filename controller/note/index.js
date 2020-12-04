var notemodule = require('../../module/note');

function savenote(req,res)
{
	notemodule.savenote(req.body,function(data){
		res.send(data);
	})
}

function get(req,res)
{
	notemodule.get(req.params.id,function(data){
		res.send(data);
	})
}

function getdata(req,res)
{
	notemodule.getnotes(req.params.id,function(data){
		res.send(data);
	})
}
module.exports = {
	savenote:savenote,
	get:get,
	getdata:getdata
}