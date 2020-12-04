var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function savenotes(data,callback)
{
	console.log(data);
	conn.query('Select * from charts where PatientId = ' + data.patientid + " and CreatedBy = 1 ",async(err,doc)=>{
		if(!err)
		{
			var chartid;
			if(doc.length == 0)
			{
				var chartid = await create_chart(data.patientid,1);
			}
			else
			{
				await update_modified(doc[0].Id);
				chartid = doc[0].Id;
			}

			if(data.noteid)
			{
				sql = 'Update notes set NoteTypeId = ' + data.NoteType + ",SaveType = " + data.SaveType + ",LocationId = " + data.LocationId + ",NoteDate = '" + data.NoteDate + "',Name = '" + data.Name + "',Modified = NOW() where Id = " + data.noteid;  
			}
			else
			{
				sql = 'Insert into notes(ChartId,NoteTypeId,SaveType,LocationId,NoteDate,Name,CreatedBy,ModifiedBy,Created,Modified) Values(' + chartid + ',' + data.NoteType + ',' + data.SaveType + ',' + data.LocationId + ',"' + data.NoteDate + '","' + data.Name + '",1,1,NOW(),NOW())';
			}

			conn.query(sql,function(err,doc){
				if(!err)
				{
					conn.query('Select max(Id) as id from notes',function(err,entity){
						if(!err)
						{
							var id = entity[0].id;

							if(data.noteid)
							{
								id = data.noteid;
							}

							conn.query('Delete from noteentries where NoteId = ' + id,function(err,doc){
								if(!err)
								{	
									var field = ["NoteId","SectionId","data"];
									var fieldvalue = [];
									var updatevalue = [];

									for(item in data.data)
									{
										if(data.data[item].SectionId)
										{
											var field_entity = [id,data.data[item].SectionId];	
											field_entity.push("'" + escape(JSON.stringify(data.data[item].data)) + "'");
											fieldvalue.push('(' + field_entity.join(',') + ')');	
										}
										
									}

									
									conn.query('Insert into noteentries(' + field.join(',') + ') Values' + fieldvalue.join(','),function(err,doc){
										if(!err)
										{
											callback({success:true,noteid:id});
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
	})
}

function getnotes(chartid,date)
{
	return new Promise((resolve,reject)=>{
		conn.query('Select * from notes where ChartId = ' + chartid + " and NoteDate = '" + date + '"',function(err,doc){
			console.log(err);
			if(doc.length > 0)
			{
				resolve(doc[0]);
			}
			else
			{
				resolve({});
			}
		})	
	})
}
function create_chart(patientid,created)
{
	return new Promise((resolve,reject)=>{
		conn.query('Insert into charts(PatientId,CreatedBy,Created,Modified) values(' + patientid + ',' + created + ',NOW(),NOW())',function(err,doc){
			if(!err)
			{
				conn.query('Select max(Id) as id from charts',function(err,doc){
					if(!err)
					{
						resolve(doc[0].id);
					}
					else
					{
						reject(err);
					}
				})
			}
			else
			{
				reject(err);
			}
		})
	})
}

function update_modified(chartid)
{
	return new Promise((resolve,reject)=>{
		conn.query('Update charts set Modified = NOW() where Id = ' + chartid,function(err){
			if(err)
			{
				reject(err);
			}
			else{
				resolve({success:true});
			}
		})
	})
}

function getnote(id,callback)
{
	conn.query('Select * from charts where PatientId = ' + id,function(err,doc){
		if(!err && doc.length > 0)
		{
			conn.query('Select * from notes where ChartId = ' + doc[0].Id,function(err,doc){
				callback(doc);
			})
		}
		else
		{
			callback([]);
		}
	})
}

function getnotefromid(id,callback)
{
	conn.query('Select * from notes where Id = ' + id,function(err,data){
		if(!err)
		{
			var data_element = [];
			if(data.length > 0)
			{
				noteid = data[0].Id;
				
				conn.query('Select * from noteentries where NoteId = ' + noteid,function(err,sectiondata){

					for(item in sectiondata)
					{
						data_element.push({SectionId:sectiondata[item].SectionId,data:JSON.parse(unescape(sectiondata[item].data))});
					}
					data[0].data = data_element;
					callback(data[0]);
				})
			}

			
		}
	})
}

module.exports = {
	savenote:savenotes,
	get:getnote,
	getnotes:getnotefromid
}