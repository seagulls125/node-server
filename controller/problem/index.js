var problemmodule = require('../../module/problem');

function get(req,res)
{
    problemmodule.get(req.query.search,function(data){
        res.send(data);
    })
}

function macro(req,res)
{
	problemmodule.macro(function(data){
		res.send(data);
	})
}

function masterfile(req,res)
{
	problemmodule.master(req.params.id,function(data){
		res.send(data);
	})
}

function macrofile(req,res)
{
	problemmodule.macrofile(req.params.id,function(data){
		res.send(data);
	})
}

function masternode(req,res)
{
	problemmodule.masternode(req.params.id,function(data){
		res.send(data);
	})
}

function getdiagnostic(req,res)
{
	problemmodule.getdiagnostic(function(data){
		res.send(data);
	})
}

function getmeds(req,res)
{
	problemmodule.getmeds(req.query,function(data){
		res.send(data);
	})
}

function searchmeds(req,res)
{
	problemmodule.searchmeds(req.query,function(data){
		res.send(data);
	})
}

function alergyinfo(req,res)
{	
	problemmodule.alergyinfo(function(data){
		res.send(data);
	})
}

function savemaster(req,res)
{
	problemmodule.savemaster(req.body,function(data){
		res.send(data);
	})
}

function commonproblem(req,res)
{
	problemmodule.common(function(data){
		res.send(data);
	})
}
function favouriteproblem(req,res)
{
	problemmodule.favourite(function(data){
		res.send(data);
	})	
}

function savemasterfile(req,res)
{
	problemmodule.savemasterfile(req.body,function(data){
		res.send(data);
	})
}


function getrelated(req,res)
{
	problemmodule.getrelated(req.params.id,function(data){
		res.send(data);
	})
}

function addrelated(req,res)
{
	problemmodule.addrelated(req.params.id,req.body.code,function(data){
		res.send(data);
	})
}

function search(req,res)
{
	problemmodule.search(req.params.param,req.query.data,function(data){
		res.send(data);
	})
}

function add(req,res)
{
	problemmodule.add(req.params.type,req.body,function(data){
		res.send(data);
	})
}

function addmastersection(req,res)
{
	problemmodule.addmastersection(req.params.sectionid,req.body,function(data){
		res.send(data);
	})
}

function deletemastersection(req,res)
{
	problemmodule.deletemastersection(req.params.sectionid,req.query.id,function(data){
		res.send(data);
	})
}

function addmasterfileitem(req,res)
{
	problemmodule.addmasterfileitem(req.body,function(data){
		res.send(data);
	})
}

function deletemasterfileitem(req,res)
{
	problemmodule.deletemasterfileitem(req.query.id,function(data){
		res.send(data);
	})
}

function addmasterfilenode(req,res)
{
	problemmodule.addmasterfilenode(req.body,function(data){
		res.send(data);
	})
}

function deletemasterfilenode(req,res)
{
	problemmodule.deletemasterfilenode(req.query,function(data){
		res.send(data);
	})
}

function addstatement(req,res)
{
	problemmodule.addstatement(req.body,function(data){
		res.send(data);
	})
}

function deletestatement(req,res)
{
	problemmodule.deletestatement(req.query.id,function(data){
		res.send(data);
	})
}

module.exports = {
    get:get,
    macro:macro,
    masterfile:masterfile,
    macrofile:macrofile,
    masternode:masternode,
    getdiagnostic:getdiagnostic,
    getmeds:getmeds,
    searchmeds:searchmeds,
    alergyinfo:alergyinfo,
    savemaster:savemaster,
    common:commonproblem,
    favourite:favouriteproblem,
    savemasterfile:savemasterfile,
    getrelated:getrelated,
    addrelated:addrelated,
    search:search,
    add:add,
    addmastersection:addmastersection,
    addmasterfileitem:addmasterfileitem,
    deletemastersection:deletemastersection,
    deletemasterfileitem:deletemasterfileitem,
    addmasterfilenode:addmasterfilenode,
    deletemasterfilenode:deletemasterfilenode,
    addstatement:addstatement,
    deletestatement:deletestatement
}