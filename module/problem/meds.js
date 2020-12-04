var mysql = require('mysql');
var dataconfig = require('../../config/database.json');
var md5 = require('md5');
var conn = mysql.createConnection(dataconfig);

function getinfo(data,callback)
{
	var query = [];
	console.log(data.favourite);
	if(data.favourite && data.favourite != 'false')
	{
		query.push('isFav = true');
	}
	
	if(data.common && data.common != 'false')
	{
		query.push('isCommon = true');
	}

	if(data.query)
	{
		searchfield = 'name';

		if(data.searchfield)
		{
			searchfield = data.searchfield;
		}
		query.push(searchfield + ' like "%' + data.query + '%"');
	}

	var skip = 0;

	if(data.page)
	{
		page = data.page;
		skip = (page - 1) * 10;
	}

	var where = "";
	if(query.length > 0)
	{	
		where = ' where ' + query.join(' and ');
	}

	if(data.orderfield)
	{
		where += ' order by ' + data.orderfield + ' ' + data.orderaction;
	}

	console.log(where);
	conn.query('Select * from med_list ' + where,function(err,doc){
		if(!err)
		{
			count = doc.length;
			page = Math.floor(count / 10);

			if(count % 10 != 0)
			{
				page ++;
			}
			currentpage = data.page?data.page:1;
			var meds = doc.slice(skip,skip + 10);

			callback({total:count,page:page,currentpage:currentpage,data:meds});
		}
		else
		{
			callback(err);
		}
	})
 }

 async function getdetail(id,callback)
 {
 	var data = {};
 	data.diag = await getdiag(id);
 	data.package = await getpackage(id);
 	data.dosage = await getdosage(id);
 	data.sig = await getsig(id);

 	callback(data);
 }

 function getdiag(id)
 {
 	return new Promise((resolve,reject)=>{
 		conn.query('Select * from med_diag_list where medId = "' + id + '"',function(err,result){
 			if(!err)
 			{
 				resolve(result);
 			}
 			else
 			{
 				reject(err);
 			}
 		})
 	})
 }

 function getdosage(id)
 {
 	return new Promise((resolve,reject)=>{
 		conn.query('Select * from med_dosage_list where medId = "' + id + '"',function(err,result){
 			if(!err)
 			{
 				resolve(result);
 			}
 			else
 			{
 				reject(err);
 			}
 		})
 	})
 }

function getsig(id)
 {
 	return new Promise((resolve,reject)=>{
 		conn.query('Select * from med_sig_list where medId = "' + id + '"',function(err,result){
 			if(!err)
 			{
 				resolve(result);
 			}
 			else
 			{
 				reject(err);
 			}
 		})
 	})
 }

 function getpackage(id)
 {
 	return new Promise((resolve,reject)=>{
 		conn.query('Select * from med_package_list where medId = "' + id + '"',function(err,result){
 			if(!err)
 			{
 				resolve(result);
 			}
 			else
 			{
 				reject(err);
 			}
 		})
 	})
 }

 function addindication(type,id,data,callback)
 {
 	var table =  'med_' + type + '_list';
 	
 	conn.query('insert into ' + table + '(medId,optionText) Values("' + id + '","' + data.content + '")',function(err,result){
 		if(!err)
 		{
 			conn.query('Select * from ' + table + ' where medId = "' + id + '"',function(err_med,result){
 				if(!err_med)
 				{
 					callback(result);
 				}
 				else
 				{
 					callback(err);
 				}
 			})
 		}
 		else
 		{
 			callback(err);
 		}
 	})
 }

 function addallergy(data,callback)
 {
 	var field = []; var value = []; var updatevalue = [];
 	var numericfield = ['isFav','useCounter','Id']
 	for(item in data)
 	{
 		if(item == 'allergyId')
 		{
 			continue;
 		}
 		if(numericfield.indexOf(item) == -1)
 		{
 			data[item] = "'" + data[item] + "'";	
 		}
 		
 		field.push(item); 
 		value.push(data[item]);

 		updatevalue.push(item + '=' + data[item]);
 	}

 	console.log(data);
 	if(!data.allergyId)
 	{
 		field.push('allergyId');
 		conn.query('Select max(Id) as allergyId from allergy_list',function(err,row){
 			value.push("'C0000" + (row[0].allergyId + 1) + "'")

 			conn.query('insert into allergy_list(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
 				if(!err)
 				{
 					callback({success:true})
 				}
 				else
 				{
 					console.log(err);
 				}
 			})
 		})
 		
 	}
 	else
 	{
 		conn.query('update allergy_list set ' + updatevalue.join(',') + " where allergyId = '" + data.allergyId + "'",function(err){
 			if(!err)
 			{
 				callback({success:true});
 			}
 			else
 			{
 				console.log(err);
 			}
 		})
 	}
 }

 module.exports = {
 	getinfo:getinfo,
 	getdetail:getdetail,
 	addindication:addindication,
 	addallergy:addallergy
 }