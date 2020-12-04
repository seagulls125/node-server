var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function get(id,callback)
{
	console.log(id);
	conn.query('Select * from patient_familyhistory where patientid = ' + id,function(err,data){
		if(!err)
		{
			callback(data);
		}
		else
		{
			console.log(err);
			callback({
				success:false
			})
		}
	})
}

function deletefamily(id,callback)
{
	conn.query('Delete from patient_familyhistory where id = ' + id,function(err){
		if(!err)
		{
			callback({success:true})
		}
		else
		{
			callback({success:false})
		}
	})
}

function save(data,callback)
{
	var field = [];
	var updatefield = [];
	var savedata = [];

	for(item in data)
	{
		if(item == 'id')
		{
			continue;	
		}

		var value = data[item];
		
		if(item != 'patientid' && item != 'age')
		{
			value = '"' + data[item] + '"';
		}

		field.push(item);
		savedata.push(value);

		updatefield.push(item + '=' + value);
	}

	if(data.id)
	{
		conn.query('update patient_familyhistory set ' + updatefield.join(',') + ' where id = ' + data.id,function(err,doc){
			callback(data);
		})
	}
	else
	{
		conn.query('insert into patient_familyhistory(' + field.join(',') + ') Values(' + savedata.join(',') + ')',function(err){
			if(!err)
			{
				conn.query('SELECT * FROM patient_familyhistory order by id desc limit 1',function(err,doc){
					if(!err)
					{
						callback(doc[0]);
					}
					else
					{
						callback({
							success:false
						})
					}
				})
			}
			else
			{
				console.log(err);
				callback({
					success:false
				})
			}
		})
	}
}

function getrelation(callback)
{
	conn.query('Select * from relation_list',function(err,data){
		if(!err)
		{
			callback(data);
		}
		else
		{
			callback([]);
		}
	})
}

module.exports = {
	get:get,
	deletefamily:deletefamily,
	save:save,
	getrelation:getrelation
}