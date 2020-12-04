var admin = require('../../module/admin');
var patient = require('../../module/admin/patient');

function searchuser(req,res)
{
	if(req.params.type == 'patient')
	{
		admin.searchpatient(req.body,function(data){
			res.send(data);
		})
	}
	else
	{
		admin.search(req.params.type,req.body,function(data){
			res.send(data);
		})	
	}
	
}

function getpatientphysician(req,res)
{
	admin.getpatientphysician(req.params.id,function(data){
		res.send(data);
	})
}

function patientadd(req,res)
{
	patient.add(req.body,function(data){
		res.send(data)
	})
}

function searchlocation(req,res)
{
	admin.searchlocation(req.query,function(data){
		res.send(data);
	})
}

function searchfacilities(req,res)
{
	admin.searchfacilities(function(data){
		res.send(data);
	})
}


function searchalergy(req,res)
{
	admin.searchalergy(req.query,function(data){
		res.send(data);
	})
}

function searchicd(req,res)
{
	admin.searchicd(req.query,function(data){
		res.send(data);
	})
}

function getsubstance(req,res)
{
	admin.getsubstance(function(data){
		res.send(data);
	})
}

function addconsultant(req,res)
{
	admin.addconsultant(req.body,function(data){
		res.send(data);
	})
}

function addphysician(req,res)
{
	admin.addphysician(req.body,function(data){
		res.send(data);
	})
}

function addspeciality(req,res)
{
	admin.addspeciality(req.body,function(data){
		res.send(data);
	})
}

function addlocation(req,res)
{
	admin.addlocation(req.body,function(data){
		res.send(data);
	})
}

function addmeds(req,res)
{
	admin.addmeds(req.body,function(data){
		res.send(data);
	})
}

function addsubstance(req,res)
{
	admin.addsubstance(req.body,function(data){
		res.send(data);
	})
}

function addoption(req,res)
{
	admin.addoption(req.params.type,req.body,function(data){
		res.send(data);
	})
}

function addsocial(req,res)
{
	admin.addsocial(req.params.type,req.body,function(data){
		res.send(data)
	})
}

function deletedata(req,res)
{
	admin.deletedata(req.params.type,req.body,function(data){
		res.send(data);
	})
}

function consultfavourite(req,res)
{
	admin.consultfavourite(req.params.providertype,req.body.id,function(data){
		res.send(data);
	})
}

function addassociateddiagnosis(req,res)
{
	admin.addassociateddiagnosis(req.body,function(data){
		res.send(data);
	})
}

function getassociateddiagnosis(req,res)
{
	admin.getassociateddiagnosis(req.params.id,function(data){
		res.send(data);
	})
}

function searchassociateddiagnosis(req,res)
{
	admin.searchassociateddiagnosis(req.query,function(data){
		res.send(data);
	})
}

function searchallassociateddiagnosis(req,res)
{
	admin.searchallassociateddiagnosis(function(data){
		res.send(data);
	})
}

function deleteassociateddiagnosis(req,res)
{
	admin.deleteassociateddiagnosis(req.params.id,function(data){
		res.send(data);
	})
}

function saveassociatedgroup(req,res)
{
	admin.saveassociatedgroup(req.body,function(data){
		res.send(data);
	})
}

function deleteassociatedgroup(req,res)
{
	admin.deleteassociatedgroup(req.params.id,function(data){
		res.send(data);
	})
}

function getmeds(req,res)
{
	admin.getmeds(req.query,function(data){
		res.send(data);
	})
}

function getmedsclass(req,res)
{
	admin.getmedsclass(function(data){
		res.send(data);
	})
}


function getmedsfromsubclass(req,res)
{
	admin.getmedsfromsubclass(req.params.id,function(data){
		res.send(data);
	})
}

function savetemplate(req,res)
{
	admin.savetemplate(req.body,function(data){
		res.send(data);
	})
}

function gettemplate(req,res)
{
	admin.gettemplate(function(data){
		res.send(data);
	})
}	

function getphysician(req,res)
{
	admin.getphysician(req.params.id,function(data){
		res.send(data);
	})
}

function searchphysician(req,res)
{
	admin.searchphysician(req.query.search,function(data){
		res.send(data);
	})
}

function addmedsclass(req,res)
{
	admin.addmedsclass(req.body,function(data){
		res.send(data);
	})
}

function getphysicianinfo(req,res)
{
	admin.getphysicianinfo(req.params.id,function(data){
		res.send(data);
	})
}

function saveaddress(req,res)
{
	admin.saveaddress(req.body,function(data){
		res.send(data);
	})
}

function deleteaddress(req,res)
{
	admin.deleteaddress(req.query.id,function(data){
		res.send(data);
	})
}

function saveemployeer(req,res)
{
	admin.saveemployeer(req.body,function(data){
		res.send(data);
	})
}

function deleteemployeer(req,res)
{
	admin.deleteemployeer(req.params.id,function(data){
		res.send(data);
	})
}

function getmedsalpha(req,res)
{
	admin.getmedsalpha(req.params.alpha,function(data){
		res.send(data);
	})
}

function adddefaultreaction(req,res)
{
	admin.adddefaultreaction(req.params.type,req.body,function(data){
		res.send(data);
	})
}

function deletedefaultreaction(req,res)
{
	admin.deletedefaultreaction(req.params.type,req.query.id,function(data){
		res.send(data);
	})
}

function updatediagnosisorder(req,res)
{
	admin.updatediagnosisorder(req.body,function(data){
		res.send(data);
	})
}

module.exports = {
	searchuser:searchuser,
	addpatient:patientadd,
	searchlocation:searchlocation,
	searchfacilities:searchfacilities,
	searchalergy:searchalergy,
	searchicd:searchicd,
	getsubstance:getsubstance,
	addconsultant:addconsultant,
	addphysician:addphysician,
	addspeciality:addspeciality,
	addlocation:addlocation,
	addmeds:addmeds,
	addsubstance:addsubstance,
	addoption:addoption,
	addsocial:addsocial,
	deletedata:deletedata,
	consultfavourite:consultfavourite,
	addassociateddiagnosis:addassociateddiagnosis,
	searchassociateddiagnosis:searchassociateddiagnosis,
	getassociateddiagnosis:getassociateddiagnosis,
	searchallassociateddiagnosis:searchallassociateddiagnosis,
	deleteassociateddiagnosis:deleteassociateddiagnosis,
	saveassociatedgroup:saveassociatedgroup,
	deleteassociatedgroup:deleteassociatedgroup,
	getmeds:getmeds,
	getmedsclass:getmedsclass,
	getmedsfromsubclass:getmedsfromsubclass,
	addmedsclass:addmedsclass,
	savetemplate:savetemplate,
	gettemplate:gettemplate,
	getphysician:getphysician,
	searchphysician:searchphysician,
	getpatientphysician:getpatientphysician,
	getphysicianinfo:getphysicianinfo,
	saveaddress:saveaddress,
	deleteaddress:deleteaddress,
	saveemployeer:saveemployeer,
	deleteemployeer:deleteemployeer,
	getmedsalpha:getmedsalpha,
	adddefaultreaction:adddefaultreaction,
	deletedefaultreaction:deletedefaultreaction,
	updatediagnosisorder:updatediagnosisorder
}