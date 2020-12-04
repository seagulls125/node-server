var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function get(value,callback)
{
	if(value == undefined || !value)
	{
		value = "";
	}
   conn.query('Select * from cpt where Code like "' + value + '%" or BillDesc like "%' + value + '" limit 100',function(err,doc){
	   	if(!err)
	   	{
	   		doc.sort(compare);
	   		callback(doc);
	   	}
   })
}

function common(callback)
{
	conn.query('Select * from cpt where IsCommon = true order by CommonName',function(err,data){
		if(!err)
		{
			callback(data);
		}
	})
}

function favourite(callback)
{
	conn.query('Select * from cpt where IsFavorite = true',function(err,data){
		if(!err)
		{
			callback(data);
		}
	})
}

function compare(a,b)
{
	name_a = a.CommonName?a.CommonName:a.BillDesc;
	name_b = b.CommonName?b.CommonName:b.BillDesc;

	if(name_a < name_b)
	{
		return -1;
	}
	else if(name_a > name_b)
	{
		return 1;
	}

	return 0;
}

module.exports = {
    get:get,
    common:common,
    favourite:favourite
}