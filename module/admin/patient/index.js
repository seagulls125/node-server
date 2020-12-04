var mysql = require('mysql');
var dataconfig = require('../../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function addpatient(data,callback)
{
	var numberfield = ['RaceId','location'];

	var field = [];
	var value = [];
	var updates = [];
	for(var item in data)
	{
		if(item == 'Id')
		{
			continue;
		}

		var fieldvalue = data[item];
		field.push(item);
		if(numberfield.indexOf(item) == -1)
		{
			fieldvalue = "'" + data[item] + "'";
		}

		value.push(fieldvalue);
		updates.push(item + "=" + fieldvalue);
	}

	if(data.Id)
	{
		conn.query('Update patients set ' + updates.join(',') + ' where Id = ' + data.Id,function(err){
			if(err)
			{
				callback({success:false})
			}
			else
			{
				callback({success:true})
			}
		})
	}
	else
	{
		conn.query('Insert into patients(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
			if(err)
			{
				callback({success:false})
			}
			else
			{
				callback({success:true})
			}
		})
	}
 }


module.exports = {
	add:addpatient
}