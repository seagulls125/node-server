var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function getccproblem(id,callback)
{
	if(id.length > 0)
	{
		conn.query('Select * from macros where Id in (' + id.join(',') + ')',async(err,data) => {
			if(!err)
			{
				var array = {};
				for(item in data)
				{
					if(data[item].ICD10Items)
					{
						array[data[item].SubsectionId] = await getproblem(data[item].ICD10Items);
					}
				}

				callback(array);
			}
			else
			{
				console.log(err);
				callback({});
			}
		})	
	}
}

async function gethpiproblems(idarray,callback)
{
	var data = {};
	if(idarray.length > 0)
	{		
		for(item in idarray)
		{
			data[idarray[item]] = await gethpimacro(idarray[item]);
		}
	}

	callback(data);
}

function gethpimacro(code)
{
	return new Promise((resolve,reject)=>{
		conn.query('Select * from macros where SectionId = 2 and HPIChronicProblems = "' + code + '" or HPIChronicProblems like "%,' + code + '" or HPIChronicProblems like "' + code + ',%" or HPIChronicProblems like "%,' + code + ',%"',function(err,result){
			if(!err)
			{
				resolve(result.length > 0?result[0]:{});
			}
			else
			{
				reject(err);
			}
		})
	})
}

function getproblem(code)
{
	return new Promise((resolve,reject)=>{
		codearray = code.split(',');
		for(var item in codearray)
		{
			codearray[item] = "'" + codearray[item] + "'";
		}

		conn.query('Select * from icd10 where Code in (' + codearray.join(',') + ')',function(err,data){
			if(!err)
			{
				resolve(data);
			}
			else
			{
				reject(err);
			}
		})
	})
}

function getproblems(code,callback)
{
	codearray = code.split(',');

	for(item in codearray)
	{
		codearray[item] = "'" + codearray[item] + "'";
	}
	conn.query('Select * from icd10 where Code in (' + codearray.join(',') + ')',function(err,result){
		if(!err)
		{
			callback(result);
		}
		else
		{
			callback([]);
		}
	})
}


function getsymptoms(code,callback)
{
	codearray = code.split(',');

	for(item in codearray)
	{
		codearray[item] = "'" + codearray[item] + "'";
	}
	conn.query('Select * from cpt where Code in (' + codearray.join(',') + ')',function(err,result){
		if(!err)
		{
			callback(result);
		}
		else
		{
			callback([]);
		}
	})
}

function getallergy(content,callback)
{
	let contentarray = content.split(',');

	for(item in contentarray)
	{
		contentarray[item] = "'" + contentarray[item] + "'";
	}

	conn.query('Select * from allergy_list where allergyId in (' + contentarray.join(',') + ')',function(err,data){
		if(!err)
		{
			callback(data);
		}
		else
		{
			console.log(err);
		}
	})
}

function add(data,callback)
{
	var field = [];
	//var value = [];
	var stringfield = ['Name','Content',"ICD10Items","HPIChronicProblems"];
	//var updatevalue = [];

	var value = "";
	var updatevalue = "";
	for(item in data)
	{
		if(item == 'Id')
		{
			continue;
		}

		if(stringfield.indexOf(item) > -1)
		{
			if(data[item])
			{
				data[item] = data[item].replace(/\'/g,"\\'");
			}
			data[item] = "'" + data[item] + "'";
		}

		field.push(item);
		value += data[item] + ",";
		updatevalue += item + "=" + data[item] + ",";
		//value.push(data[item]);
		//updatevalue.push(item + "=" + data[item]);
	}

	updatevalue = updatevalue.substring(0,updatevalue.length - 1);
	value = value.substring(0,value.length - 1);

	if(data.Id)
	{
		conn.query("Update macros set " + updatevalue + " where Id = " + data.Id,function(err,result){
			if(err)
			{
				console.log(err);
			}
			else
			{
				callback({success:true})
			}
		})
	}
	else
	{
		conn.query('insert into macros(' + field.join(',') + ') Values(' + value + ')',function(err,result){
			if(err)
			{
				console.log(err);
			}
			else
			{
				conn.query('Select Max(Id) as id from macros',function(err_result,doc){
					if(doc.length > 0)
					{
						callback({success:true,id:doc[0].id})
					}
				})
			}
		})
	}
}

function deletemacro(idarray,callback)
{
	conn.query('Delete from macros where Id in (' + idarray.join(',') + ')',function(err,result){
		if(err)
		{
			callback({success:false});
		}
		else
		{
			callback({success:true});
		}
	})
}

async function getdataplan(callback)
{
	var diets = await getdiet();
	var misc = await getmisc();
	var other = await getother();
	callback({diets:diets,misc:misc,other:other});
}

function getdiet()
{
	return new Promise((resolve,reject)=>{
		conn.query('Select * from diets',function(err,data){
			if(!err)
			{
				var array = [];
				for(item in data)
				{
					array.push(data[item].Name);
				}

				resolve(array);
			}
		})
	})
}


function getmisc()
{
	return new Promise((resolve,reject)=>{
		conn.query('Select * from misc',function(err,data){
			if(!err)
			{
				var array = [];
				for(item in data)
				{
					array.push(data[item].name);
				}

				resolve(array);
			}
		})
	})
}

function getother()
{
	return new Promise((resolve,reject)=>{
		conn.query('Select * from planother',function(err,data){
			if(!err)
			{
				var array = [];
				for(item in data)
				{
					array.push(data[item].name);
				}

				resolve(array);
			}
		})
	})
}

function search(data,callback)
{
	let query = "";
	if(data.type == 'labs')
	{
		query = 'Select * from cpt where IsLab = true and (CommonName like "%' + data.value + '%" or BillDesc like "%' + data.value + '%")';
	}
	else if(data.type == 'imaging')
	{
		query = 'Select * from cpt where IsImaging = true and (CommonName like "%' + data.value + '%" or BillDesc like "%' + data.value + '%")';	
	}
	else if(data.type == 'meds')
	{
		query = 'Select med_list.name as name,med_dosage_list.optionText as dosage from med_dosage_list,med_list where med_list.name like "%' + data.value + '%" and med_dosage_list.medId = med_list.itemId';
	}

	conn.query(query +" limit 50",function(err,result){
		if(!err)
		{
			callback(result);
		}
		else
		{
			console.log(err);
		}	
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