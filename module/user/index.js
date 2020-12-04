var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function login(login,password,callback)
{
	conn.query('Select * from users where (PrimaryEmail = "' + login + '" or Username = "' + login + '") and password = MD5("' + password + '")',function(err,row){
		if(!err)
		{
			if(row.length > 0)
			{
				callback({success:true});
			}
			else
			{
				callback({success:false})
			}
		}
		else
		{
			console.log(err);
		}
	})
}

function speciality(callback)
{
	conn.query('Select * from specialties',function(err,row){
		if(!err)
		{
			callback(row);
		}
		else
		{
			console.log(err);
		}
	})
}

function add(data,callback)
{
	var field = []; var value = [];
	var updatedata = [];
	var numberfield = ['IsActive','CreatedBy','ModifiedBy'];

	for(var item in data)
	{
		if(item == 'Id' || item == 'Created' || item == 'Modified')
		{
			continue;
		}

		if(item == 'Password')
		{
			data[item] = 'MD5("' + data[item] + '")';
		}
		else if(numberfield.indexOf(item) == -1)
		{
			data[item] = '"' + data[item] + '"';
		}

		field.push(item);
		value.push(data[item]);

		updatedata.push(item + '=' + data[item]);
	}

	field.push('Created');
	value.push('Now()');
	field.push('Modified');
	value.push('NOW()');

	updatedata.push('Modified = NOW()');

	if(!data.Id)
	{
		conn.query('Select * from users where Username = ' + data.Username,function(err,row){
			if(row.length > 0)
			{
				callback({success:false});
			}
			else
			{
				conn.query('insert into users(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err,row){
					if(!err)
					{
						callback({success:true});
					}
				})
			}
		})
	}
	else
	{
		conn.query('Select * from users where Username = ' + data.Username + ' and Id != ' + data.Id,function(err,row){
			if(row.length > 0)
			{
				callback({success:false});
			}
			else
			{
				conn.query('Update users set ' + updatedata.join(',') + ' where Id = ' + data.Id,function(err,row){
					if(!err)
					{
						callback({success:true});
					}
				})
			}
		})
	}
	
}


function deleteuser(id,callback)
{
	conn.query('Delete from users where Id = ' + id,function(err){
		callback({success:true})
	})
}

function setphysician(id,data,callback)
{
	conn.query('Delete from patientphysicalsparts where PatientId = ' + id,function(err){
		if(!err)
		{
			var value = [];
			for(item in data.id)
			{
				value.push("(" + data.id[item] + "," + id + ")");
			}	

			if(value.length > 0)
			{
				conn.query('insert into patientphysicalsparts(PatientPhysicalId,PatientId) Values' + value.join(','),function(err){
					if(err)
					{
						console.log(err);
					}
					else
					{
						callback({success:true});
					}
					
				})	
			}
			
		}
		else
		{
			console.log(err);
		}
	})
}
module.exports = {
	login:login,
	speciality:speciality,
	add:add,
	deleteuser:deleteuser,
	setphysician:setphysician
}