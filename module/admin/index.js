var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);
var MD5 = require('md5');

function search(type,data,callback)
{

    var tablename = '';

    switch(type)
    {
        case 'patient':
            tablename = 'patients';
            break;
        case 'user':
            tablename = 'users';
            break;
        case 'physicians':
            tablename = 'physicians';
            break;
        case 'consultants':
            tablename = 'provider_list';
            break;
    }
    var countquery = 'Select Count(*) as count from ' + tablename + ' where ' + data.searchfield + " like '%" + data.query + "%'";

    

    var field = '*';
    if(tablename == 'users')
    {
        field = 'Id,FirstName,LastName,PrimaryEmail,Username,IsActive,Created,Modified';
    }
    var query = 'Select ' + field + '  from ' + tablename + ' where ' + data.searchfield + " like '%" + data.query + "%'";
    
    if(data.FirstName && tablename != 'physicians')
    {
        if(tablename != 'provider_list')
        {
            query += ' and FirstName like "%' + data.FirstName + '%"';
            countquery += ' and FirstName like "%' + data.FirstName + '%"';    
        }
        else
        {
            query += ' and fName like "%' + data.FirstName + '%"';
            countquery += ' and fName like "%' + data.FirstName + '%"';    
        }
    }

    if(data.LastName && tablename != "physicians")
    {
       if(tablename != 'provider_list')
        {
            query += ' and LastName like "%' + data.LastName + '%"';
            countquery += ' and LastName like "%' + data.LastName + '%"';    
        }
        else
        {
            query += ' and lName like "%' + data.LastName + '%"';
            countquery += ' and lName like "%' + data.LastName + '%"';    
        }
    }

    if(data.activate)
    {
        if(data.activate == 'active')
        {
            countquery += ' and IsActive = true';
            query += ' and IsActive = true';
        }
        else
        {
            countquery += ' and IsActive = false';
            query += ' and IsActive = false';
        }
    }

    if(tablename == 'physicians' && data.providertype && data.providertype != "physicians")
    {
        countquery += " and providertype = '" + data.providertype + "'";
        query += " and providertype = '" + data.providertype + "'";
    }

    if(tablename == 'physicians' && data.name)
    {
        countquery += " and Contact like '%" + data.name + "%'";
        query += " and Contact like '%" + data.name + "%'";
    }

    if(data.favourite)
    {
        query += " and IsFav = " + data.favourite;
        countquery += " and IsFav = " + data.favourite;
    }

    if(data.speciality && data.providertype == "Physicians")
    {
        query += " and speciality = " + data.speciality; 
        countquery += " and speciality = " + data.speciality;       
    }

    if(tablename == 'physicians')
    {
        orderarray = ['Company','Address','City','State','Zip','County','Contact'];
        if(orderarray.indexOf(data.orderfield) > -1)
        {
            query += " order by " + data.orderfield + " " + data.orderaction;
        }
    }
    else
    {
        query += " order by " + data.orderfield + " " + data.orderaction;    
    }


    conn.query(countquery,function(err,row){
        if(!err)
        {
            var senddata = {};
            var count = row[0].count;
            senddata.count = count;
            if(data.page)
            {
                var skip = (data.page - 1) * 20;
                senddata.page = data.page;
                senddata.totalpage = Math.ceil(count / 20);

                query += ' limit ' + skip + ',20';
            }
            

            conn.query(query,function(err,row){
                if(!err)
                {
                    senddata.data = row;    
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

function searchlocation(data,callback)
{
    var skip = (data.page - 1) * 20;
    query = 'Select * from locations where ' + data.searchfield + ' like "%' + data.query + '%"'; 
    conn.query(query,function(err,row){
        if(!err)
        {
            var count = row.length;
            senddata = {};
            senddata.page = data.page;
            senddata.totalpage = Math.ceil(count / 20);
            conn.query(query + " order by " + data.orderfield + " " + data.orderaction + " limit " + skip + ",20",function(err,row){
                if(!err)
                {
                    senddata.data = row;
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

function searchfacilities(callback)
{
    conn.query('Select * from location_type',function(err,row){
        callback(row);
    })
}

function searchalergy(data,callback)
{
    var skip = (data.page - 1) * 20;
    query = "select * from allergy_list where " + data.searchfield + " like '%" + data.query + "%'";

    if(data.type) 
    {
        query += " and defaultType = '" + data.type + "'";
    }

    if(data.favourite)
    {
        query += " and isFav = " + data.favourite;
    }

    conn.query(query,function(err,row){
        if(!err)
        {
            var count = row.length;
            senddata = {};
            senddata.page = data.page;
            senddata.totalpage = Math.ceil(count / 20);
            conn.query(query + " order by " + data.orderfield + " " + data.orderaction + " limit " + skip + ",20",function(err,row){
                if(!err)
                {
                    senddata.data = row;
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


function searchicd(data,callback)
{
    var skip = (data.page - 1) * 20;

    var table = 'icd10';
    var column = 'ShortDesc';
    if(data.cpt)
    {
        table = 'cpt';
        column = 'BillDesc';
    }

    query = "select * from " + table + " where Code like '" + data.query + "%' or " + column + " like '%" + data.query + "%'";

    if(data.favourite && data.favourite != 'false')
    {
        query += ' and IsFavorite = true';
    }

    if(data.common && data.common != 'false')
    {
        query += ' and IsCommon = true';
    }

    if(data.laboratory && data.laboratory != 'false')
    {
        query += ' and IsLab = true';
    }

    if(data.image && data.image != 'false')
    {
        query += ' and IsImaging = true';
    }

    conn.query(query,function(err,row){
        if(!err)
        {
            var count = row.length;
            senddata = {};
            senddata.page = data.page;
            senddata.totalpage = Math.ceil(count / 20);
            conn.query(query + " order by " + data.orderfield + " " + data.orderaction + " limit " + skip + ",20",function(err,row){
                if(!err)
                {
                    senddata.data = row;
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

function getsubstance(callback)
{
    conn.query('Select * from substances',async(err,row)=>{
        var ids = [];
        for(let item in row)
        {
            ids.push(row[item].Id);
        }

        var type = await getsubstancetype();
        var units = await getsubstanceunits();
        var status = await getsubstancestatus();

        for(var item in type)
        {
            var index = ids.indexOf(type[item].SubstanceId);
            if(index > -1)
            {
                if(!row[index].type)
                {
                    row[index].type = [];
                }
                row[index].type.push(type[item]);
            }
        }

        for(var item in units)
        {
            var index = ids.indexOf(units[item].SubstanceId);
            if(index > -1)
            {
                if(!row[index].units)
                {
                    row[index].units = [];
                }
                row[index].units.push(units[item]);
            }
        }

        for(var item in status)
        {
            var index = ids.indexOf(status[item].SubstanceId);
            if(index > -1)
            {
                if(!row[index].status)
                {
                    row[index].status = [];
                }
                row[index].status.push(status[item]);
            }
        }

        callback(row);
    })
}

function getsubstancetype()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from substancetypes',function(err,row){
            if(!err)
            {
                resolve(row);
            }
            else
            {
                reject(err);
            }
        })    
    })
}

function getsubstanceunits()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from substanceunits',function(err,row){
            if(!err)
            {
                resolve(row);
            }
            else
            {
                reject(err);
            }
        })
    })
}

function getsubstancestatus()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from substanceusestatuses',function(err,row){
            if(!err)
            {
                resolve(row);
            }
            else
            {
                reject(err);
            }
        })
    })
}

function addconsultant(data,callback)
{
   var field = []; var value = []; var update = [];

   for(var item in data)
   {
        field.push(item);
        if(item == 'Id')
        {
            continue;
        }

        if(item != 'speciality')
        {
            data[item] = "'" + data[item] + "'";
        }

        value.push(data[item]);
        update.push(item + '=' + data[item]);
   }

   if(data.Id)
   {
        conn.query('Update provider_list set ' + update.join(',') + ' where Id = ' + data.Id,function(err,row){
            if(!err)
            {
                callback({success:true})
            }
        }) 
   }
   else
   {
        conn.query('insert into provider_list(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err,row){
            if(!err)
            {
                callback({success:true});
            }
        })
   }
   
}

function addphysiciandata(data,callback)
{
    return new Promise((resolve,reject)=>{
        var field = []; var value = []; var updatevalue = [];
        var numericfield = ['speciality','IsFav'];
        for(item in data)
        {
            if(item == 'Id')
            {
                continue;
            }

            field.push(item);

            if(numericfield.indexOf(item) == -1)
            {
                data[item] = "'" + data[item] + "'";    
            }
            

            value.push(data[item]);

            updatevalue.push(item + "=" + data[item]);
        }

        if(data.Id)
        {
            console.log('Update physicians set ' + updatevalue.join(',') + ' where Id = ' + data.Id);
            conn.query('Update physicians set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
                if(!err)
                {
                    resolve({id:data.Id});
                }
            })
        }
        else
        {
            conn.query('insert into physicians(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
                if(!err)
                {
                    conn.query('Select max(Id) as id from physicians',function(err,rowdata){
                        if(!err)
                        {
                            resolve({id:rowdata[0].id});
                        }
                    })
                }
            })
        }
    })
}
async function addphysician(data,callback)
{
    let ids = [];

    for(item in data)
    {
        var idarray = await addphysiciandata(data[item]);
        ids.push(idarray.id);
    }
    
    callback(ids);
}

function addspeciality(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    for(item in data)
    {
        if(item == 'Id')
        {
            continue;
        }

        field.push(item);

        data[item] = "'" + data[item] + "'";
        value.push(data[item]);

        updatevalue.push(item + "=" + data[item]);
    }

    if(data.Id)
    {
        conn.query('Update specialties set ' + updatevalue.join(',') + ' Where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({success:true})
            }
        })
    }
    else
    {
        conn.query('insert into specialties(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
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

function addlocation(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    for(item in data)
    {
        if(item == 'Id')
        {
            continue;
        }

        field.push(item);

        if(item != 'FacilityTypeId')
        {
            data[item] = "'" + data[item] + "'";
        }
        
        value.push(data[item]);

        updatevalue.push(item + "=" + data[item]);
    }

    if(data.Id)
    {
        conn.query('Update locations set ' + updatevalue.join(',') + ' Where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({success:true})
            }
            else
            {
                console.log(err);
            }
        })
    }
    else
    {
        conn.query('insert into locations(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                callback({success:true});
            }
        })
    }
}

function addindication(table,data,itemId)
{
    return new Promise((resolve,reject)=>{
        conn.query('Delete from ' + table + ' where medId = "' + itemId + '"',function(err){
            if(!err)
            {
                var field = ['medId','optionText','optionOrder'];
                var value = [];

                for(var item in data)
                {
                    if(!data[item].optionText)
                    {
                        continue;
                    }
                    var itemvalue = [];
                    itemvalue.push("'" + itemId + "'");
                    itemvalue.push("'" + data[item].optionText + "'");
                    itemvalue.push(item);

                    value.push('(' + itemvalue.join(',') + ')');
                }

                if(value.length > 0)
                {
                    conn.query('insert into ' + table + '(' + field.join(',') + ') Values' + value.join(','),function(err){
                        console.log(err);
                        if(!err)
                        {
                            resolve({success:true});
                        }
                        else
                        {
                            console.log(err);
                            reject(err);
                        }
                    })    
                }
                else
                {
                    resolve({success:true});
                }
                
            }
            else
            {
                console.log(err);
            }
        })
    })
}

function addmeds(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    var numericfield = ['isFav','IsCommon','classid'];
    for(item in data)
    {
        if(item == 'itemId' || item == 'sig' || item == 'package' || item == 'diag' || item == 'dosage' || item == 'classname')
        {
            continue;
        }

        field.push(item);
        if(numericfield.indexOf(item) == -1)
        {
            data[item] = "'" + data[item] + "'";
        }

        value.push(data[item]);

        updatevalue.push(item + '=' + data[item]);
    }

    conn.query('Select max(Id) as Id from med_list',function(err,row){
        if(!err)
        {
            if(!data.itemId)
            {
                field.push('itemId');
                value.push("'C0000" + (row[0].Id + 1) + "'");
                
                conn.query('insert into med_list(' + field.join(',') + ') Values(' + value.join(',') + ')',async(err)=>{
                    if(!err)
                    {
                        await addindication('med_sig_list',data.sig,"C0000" + (row[0].Id + 1));
                        await addindication('med_package_list',data.package,"C0000" + (row[0].Id + 1));
                        await addindication('med_diag_list',data.diag,"C0000" + (row[0].Id + 1));
                        await addindication('med_dosage_list',data.dosage,"C0000" + (row[0].Id + 1));
                        callback({success:true});
                    }
                    else
                    {
                        console.log(err);
                    }
                })
            }
            else
            {
                conn.query('update  med_list set ' + updatevalue.join(',') + ' where itemId = "' + data.itemId + '"',async(err)=>{
                    if(!err)
                    {
                        if(data.sig)
                        {
                            await addindication('med_sig_list',data.sig,data.itemId);
                            await addindication('med_package_list',data.package,data.itemId);
                            await addindication('med_diag_list',data.diag,data.itemId);
                            await addindication('med_dosage_list',data.dosage,data.itemId);
                        }

                        callback({success:true})
                    }
                    else
                    {
                        console.log(err);
                    }
                })
            }
        }
        else
        {
            console.log(err);
        }
    })


    // var field = []; var value = []; var updatevalue = [];
    // var numericfield = ['IsFav','IsCommon'];
    // for(item in data)
    // {
    //     if(item == 'Id')
    //     {
    //         continue;
    //     }

    //     field.push(item);
    //     if(numericfield.indexOf(item) == -1)
    //     {
    //         data[item] = "'" + data[item] + "'";
    //     }

    //     value.push(data[item]);

    //     updatevalue.push(item + '=' + data[item]);
    // }
    // if(!data.Id)
    // {
    //     conn.query('insert into drugsearchitems(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
    //         if(!err)
    //         {
    //             callback({success:true})
    //         }
    //         else
    //         {
    //             console.log(err);
    //         }
    //     })
    // }
    // else
    // {
    //     conn.query('update  drugsearchitems set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
    //         if(!err)
    //         {
    //             callback({success:true})
    //         }
    //         else
    //         {
    //             console.log(err);
    //         }
    //     })
    // }    

}

function addsubstance(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    var numericfield = ['HasTypes','UsesAge','UsesAmount'];
    for(item in data)
    {
        if(item == 'Id')
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

    if(data.Id)
    {
        conn.query('update substances set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({success:true})
            }
        })
    }
    else
    {
        conn.query('insert into substances(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                callback({success:true})
            }
        })
    }
}

function addoption(type,data,callback)
{
    var table = "";
    if(type == 'types')
    {
        table = 'substancetypes';
    }
    else if(type == 'units')
    {
        table = 'substanceunits';
    }
    else if(type == 'status')
    {
        table = 'substanceusestatuses';
    }

    if(table)
    {
        var field = []; var value = []; var updatevalue = [];
        var numericfield = ['SubstanceId'];
        for(item in data)
        {
            if(item == 'Id')
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

        if(data.Id)
        {
            conn.query('update ' + table + ' set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
                if(!err)
                {
                    callback({success:true})
                }
            })
        }
        else
        {
            conn.query('insert into ' + table + '(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
                if(!err)
                {
                    callback({success:true})
                }
            })
        }
    }

}

function addsocial(type,data,callback)
{
    var table = "";
    if(type == 'Option')
    {
        table = 'socialhistorysectionoptions';
    }
    else if(type == 'Section')
    {
        table = 'socialhistorysections';
    }
    
    if(table)
    {
        var field = []; var value = []; var updatevalue = [];
        var numericfield = ['SocialhistorySectionId'];
        for(item in data)
        {
            if(item == 'Id')
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

        if(data.Id)
        {
            conn.query('update ' + table + ' set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
                if(!err)
                {
                    callback({success:true})
                }
            })
        }
        else
        {
            conn.query('insert into ' + table + '(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
                if(!err)
                {
                    callback({success:true})
                }
            })
        }
    }
}

function deletedata(type,data,callback)
{
    var table = ""; var id = "";
    var dataid = data.Id;
    switch(type)
    {
        case 'consultants':
            table = "provider_list";id="Id";break;
        case 'physicians':
            table = "physicians";id="id";break;
        case 'specialities':
            table = "specialties";id="Id";break;
        case 'locations':
            table = "locations";id="Id";break;
        case 'location_type':
            table = "location_type";id="locationTypeId";break;
        case 'med_list':
            table = 'med_list'; id= "Id"; break;
        case 'allergy':
            table = 'allergy_list'; id="allergyId";dataid = "'" + dataid + "'"; break;
        case 'icd':
            table = 'icd10'; id = 'Id';break;
        case 'cpt':
            table = 'cpt'; id = 'Code';dataid = "'" + dataid + "'"; break;
        case 'races':
            table = 'races'; id  = 'Id';break;
        case 'substances':
            table = 'substances';id='Id';break;
        case 'types':
            table = 'substancetypes';id="Id";break;
        case 'units':
            table = 'substanceunits'; id='Id';break;
        case 'status':
            table = 'substanceusestatuses';id="Id";break;
        case 'socialhistory':
            table = 'socialhistorysections'; id = "Id";break;
        case 'socialhistoryoptions':
            table = 'socialhistorysectionoptions';id='Id';break;
    }

    if(table && id)
    {
        conn.query('Delete from ' + table + ' where ' + id + '=' + dataid,function(err){
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
    else
    {
        callback({success:false});
    }
    
}

function consultfavourite(providertype,id,callback)
{
    var table = providertype == 'physicians'?'physicians':'provider_list';

    conn.query('Update ' + table + " set isFav = !isFav where Id = " + id,function(err){
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

function addassociateddiagnosis(data,callback)
{
    var field = []; var value = [];
    var updatevalue = [];
    for(var item in data)
    {
        if(item == 'Id' || item == 'ShortDesc')
        {
            continue;
        }

        if(item != 'groupId')
        {
            data[item] = "'" + data[item] + "'";
        }
        field.push(item); value.push(data[item]);
        updatevalue.push(item + "=" + data[item]);
    }


    if(!data.Id)
    {
        conn.query('Insert into associateddiagnosis(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('Select * from associateddiagnosis where groupId = ' + data.groupId,function(err,row){
                    if(!err)
                    {
                        var code = [];
                        for(var item in row)
                        {
                            code.push(row[item].primaryICDId);
                        }

                        conn.query('update associated_group set diagnosis = "' + code.join(',') + '" where Id = ' + data.groupId,function(err,data_row){
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
                    else
                    {
                        console.log(err);
                    }
                })
            }
        })
    }
    else
    {
        conn.query('Update associateddiagnosis set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
            conn.query('Select * from associateddiagnosis where groupId = ' + data.groupId,function(err,row){
                if(!err)
                {
                    var code = [];
                    for(var item in row)
                    {
                        code.push(row[item].primaryICDId);
                    }

                    conn.query('update associated_group set diagnosis = "' + code.join(',') + '" where Id = ' + data.groupId,function(err,data_row){
                       if(!err)
                       {
                            callback({success:true});
                       } 
                    })
                }
            })
        })
    }
}


function searchassociateddiagnosis(data,callback)
{

    var query = "Select * from associated_group order by ordervalue";

    conn.query(query,function(err,row){
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

function searchallassociateddiagnosis(callback)
{
    conn.query('Select * from associateddiagnosis',function(err,row){
        if(!err)
        {
            var code = [];
            for(var item in row)
            {
                code.push({Code:row[item].primaryICDId});
            }

            callback(code);
        }
    })
}

function deleteassociateddiagnosis(id,callback)
{
    conn.query('Select * from associateddiagnosis where Id = ' + id,function(err,row){
        if(row.length > 0)
        {
            conn.query('Delete from associateddiagnosis where Id = ' + id,function(err){
                conn.query('Select * from associateddiagnosis where groupId = ' + row[0].groupId,function(err,row){
                    if(!err)
                    {
                        var code = [];
                        for(var item in row)
                        {
                            code.push(row[item].primaryICDId);
                        }

                        conn.query('update associated_group set diagnosis = "' + code.join(',') + '" where Id = ' +row[0].groupId,function(err,data_row){
                           if(!err)
                           {
                                
                               callback({success:true});
                           } 
                        })
                    }
                })
            })
        }
        
        
    })
    
}

function getassociateddiagnosis(id,callback)
{
    conn.query('Select associateddiagnosis.*,icd10.ShortDesc as ShortDesc from associateddiagnosis,icd10  where associateddiagnosis.groupId = ' + id + ' and icd10.Code = associateddiagnosis.primaryICDId',function(err,row){
        if(!err)
        {
            callback(row);
        }
    })
}

function getmeds(data,callback)
{
    var query = [];
    console.log(data.favourite);
    if(data.favourite && data.favourite != 'false')
    {
        query.push('isFav = true');
    }
    
    if(data.common && data.common != 'false')
    {
        query.push('IsCommon = true');
    }

    if(data.query)
    {
        // searchfield = 'name';

        // if(data.searchfield)
        // {
        //     searchfield = data.searchfield;
        // }
        query.push('(name like "%' + data.query + '%" or itemLongName like "%' + data.query + '%")');
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
    conn.query('Select med_list.*,(Select Name from drugclasses where Id = med_list.classid) as classname from med_list ' + where,function(err,doc){
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

function savetemplate(data,callback)
{
    data.data = escape(data.data);
    if(!data.Id)
    {
        conn.query('Insert into notetemplate(Name,NoteTypeId,IsDefault,data) Values("' + data.Name + '",' + data.NoteTypeId + ',' + data.IsDefault + ",'" + data.data + "')",function(err){
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
    else
    {
        conn.query("Update notetemplate set Name = '" + data.Name + "',NoteTypeId = " + data.NoteTypeId + ",IsDefault = " + data.IsDefault + ",data = '" + data.data + "' where Id = " + data.Id,function(err){
            if(!err)
            {
                callback({success:true})
            }
            else
            {
                console.log(err);
            }
        })
    }
}

function gettemplate(callback)
{
    conn.query('Select * from notetemplate',function(err,row){
        if(!err)
        {
            for(item in row)
            {
                row[item].data = unescape(row[item].data);
            }
            callback(row);
        }
        else
        {
            console.log(err);
        }
    })
}

function searchpatient(data,callback)
{
    var countquery = "Select Count(*) as count from patients where FirstName like '%" + data.FirstName + "%' and LastName like '%" + data.LastName + "%'";
    var query = "Select * from patients where FirstName like '%" + data.FirstName + "%' and LastName like '%" + data.LastName + "%'";

    if(data.searchfield == "AddressLine1" || data.searchfield == 'City')
    {
        countquery += " and " + data.searchfield + " like '%" + data.query + "%'";
        query += " and " + data.searchfield + " like '%" + data.query + "%'";
    }
    else if(data.searchfield == "Location" && data.query)
    {
        countquery += " and location = " + data.query;
        query += " and location = " + data.query;
    }
    else if(data.searchfield == "primaryPhysician" && data.query)
    {
        countquery = "Select Count(*) as count from patients,physicians,patientphysicalsparts where physicians.Contact like '%" + data.query + "%' and patientphysicalsparts.PatientPhysicalId = physicians.Id and patientphysicalsparts.PatientId =  patients.Id and patients.FirstName like '%" + data.FirstName + "%' and patients.LastName like '%" + data.LastName + "%'";
        query = "Select patients.* from patients,physicians,patientphysicalsparts where physicians.Contact like '%" + data.query + "%' and patientphysicalsparts.PatientPhysicalId = physicians.Id and patientphysicalsparts.PatientId =  patients.Id and patients.FirstName like '%" + data.FirstName + "%' and LastName like '%" + data.LastName + "%'";
    }
    else if(data.searchfield == "Consultant" && data.query)
    {
        countquery = "Select Count(*) as count from patients,provider_list where provider_list.fName like '%" + data.query + "%' or provider_list.lName like '%" + data.query + "%' and patients.consultant = provider_list.Id and patients.FirstName like '%" + data.FirstName + "%' and LastName like '%" + data.LastName + "%'";
        query = "Select patients.* from patients,provider_list where provider_list.fName like '%" + data.query + "%' or provider_list.lName like '%" + data.query + "%' and patients.consultant = provider_list.Id and patients.FirstName like '%" + data.FirstName + "%' and LastName like '%" + data.LastName + "%'";
    }
    else if(data.searchfield == "DOB")
    {
        if(data.query.from)
        {
            countquery += " and DateOfBirth >='" + data.query.from + "'";
            query += " and DateOfBirth >='" + data.query.from + "'";      
        }

        if(data.query.to)
        {
            countquery += " and DateOfBirth <= '" + data.query.to + "'";
            query += " and DateOfBirth <= '" + data.query.to + "'";
        }
    }

    console.log(query);
    if(data.activate)
    {
        query += " and patients.IsActive = " + (data.activate == "active") ;
        countquery += " and patients.IsActive = " + (data.activate == "active") ;
    }

    if(data.orderfield)
    {
        query += " order by " + data.orderfield + " " + data.orderaction;
    }

     conn.query(countquery,function(err,row){
        if(!err)
        {
            var senddata = {};
            var count = row[0].count;
            senddata.count = count;
            if(data.page)
            {
                var skip = (data.page - 1) * 20;
                senddata.page = data.page;
                senddata.totalpage = Math.ceil(count / 20);
                query += ' limit ' + skip + ',20';
            }
            

            conn.query(query,function(err,row){
                if(!err)
                {
                    senddata.data = row;    
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

function getphysician(id,callback)
{
    conn.query('Select * from physicians where Id = ' + id,function(err,res){
        if(!err)
        {
            if(res.length > 0)
            {
                callback(res);
            }
            else
            {
                callback({});    
            }
        }
        else
        {
            console.log(err);
        }
    })
}

function searchphysician(search,callback)
{
    conn.query("Select * from physicians where Contact like '%" + search + "%' limit 100" ,function(err,row){
        if(!err)
        {
            callback(row);
        }
    })
}

function saveassociatedgroup(data,callback)
{
    if(!data.Id)
    {
        conn.query('Insert into associated_group(groupname) Values("' + data.groupname + '")',function(err,row){
            conn.query('Select max(Id) as id from associated_group',function(err_row,rowvalue){
                if(!err_row)
                {
                    callback({id:rowvalue[0].id});
                }
            })
        })    
    }
    else
    {
        conn.query('Update associated_group set groupname = "' + data.groupname + '" where Id = ' + data.Id,function(err,row){
            if(!err)
            {
                callback({id:data.Id});
            }
        })
    }
}

function deleteassociatedgroup(id,callback)
{
    conn.query('Delete from associated_group where Id = ' + id,function(err){
        if(!err)
        {
            conn.query('Delete from associateddiagnosis where groupId = ' + id,function(err_row){
                if(!err_row)
                {
                    callback({success:true});
                }
            })
        }
    })
}

function getmedsclass(callback)
{
    conn.query('Select * from drugclasses',function(err,row){
        if(!err)
        {
            var data = getmedsclasslist(row,false);
            callback(data);
        }
    })
}

function getmedsfromsubclass(id,callback)
{
    conn.query('select * from med_list where classid = ' + id,function(err,data){
        if(!err)
        {
            callback(data);
        }
    })
}

function getmedsclasslist(data,parentid)
{
    let datalist = [];
    for(item in data)
    {
        if(!parentid)
        {
            if(!data[item].parentId)
            {
                datalist.push(data[item]);
                data[item].subclass = getmedsclasslist(data,data[item].Id);
            }
        }
        else
        {
            if(data[item].parentId == parentid)
            {
                datalist.push(data[item]);
            }
        }        
    }

    return datalist;
}

function addmedsclass(data,callback)
{
    var field = []; var value = [];
    var updatevalue = [];
    for(var item in data)
    {
        if(item == 'Id')
        {
            continue;
        }

        if(item != 'parentId')
        {
            data[item] = "'" + data[item] + "'";
        }

        field.push(item); value.push(data[item]);
        updatevalue.push(item + "=" + data[item]);
    }

    if(data.Id)
    {
        conn.query('Update drugclasses set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({success:true});
            }
        })
    }
    else
    {
        conn.query('insert into drugclasses(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                callback({success:true});
            }
        })
    }
}

function getpatientphysician(id,callback)
{
    conn.query('Select physicians.*,specialties.Name as specialityname from physicians,patientphysicalsparts,specialties where physicians.Id = patientphysicalsparts.PatientPhysicalId and patientphysicalsparts.PatientId = ' + id + " and specialties.Id = physicians.speciality",function(err,data){
        console.log(err);
        callback(data);
    })
}

function getphysicianinfo(id,callback)
{
    conn.query('Select * from physicians where Id = ' + id,function(err,row){
        callback(row);
    })
}

function saveaddress(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    var numericfield = ['patientid','ordervalue'];
    for(var item in data)
    {
        if(item == 'Id')
        {
            continue;
        }
        field.push(item);

        if(numericfield.indexOf(item) == -1)
        {
            data[item] = "'" + data[item] + "'";
        }

        value.push(data[item]);

        updatevalue.push(item + "=" + data[item]);
    }

    if(!data.Id)
    {
        conn.query('insert into patientaddress(' + field.join(",") + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('Select max(Id) as id from patientaddress',function(errrow,row){
                    callback({id:row[0].id});
                })  
            }
            else{
                console.log(err);
            }
        })    
    }
    else
    {
        conn.query('update patientaddress set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({id:data.Id});
            }
        })
    }
    
}

function deleteaddress(id,callback)
{
    conn.query('Delete from patientaddress where Id = ' + id,function(err){
        callback({success:true});
    })
}


async function saveemployeer(data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    var numericfield = ['ordervalue','patientid'];
    for(var item in data)
    {
        if(item == 'id' || item == 'department')
        {
            continue;
        }

        if(numericfield.indexOf(item) == -1)
        {
            data[item] = "'" + data[item] + "'";
        }

        field.push(item); value.push(data[item]); updatevalue.push(item + "=" + data[item]);
    }

    if(!data.id)
    {
        conn.query('insert into employeer(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('select max(id) as id from employeer',async(errrow,row)=>{
                    data.Id = row[0].id;
                    await savedepartment(data.department,row[0].id);

                    callback({id:row[0].id});
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
        conn.query('Update employeer set ' + updatevalue.join(',') + " where id = " + data.id,async(err)=>{
            if(!err)
            {
                await savedepartment(data.department,data.Id);
                callback({id:data.Id});
            } 
            else
            {
                console.log(err);
            }
        })
    }
}

async function savedepartment(department,id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Delete from departments where employeerid = ' + id,function(err){
            var field = ['employeerid','name','contact','phone','email','fax'];
            var value = [];
            for(item in department)
            {
                department[item].employeerid = id;
                var valueitem = [];
                for(itemfield in field)
                {
                    if(itemfield != 'employeerid')
                    {
                        department[item][field[itemfield]] = department[item][field[itemfield]]?"'" + department[item][field[itemfield]] + "'":"''";
                    }

                    valueitem.push(department[item][field[itemfield]]);
                }

                value.push('(' + valueitem.join(',') + ')');
            }

            if(value.length == 0)
            {
                resolve({success:true});
            }
            else
            {
                conn.query('insert into departments(' + field.join(',') + ') Values' + value.join(','),function(err){
                    resolve({success:true});
                })    
            }
            
        })
    })
}

function deleteemployeer(id,callback)
{
    conn.query('Delete from employeers where Id = ' + id,function(err){
        if(!err)
        {
            conn.query('Delete from departments where employeerid = ' + id,function(err){
                if(!err)
                {
                    callback({success:true})
                }
            })
        }
    })
}

function getmedsalpha(alpha,callback)
{
    conn.query('Select * from med_list where name like "' + alpha + '%"',function(err,row){
        callback(row);
    })
}

function adddefaultreaction(type,data,callback)
{
    var table = "allergy_reaction_list";
    var id = "reactionId";
    if(type == 'severity')
    {
        table = 'allergy_severity_list';
        id = "severityId";
    }

    var field = []; var value = []; var updatevalue = [];
    
    for(var item in data)
    {
        if(item == id)
        {
            continue;
        }

        field.push(item);
        if(item != 'itemOrder')
        {
            data[item] = "'" + data[item] + "'";
        }

        value.push(data[item]);
        updatevalue.push(item + "=" + data[item]);
    }    

    if(data[id])
    {
        conn.query('update ' + table + " set " + updatevalue.join(',') + " where " + id + "=" + data[id],function(err){
            if(!err)
            {
                callback({id:data[id]})
            }
        })
    }
    else
    {
        conn.query('insert into ' + table + "(" + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            conn.query('Select max(' + id + ') as id from ' + table,function(err,row){
                callback({id:row[0].id});
            })
        })
    }
}

function deletedefaultreaction(type,id,callback)
{
    var table = "allergy_reaction_list";
    var id = "reactionId";
    if(type == 'severity')
    {
        table = 'allergy_severity_list';
        id = "severityId";
    }

    conn.query('Delete from ' + table + " where " + id + " = " + id,function(err){
        if(!err)
        {
            callback({success:true});
        }
    })
}

async function updatediagnosisorder(data,callback)
{
    var from = data.from;
    var to = data.to;

    await updateorder(from);
    await updateorder(to);

    callback({success:true});
}

function updateorder(data)
{
    return new Promise((resolve,reject)=>{
        conn.query('update associated_group set ordervalue = ' + data.order + ' where Id = ' + data.id,function(err){
            if(!err)
            {
                resolve({success:true});
            }
            else
            {
                console.log(err);
            }
        })
    })
}

module.exports = {
    search:search,
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
    searchpatient:searchpatient,
    getphysician:getphysician,
    searchphysician:searchphysician,
    getassociateddiagnosis:getassociateddiagnosis,
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