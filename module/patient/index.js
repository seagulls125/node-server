var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function get(param,callback)
{
    username = param.username;
    var sql = 'Select patients.*,races.Name as racename from patients,races where IsActive = true and patients.RaceId = races.Id';
    if(username)
    {
        sql += ' and LOWER(CONCAT(FirstName," ",LastName)) like "%' + username.toLowerCase() +'%"';
    }

    conn.query(sql,function(err,doc){
        if(err)
        {
            throw err;
        }

        callback(doc);
    })
}


function active(id,callback)
{
    conn.query('Update patients set IsActive = !IsActive where Id = ' + id,function(err,doc){
        if(err)
        {
            throw err;
        }
        callback({success:true});
    })
}

async function deletereminders(id,callback)
{
    conn.query('Delete from patientreminder where id = ' + id,async(err,doc) => {
        if(err)
        {
            throw err;
        }
        
        callback({success:true});
    })
}

async function savereminders(data,callback)
{
    var sql = '';
    if(!data.id)
    {
        sql = 'insert into patientreminder(patientid,text) Values(' + data.profile + ",'" + data.value + "')"   
    }
    else
    {
        sql = 'update patientreminder set text = "' + data.value + '" where id = ' + data.id;
    }
    conn.query(sql,async(err,doc)=>{
        console.log(err);
        if(!err)
        {
            var datareminder = await getpatientreminder(data.profile);
            callback(datareminder);
            
        }
    })
}

async function savereaction(data,callback)
{
    var sql = '';
    if(!data.id)
    {
        sql = 'insert into patientreaction(patientid,text) Values(' + data.profile + ",'" + data.value + "')"   
    }
    else
    {
        sql = 'update patientreaction set text = "' + data.value + '" where id = ' + data.id;
    }

    conn.query(sql,async(err,doc)=>{
        if(!err)
        {
            var datareaction = await getpatientreaction(data.profile);
            callback(datareaction);
        }
    })
}

async function deletereaction(id,callback)
{
    conn.query('Delete from patientreaction where id = ' + id,function(err,result){
        if(!err)
        {
            callback({success:true});
        }
    })
}

async function savepatientcounter(data,callback)
{
    var patientid = data.patientid;
    var update = [];
    var field = ["patientid"];
    var value = [patientid];
    for(item in data)
    {
        if(item == 'patientid')
        {
            continue;
        }

        field.push(item);
        if(item == "TEN")
        {
            update.push(item + "=" + data[item]);
            value.push(data[item]);
        }
        else
        {
            update.push(item + "='" + data[item] + "'");
            value.push("'" + data[item] + "'");
        }
    }


    var patientcounter = await getpatientcounter(patientid);
    data.patientid = patientid;
    if(patientcounter.length > 0)
    {
        conn.query('update patientcounter set ' + update.join(',') + ' where patientid = ' + patientid,async(err,doc)=>{
            if(!err)
            {
                var data = await getpatientcounter(patientid);
                callback(data);
            }
        })
    }
    else
    {
        conn.query('insert patientcounter(' + field.join(',') + ') Values(' + value.join(',') + ')',async(err,doc)=>{
            if(!err)
            {
                var data = await getpatientcounter(patientid);
                callback(data);
            }
            
        })
    }
}

function getraces(callback)
{
    conn.query('Select * from races',function(err,doc){
        if(!err)
        {
            callback(doc);
        }
    })
}

async function saverace(data,callback)
{
    if(data.Id)
    {
        conn.query('update races set Name = "' + data.Name + '" where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({success:true})
            }
        })
    }
    else
    {
        conn.query('insert into races(Name) Values("' + data.Name + '")',function(err,row){
            if(!err)
            {
                callback({success:true});
            }
        })
    }
}

async function getinfo(id,callback)
{
    var profile = {};
    profile['demos'] = {
        general:await getprofile(id),
        electronic:await getelemectronicdesignee(id),
        employeer:await getemployeer(id),
        pharmecy:await getpharmecy(id)
    }
    profile['profile'] = await getprofile(id);
    profile['reaction'] = await getpatientreaction(id);
    profile['emergency'] = await getemergencycontact(id);
    profile['reminder'] = await getpatientreminder(id);
    profile['counter'] = await getpatientcounter(id);
    profile['address'] = await getaddress(id);
    callback(profile);
}

async function getaddress(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from patientaddress where patientid = ' + id,function(err,row){
            if(!err)
            {
                resolve(row);
            }
        })
    })
}

async function getelemectronicdesignee(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select contacts.* from contacts,contacttypes where contacts.ContactTypeId = contacttypes.Id and contacttypes.Name = "electronic" and contacts.patientId = ' + id,function(err,data){
            if(err)
            {
                reject(err);
            }

            if(data.length > 0)
            {
                resolve(data[0]);
            }
            else{
                resolve({});
            }
            
        })
    })
}

async function getpharmecy(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select pharmacies.*,pharmacypatient.ordervalue as ordervalue from pharmacies,pharmacypatient where pharmacypatient.patientid = ' + id + ' and pharmacypatient.pharmacyid = pharmacies.Id',function(err,data){
            if(err)
            {
                reject(err);
            }

            resolve(data);
        })
    })
}

async function getemployeer(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from employeer where patientid = ' + id,async(err,data)=>{
            if(err)
            {
                reject(err);
            }

            if(data.length > 0)
            {
                for(item in data)
                {
                    data[item]['department'] = await getdepartments(data[item].id);
                }

                resolve(data);
            }
            else
            {
                resolve(data);
            }
        })
    })
}

async function getdepartments(employeerid)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from departments where employeerid = ' + employeerid,function(err,data){
            if(err){
                reject(err);
            }

            resolve(data);
        })
    })
}
async function getprofile(id)
{
    console.log(id);
    return new Promise((resolve,reject)=>{
        conn.query('Select * from patients where Id = ' + id,function(err,doc){
            if(err)
            {
                console.log(err);
                reject(err);
            }

            if(doc.length > 0)
            {
                doc[0].physicianname = ""; doc[0].physician
                resolve(doc[0]);    
            }
            else
            {
                resolve({});
            }
        })
    })
}

async function getemergencycontact(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select contacts.* from contacts,contacttypes where contacts.PatientId = ' + id + " and contacts.ContactTypeId = contacttypes.Id and contacttypes.Name = 'emergency'",function(err,doc){
            if(err)
            {
                reject(err);
            }

            resolve(doc);
        })
    })
}

async function getpatientreaction(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from patientreaction where patientid = ' + id,function(err,doc){
            if(err)
            {
                reject(err);
            }

            resolve(doc);
        })
    })   
}

async function getpatientreminder(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from patientreminder where patientid = ' + id,function(err,doc){
            if(err)
            {
                reject(err);
            }

            resolve(doc);
        })
    }) 
}

async function getpatientcounter(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from patientcounter where patientid = ' + id,function(err,doc){
            console.log(doc);
            if(err)
            {
                reject(err);
            }

            resolve(doc);
        })
    })   
}

async function saveemergency(data,callback)
{
    var field = [];
    var value = [];
    var numeric_field = ['ordervalue','PatientId','ContactTypeId'];
    var emergencyid = await getcontacttypeid("emergency");

    var value_array = []; var update_array = [];
    
    data.ContactTypeId = emergencyid;
    for(var item in data)
    {
        if(numeric_field.indexOf(item) == -1)
        {
            data[item] = "'" + data[item] + "'";
        }

        value_array.push(data[item]); field.push(item); 
        update_array.push(item + "=" + data[item]);
    }

    if(data.Id)
    {
        conn.query('update contacts set ' + update_array.join(',') + ' where Id = ' + data.Id,function(err){
            if(!err)
            {
                callback({id:data.Id});
            }
        })
    }
    else
    {
        conn.query('insert into contacts(' + field.join(',') + ') Values(' + value_array.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('select max(Id) as id from contacts',function(errrow,row){
                    callback({id:row[0].Id});
                })
            }
            else
            {
                console.log(err);
            }
        })
    }
}

async function getcontacttypeid(name)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from contacttypes where Name = "' + name + '"',function(err,data){
            if(err)
            {
                reject(err);
            }

            if(data.length > 0)
            {
                resolve(data[0]['Id']);
            }
            else
            {
                resolve(0);
            }
        })
    })
}

async function updateinfo(id,data,callback)
{
    // var general = data.general;
    // var employeer = data.employeer;
    // var pharmacies = data.pharmacies;
    // var electronic = data.electronic;

    var general = {};
    general.general = await update_generalinfo(id,data);
    // data.employeer = await update_employeer(id,employeer);
    // data.pharmacies = await update_pharmacy(id,pharmacies);
    // data.electronic = await updateelectroniccontact(id,electronic);

    callback(general);
}

async function update_generalinfo(id,data)
{
    var field = []; var field_value = [];
    var num_field = ['RaceId','electric_communication','PreferredPhamarcyId','location'];
    var static_field = ['Id','AccountNumber','IsActive','CreatedBy','ModifiedBy','Created'];

    console.log(data);
    for(item in data)
    {
        if(item == 'physicianname')
        {
            continue;
        }
        if(static_field.indexOf(item) > -1)
        {
            continue;
        }

        if(num_field.indexOf(item) > -1)
        {
            field_value.push(item + "=" + data[item]);
        }
        else
        {
            field_value.push(item + "='" + data[item] + "'");
        }
    }

    return new Promise((resolve,reject)=>{
        conn.query('Update patients set ' + field_value.join(',') + " where id =" + id,async(err)=>{
            if(err){
                console.log(err);
                reject(err);
            }

            userinfo = await getprofile(id);
            resolve(userinfo);
        })
    })
}

async function update_employeer(id,data)
{
    var employeers = await get_employeers(id);

    var ids = [];
    for(item in employeers)
    {
        ids.push(employeers[item].id);
    }

    if(ids.length > 0)
    {
        result = await delete_employeer(ids);
    }

    for(item in data)
    {
        if(!data[item].name)
        {
            continue;
        }

        var result = await add_employeer(id,data[item]);
    }

}


async function add_employeer(id,data)
{
    return new Promise((resolve,reject)=>{
        var field = ['patientid','name','address','city','state','zip'];
        var fielddata = [id];

        for(item in field)
        {
            if(field[item] == 'patientid')
            {
                continue;
            }
            var value = "''";
            if(data[field[item]])
            {
                value = "'" + data[field[item]] + "'";
            }

            fielddata.push(value);
        }

        conn.query('insert into employeer(' + field.join(',') + ') Values(' + fielddata.join(',') + ')',function(err){
            if(!err)
            {
                if(!data.department || data.department.length == 0)
                {
                    resolve({success:true});
                }

                conn.query('Select max(id) as id from employeer',function(err,datafield){
                    var departmentfield = ['employeerid','name','contact','phone','email','fax'];
                    var value = [];
                    data = data.department;
                    for(item in data)
                    {
                        if(!data[item].name)
                        {
                            continue;
                        }
                        valuedata = [datafield[0].id];
                        var enable = true;
                        for(itemfield in departmentfield)
                        {

                            if(departmentfield[itemfield] == 'employeerid')
                            {
                                continue;
                            }

                            if(data[item][departmentfield[itemfield]])
                            {
                                valuedata.push("'" + data[item][departmentfield[itemfield]] + "'");
                            }
                            else
                            {
                                valuedata.push("''");
                            }
                        }
                       
                        value.push('(' + valuedata.join(',') + ')');    
                      
                   }

                   if(value.length == 0)
                   {
                        resolve({success:true});
                   }

                   conn.query('insert into departments(' + departmentfield.join(',') + ') Values' + value.join(','),function(err){
                        if(err)
                        {
                            reject(err);
                        }
                        else
                        {
                            resolve({success:true});
                        }
                   })
                })
            }
            else
            {
                reject(err);
            }
        })
    })
}

async function delete_employeer(ids)
{
    return new Promise((resolve,reject)=>{
        conn.query('Delete from employeer where id in (' + ids.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('Delete from departments where employeerid in (' + ids.join(',') + ')',function(err){
                    if(!err)
                    {
                        resolve({success:true});
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

async function get_employeers(id)
{
    return new Promise((resolve,reject)=>{
        conn.query("Select * from employeer where patientid = " + id,function(err,data){
            if(err)
            {
                reject(err);
            }

            resolve(data);
        })
    })
}

async function update_pharmacy(id,data)
{
    return new Promise((resolve,reject)=>{
        conn.query('delete from pharmacies where patientid = ' + id,function(err){
            if(err)
            {
                reject(err);
            }

            var field = ['patientid','Name','City',"State","address","fax","emailaddress","PostCode","Telephone"];
            var value = [];
            for(itemdata in data)
            {
                if(!data[itemdata].Name)
                {
                    continue;
                }

                var valuedata = [id];
                for(item in field)
                {
                    if(field[item] == 'patientid')
                    {
                        continue;
                    }
                    if(data[itemdata][field[item]])
                    {
                        valuedata.push("'" + data[itemdata][field[item]] + "'");
                    }
                    else
                    {
                        valuedata.push("''");
                    }
                }

                value.push('(' + valuedata.join(',') + ')');
            }

            if(value.length > 0)
            {
                conn.query('insert into pharmacies(' + field.join(',') + ') Values' + value.join(','),async(err)=>{
                    if(err)
                    {
                        reject(err);
                    }

                    var data = await getpharmecy(id);

                    resolve(data);
                })
            }
            else
            {
                resolve([]);  
            }   
        })
    })
}

async function updateelectroniccontact(id,data)
{
    contactid = await getcontacttypeid("electronic");

    return new Promise((resolve,reject)=>{
        conn.query('delete from contacts where ContactTypeId = ' + contactid + ' and PatientId = ' + id,function(err){
            if(err)
            {
                reject(err);
            }

            if(!data.FirstName)
            {
                resolve({});
            }
            var field = ['ContactTypeId',"PatientId","FirstName","MiddleName","LastName","AddressLine1","City","State","PostCode","HomeNumber","WorkNumber","MobileNumber"];

            var value = [contactid,id];
            for(item in field)
            {
                if(field[item] == 'ContactTypeId' || field[item] == 'PatientId')
                {
                    continue;
                }

                if(data[field[item]])
                {
                    value.push("'" + data[field[item]] + "'");
                }
                else
                {
                    value.push("''");
                }
            }

            console.log(value);
            conn.query('insert into contacts(' + field.join(',') + ') Values(' + value.join(',') + ')',async(err)=>{
                if(err)
                {
                    reject(err);
                }

                var data = await getelemectronicdesignee(id);
                resolve(data);
            })
        })
    })
}


function getproviders(callback)
{
    conn.query('Select * from provider_list',function(err,result){
        if(!err)
        {
            callback(result);
        }
    })
}

function deletepatients(id,callback)
{
     conn.query('Delete from patients where Id = ' + id,function(err,doc){
        if(err)
        {
            console.log(err);
            callback({success:false});
        }
        else
        {
            callback({success:true});
        }
    })
}

function savepharmacy(patientid,data,callback)
{
    //var numeric_field = ['ordervalue','patientid'];
    var field = []; var value = []; var updatevalue = [];

    for(item in data)
    {
        if(item == 'Id')
        {
            continue;
        }
        
        if(item == 'ordervalue')
        {
            continue;
        }
        data[item] = "'" + data[item] + "'";
        

        field.push(item); value.push(data[item]); updatevalue.push(item + "=" + data[item]);
    }

    if(!data.Id)
    {  
        conn.query('insert into pharmacies(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){

            conn.query('Select max(Id) as id from pharmacies',async(err,row)=>{
                await addpharmecy(patientid,row[0].id,data.ordervalue);
                callback({id:row[0].id});
            })
        })    
    }
    else
    {
        conn.query('update pharmacies set ' + updatevalue.join(',') + " where Id = " + data.Id,async(err)=>{
            if(!err)
            {
                await addpharmecy(patientid,data.Id,data.ordervalue);
                callback({id:data.Id});
            }
        })
    }    
}

async function addpharmecy(patientid,id,ordervalue)
{
    return new Promise((resolve,reject)=>{
        conn.query("select * from pharmacypatient where patientid = " + patientid  + " and ordervalue = " + ordervalue,function(err,row){
            if(row.length > 0)
            {
                conn.query('update pharmacypatient set pharmacyid = ' + id + " where patientid = " + patientid + " and ordervalue = " + ordervalue,function(err){
                    if(!err)
                    {
                        resolve({success:true});
                    }
                })
            }
            else
            {
                conn.query('insert into pharmacypatient(pharmacyid,patientid,ordervalue) Values(' + id + ',' + patientid + ',' + ordervalue + ')',function(err){
                    if(!err)
                    {
                        resolve({success:true})
                    }
                    else
                    {
                        console.log(err);
                    }
                })
            }
        })    
    })
    
}

function searchpharmacy(value,callback)
{
    conn.query('select * from pharmacies where Name like "%' + value + '%" limit 30',function(err,data){
        if(!err)
        {
            callback(data);
        }
    })
}

module.exports = {
    get:get,
    active:active,
    getinfo:getinfo,
    savereminders:savereminders,
    deletereminders:deletereminders,
    savereaction:savereaction,
    deletereaction:deletereaction,
    savepatientcounter:savepatientcounter,
    saveemergency:saveemergency,
    getraces:getraces,
    updateinfo:updateinfo,
    getproviders:getproviders,
    deletepatients:deletepatients,
    saverace:saverace,
    savepharmacy:savepharmacy,
    searchpharmacy:searchpharmacy
}