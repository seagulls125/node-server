var patientmodule = require('../../module/patient');

function get(req,res)
{
    patientmodule.get(req.query,function(doc){
        res.send(doc);
    })
}

function active(req,res)
{
	patientmodule.active(req.query.id,function(result){
		res.send({success:true});
	})
}

function saverace(req,res)
{
	patientmodule.saverace(req.body,function(result){
		res.send(result);
	})
}

function getinfo(req,res)
{
	patientmodule.getinfo(req.params.id,function(result){
		res.send(result);
	})
}

function savereminders(req,res)
{	
	patientmodule.savereminders(req.body,function(result){
		res.send(result);
	})
}

function deletereminders(req,res)
{
	patientmodule.deletereminders(req.params.id,function(result){
		res.send(result);
	})
}

function savereaction(req,res)
{
	patientmodule.savereaction(req.body,function(result){
		res.send(result);
	})
}

function deletereaction(req,res)
{
	patientmodule.deletereaction(req.params.id,function(result){
		res.send(result);
	})
}

function savepatientcounter(req,res)
{
	patientmodule.savepatientcounter(req.body,function(result){
		res.send(result);
	})
}

function saveemergency(req,res)
{
	patientmodule.saveemergency(req.body,function(result){
		res.send(result);
	})
}

function getraces(req,res)
{
	patientmodule.getraces(function(result){
		res.send(result);
	})
}

function updateinfo(req,res)
{
	patientmodule.updateinfo(req.params.id,req.body,function(result){
		res.send(result);
	})
}

function getproviders(req,res)
{
	patientmodule.getproviders(function(result){
		res.send(result);
	})
}

function deletepatients(req,res)
{
	patientmodule.deletepatients(req.params.id,function(result){
		res.send(result);
	})
}

function savepharmacy(req,res)
{
	patientmodule.savepharmacy(req.params.patientid,req.body,function(data){
		res.send(data);
	})
}

function searchpharmacy(req,res)
{
	patientmodule.searchpharmacy(req.query.search,function(data){
		res.send(data);
	})
}

module.exports = {
    get:get,
    active:active,
    getinfo:getinfo,
    savereminders:savereminders,
    deletereminders:deletereminders,
    deletepatients:deletepatients,
    savereaction:savereaction,
    deletereaction:deletereaction,
    savepatientcounter:savepatientcounter,
    saveemergency:saveemergency,
    getraces:getraces,
    updateinfo:updateinfo,
    getproviders:getproviders,
    saverace:saverace,
    savepharmacy:savepharmacy,
    searchpharmacy:searchpharmacy
}