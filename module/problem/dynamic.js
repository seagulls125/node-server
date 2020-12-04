var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function save(data,callback)
{
	var field = [];
	var value = [];
	var update = [];
	for(var item in data)
	{
		if(item == 'id')
		{
			continue;
		}

		if(Array.isArray(data[item]))
		{
			data[item] = data[item].join(',');
		}

		update.push(item + '="' + data[item] + '"');
		field.push(item);
		value.push('"' + data[item] + '"');
	}

	if(data.id)
	{
		conn.query('update dynamic_element set ' + update.join(',') + ' where id = ' + data.id,function(err,result){
			if(!err)
			{
				callback({id:data.id});
			}
		})
	}
	else
	{
		conn.query('insert into dynamic_element(' + field.join(',') + ') Values(' + value.join(',') + ')',async(err,result)=>{
			if(!err)
			{
				var result = await getsavedid();
				callback(result);
			}
			else(err)
			{
				console.log(err);
			}
		})
	}
}

function get(id,callback)
{
	conn.query('Select * from dynamic_element where id = ' + id,function(err,result){
		if(!err && result.length > 0)
		{
			callback(result[0]);
		}
		else
		{
			callback({});
		}
	})
}

function getsavedid()
{
	return new Promise((resolve,reject)=>{
		conn.query('Select max(id) as id from dynamic_element',function(err,result){
			if(!err && result.length > 0)
			{
				resolve(result[0]);
			}
			else
			{
				reject(err);
			}
		})
	})
}

function search(data,callback)
{
	var query = 'select * from dynamic_element where ' + data.searchfield + " like '%" + data.query + "%' order by caption";
	var countquery = 'select count(*) as count from dynamic_element where ' + data.searchfield + " like '%" + data.query + "%'";

	var page = 1;
	if(data.page)
	{
		page = data.page;
	}

	var skip = (page - 1) * 20;

	query += ' limit ' + skip + ",20";

	conn.query(countquery,function(err,row){
		let senddata = {};
		if(!err)
		{
			senddata.count = row[0].count;
			conn.query(query,function(err,data){
				if(!err)
				{
					senddata.data = data;
					callback(senddata);
				}
				else
				{
					console.log(err);
				}
			})
		}
		else
		{
			console.log(err);
		}


	})
	
}

module.exports = {
	save:save,
	get:get,
	search:search
}