var user = require('../../module/user');

function login(req,res)
{
	var login = req.body.login;
	var password = req.body.password;

	user.login(login,password,function(data){
		res.send(data);
	})
}

function speciality(req,res)
{
	user.speciality(function(data){
		res.send(data)
	})
}

function add(req,res)
{
	user.add(req.body,function(data){
		res.send(data);
	})
}

function deleteuser(req,res)
{
	user.deleteuser(req.params.id,function(data){
		res.send(data);
	})
}

function setphysician(req,res)
{
	user.setphysician(req.params.id,req.body,function(data){
		res.send(data);
	})
}

module.exports = {
	login:login,
	speciality:speciality,
	add:add,
	deleteuser:deleteuser,
	setphysician:setphysician
}