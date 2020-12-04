var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function get(value,callback)
{
    if(value == undefined || !value)
    {
        value = "";
    }
    conn.query('Select * from icd10 where Code like "' + value + '%" or ShortDesc like "%' + value + '%" limit 100',function(err,doc){
    	if(!err)
    	{	
    		callback(doc);
    	}
    	else
    	{
    		console.log(err);
    	}
    })
}

//get the common problem in icd 10 table
function common(callback)
{
    conn.query('Select * from icd10 where IsCommon = true',function(err,data){
        if(!err)
        {
            callback(data);
        }
    })
}

function macro(callback)
{
    conn.query('Select * from macrocategories',async(err,doc)=>{
        if(!err)
        {
            for(item in doc)
            {
                doc[item].macros = await macroelement(doc[item].Id);
            }

            callback(doc);
        }
        else
        {
            console.log(err);
        }
    })
}   


async function macroelement(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from macros where MacroCategoryId =' + id,function(err,doc){
            if(!err)
            {
                resolve(doc);
            }
            else
            {
                reject(err);
            }
        })
    })
}

async function masterfile(id,callback)
{
    var data = await masterfilesubsection(id);
    callback(data);
}

async function masterfilesubsection(sectionid)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from masterfilesubsections where SectionId = ' + sectionid,async(err,doc)=>{
            if(!err)
            {
                let idarray = [];
                let data = {};
                for(item in doc)
                {
                    idarray.push(doc[item].Id);
                    data[doc[item].Id] = doc[item];
                    data[doc[item].Id].list = [];
                }

                var filedata = await masterfileitems(idarray);

                for(item in filedata)
                {
                    data[filedata[item].MasterFileSubsectionId].list.push(filedata[item]);
                }

                resolve(data);
            }
            else
            {
                reject(err);
            }
        })
    })
}

async function masterfileitems(idarray)
{
    return new Promise((resolve,reject)=>{

        if(idarray.length == 0)
        {
            resolve([]);
        }

        conn.query('Select masterfileitems.Id as id,masterfileitems.MasterFileSubsectionId as MasterFileSubsectionId,icd10.* from masterfileitems,icd10 where (masterfileitems.ReferenceKeyChar = icd10.CODE || masterfileitems.ReferenceKeyInt = icd10.Id) and masterfileitems.MasterFileSubsectionId in (' + idarray.join(',') + ')',function(err,data){
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        })
    })
}
async function masterfileitem(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select icd10.*,masterfileitems.Id as id from masterfileitems,icd10 where (masterfileitems.ReferenceKeyChar = icd10.CODE || masterfileitems.ReferenceKeyInt = icd10.Id) and masterfileitems.MasterFileSubsectionId = ' + id,function(err,data){
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        })
    })
}

function favourite(callback)
{
    conn.query('Select * from icd10 where IsFavorite = true',function(err,row){
        callback(row);
    })
}

async function macrofile(id,callback)
{
    conn.query('Select * from macros where id = ' + id,async(err,doc)=>{
        if(!err)
        {
            var data = {};
            if(doc.length > 0)
            {
                let idarray = [];
                if(doc[0].SubsectionId)
                {
                    data[doc[0].SubsectionId] = doc[0];
                    data[doc[0].SubsectionId].list = [];
                    idarray.push(doc[0].SubsectionId);
                }

                var children = await getchildrenmacros(doc[0].Id);

                for(item in children)
                {
                    data[children[item].SubsectionId] = children[item];
                    data[children[item].SubsectionId].list = [];
                    idarray.push(children[item].SubsectionId);
                }

                var masterfiles = await masterfileitems(idarray);

                for(item in masterfiles)
                {
                    data[masterfiles[item].MasterFileSubsectionId].list.push(masterfiles[item]);
                }
            }

            callback(data);
        }
    })
}


async function getchildrenmacros(id)
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from macros where ParentMacroId = ' + id,function(err,data){
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        })    
    })
    
}

function getmastersubsectionfornode(id,callback)
{
    conn.query('Select * from masterfilesubsections where SectionId = ' + id,async(err,data)=>{
        if(err)
        {

        }
        else
        {
            var idarray = [];
            var nodes = await getmastersubsectionnode();
            var statements = await getstatement();
            console.log(statements);
            //var list = treelist(nodes);

            var datalist = {};

            for(item_list in nodes)
            {
                if(!datalist[nodes[item_list].ParentSubsectionId])
                {
                    datalist[nodes[item_list].ParentSubsectionId] = [];
                }

                nodes[item_list].statement = statements[nodes[item_list].Id]?statements[nodes[item_list].Id]:[];
                datalist[nodes[item_list].ParentSubsectionId].push(nodes[item_list]);
            }

            for(item in data)
            {
                data[item].list = [];
                if(data[item].Id)
                {
                    data[item].list = datalist[data[item].Id]?datalist[data[item].Id]:[];
                }
                
            }   
            callback(data);
        }
    })
}

function treelist(nodes,nodeid)
{
    var data = {};var children = [];
    for(item in nodes)
    {
        var element_node = nodes[item];
        if(!nodeid)
        {
            if(!nodes[item].ParentNodeId)
            {
                if(!data[nodes[item].ParentSubsectionId])
                {
                    data[nodes[item].ParentSubsectionId] = [];
                }
                if(nodes[item].IsSubfolder)
                {
                    element_node.list = treelist(nodes,nodes[item].Id);
                }
                data[nodes[item].ParentSubsectionId].push(element_node);
            }
        }
        else
        {
            if(nodes[item].ParentNodeId == nodeid)
            {
                if(nodes[item].IsSubfolder)
                {
                    element_node.list = treelist(nodes,nodes[item].Id);    
                }
                
                children.push(element_node);
            }
        }
    }

    if(!nodeid)
    {
        return data;
    }
    else
    {
        return children;
    }
}

function getmastersubsectionnode()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from masterfilesubsectionnodes',function(err,doc){
            if(!err)
            {
                resolve(doc);
            }
            else
            {
                reject(err);
            }
        })
    })
}

function getdiagnostic(callback)
{
    conn.query('Select * from labtestcategories',async(err,data)=>{

        if(err)
        {
            callback([]);
        }

        var id_array = [];
        for(item in data)
        {   
            id_array.push(data[item].Id);
        }

        var dataarray = await getcptforlabtest(id_array);

        callback({
            category:data,
            item:dataarray
        });

    })
}


async function getcptforlabtest(idarray)
{
    return new Promise((resolve,reject)=>{
        if(idarray.length == 0)
        {
            resolve([]);
        }
        conn.query('Select * from cpt where LabTestCategoryId in (' + idarray.join(',') + ')',function(err,doc){
            if(err)
            {
                reject(err);
            }

            let data = {};
            for(item in doc)
            {   
                if(!data[doc[item].LabTestCategoryId])
                {
                    data[doc[item].LabTestCategoryId] = [];
                }
                data[doc[item].LabTestCategoryId].push(doc[item]);
            }

            resolve(data);
        })
    })
}

function getmeds(data,callback)
{
    currentpage = data.currentpage;
    search = data.search;

    skip = (currentpage - 1) * 10;

    conn.query('Select count(*) as count from allergy_list where name like "%' + search + '%"',function(err,count){
        if(err)
        {
            callback(err);
        }
        console.log(count);
        var data = {totalpage:Math.ceil(count[0].count / 10)};

        conn.query('Select * from allergy_list where name like "%' + search + '%" limit ' + skip + ",10",function(err,doc){
            if(err)
            {
                callback(err);
            }

            data.list = doc;

            callback(data);
        })
    })
   // conn.query('Select * from ')
}


function searchmeds(data,callback)
{
    var search = data.search;

    conn.query('Select med_dosage_list.optionText as dosage,med_list.* from med_dosage_list,med_list where med_dosage_list.medId = med_list.itemId and med_list.name like "%' + search + '%" limit 30',function(err,result){
        if(!err)
        {
            callback(result);
        }
    }) 
    // conn.query('Select * from drugsearchitems where Brand like "%' + search + '%" limit 30',function(err,data){
    //     if(!err)
    //     {
    //         callback(data);    
    //     }
        
    // })
}

function alergyinfo(callback)
{
    conn.query('Select * from allergy_reaction_list order by itemOrder',function(err,data){
        if(err)
        {
            callback(err);
        }

        conn.query('Select * from allergy_severity_list order by itemOrder',function(err1,doc){
            if(err1)
            {
                callback(err1);
            }

            callback({
                reaction:data,
                severity:doc
            })
        })
    })
}

function savemaster(data,callback)
{
    var subsectionid = [];
    var field = ["MasterFileSubsectionId","ReferenceEntity","ReferenceKeyChar","ReferenceKeyInt","IsIncluded"];
    var value = [];
    for(item in data)
    {
        var valueentity = [];
        if(subsectionid.indexOf(data[item].MasterFileSubsectionId) == -1)
        {
            subsectionid.push(data[item].MasterFileSubsectionId);
        }
        for(fielditem in field)
        {
            if(field[fielditem] == 'ReferenceKeyChar' || field[fielditem] == 'ReferenceEntity')
            {
                valueentity.push("'" + data[item][field[fielditem]] + "'");
            }
            else
            {
                valueentity.push(data[item][field[fielditem]]);
            }
        }

        value.push('(' + valueentity.join(',') + ')');
    }

    conn.query('Delete from masterfileitems',function(err){
        if(!err)
        {
            conn.query('insert into masterfileitems (' + field.join(',') + ') Values' + value.join(','),function(err){
                if(!err)
                {
                    callback({success:true});
                }
                else
                {
                    callback(err);
                }
            })
        }
    })
}


function savemasterfile(data,callback)
{
    var field = ['Id','ParentSubsectionId','ParentNodeId','IsSubfolder','IsBullet','Name','DefaultContent','NodeOrder'];

    conn.query('Delete from masterfilesubsectionnodes where Id > 0',function(err){
        if(!err)
        {
            var totalvalue = [];
            for(item in data)
            {
                var value = [];
                value.push(data[item].Id);
                value.push(data[item].ParentSubsectionId);
                value.push(data[item].ParentNodeId?data[item].ParentNodeId:'null');
                value.push(data[item].IsSubfolder);
                value.push(data[item].IsBullet);
                value.push('"' + data[item].Name + '"');
                value.push('"' + data[item].DefaultContent + '"');
                value.push(data[item].NodeOrder);

                totalvalue.push('(' + value.join(',') + ')');
            }

            //callback('insert into masterfilesubsectionnodes(' + field.join(',') + ') Values' + totalvalue.join(','));
            conn.query('insert into masterfilesubsectionnodes(' + field.join(',') + ') Values' + totalvalue.join(','),function(err){
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
    })
}


function getrelated(id,callback)
{
    // conn.query('Select associateddiagnosis.* from associateddiagnosis,icd10 where icd10.Id =  ' + id + " and associateddiagnosis.primaryICDId = icd10.Code",async(err,row)=>{
    //     if(row.length > 0)
    //     {
    //         callback(await getproblemswithcode(row[0].associatedICD));
    //     }
    //     else
    //     {
    //         callback([]);
    //     }
    // })

    conn.query('Select icd10.* from icd10,associateddiagnosis,associated_group where icd10.Code = associateddiagnosis.primaryICDId and associateddiagnosis.groupId = associated_group.Id and associated_group.Id = ' + id,function(err,row){
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

async function getproblemswithcode(code)
{
    return new Promise((resolve,reject)=>{
        let codearray = [];
        if(code)
        {
            codearray = code.split(',');
        }
        else
        {
            resolve([]);
        }   

        for(var item in codearray)
        {
            codearray[item] = "'" + codearray[item] + "'";
        }

        conn.query('Select * from icd10 where Code in (' + codearray.join(',') + ')',function(err,row){
            resolve(row);
        })
    })
}

function addrelated(id,code,callback)
{
    conn.query('Select * from icd10 where Id = ' + id,function(err,doc){
        if(!err)
        {
            if(doc.length > 0)
            {
                var related = doc[0].related;
                var relatedarray = [];
                if(related)
                {
                    relatedarray = related.split(',');                    
                }
                
                if(relatedarray.indexOf(code) == -1)
                {
                    relatedarray.push(code);
                }

                conn.query('update icd10 set related = "' + relatedarray.join(',') + '" where id = ' + id,function(err,doc){
                    callback({related:relatedarray.join(',')});
                })
            }
        }
    })
}

function search(param,data,callback)
{
    if(!data)
    {
        callback([]);
        return;
    }
    var dataarray = data.split(',');

    for(item in dataarray)
    {
        dataarray[item] = "'" + dataarray[item] + "'";
    }

    if(dataarray.length > 0)
    {
        conn.query('Select * from icd10 where ' + param + ' in (' + dataarray.join(',') + ')',function(err,result){
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
    else
    {
        callback([]);
    }
    
}

function add(type,data,callback)
{
    var field = []; var value = []; var updatevalue = [];
    var numericfield = ['IsFavorite','IsCommon','IsLab','IsImaging','LabTestCategoryId'];
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
        conn.query('Update ' + type + ' set ' + updatevalue.join(',') + ' Where Id = ' + data.Id,function(err){
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
        conn.query('insert into ' + type + '(' + field.join(',') + ') Values(' + value.join(',') + ')',function(err){
            if(!err)
            {
                callback({success:true});
            }
        })
    }
}

function addmastersection(sectionid,data,callback)
{
    conn.query('insert into masterfilesubsections(SectionId,Name) Values(' + sectionid + ',"' + data.name + '")',function(err){
        if(!err)
        {
            conn.query('Select * from masterfilesubsections where Id = (Select max(Id) from masterfilesubsections)',function(err,row){
                if(!err)
                {
                    callback(row[0]);
                }
            })
        }
        else
        {
            console.log(err);
        }
    })
}


function addmasterfileitem(data,callback)
{
    conn.query('insert into masterfileitems(MasterFileSubsectionId,ReferenceEntity,ReferenceKeyChar,ReferenceKeyInt,IsIncluded) Values(' + data.subsectionid + ',"' + data.ReferenceEntity + '","' + data.ReferenceKeyChar + '",' + data.ReferenceKeyInt + ',1)',function(err){
        if(!err)
        {
            conn.query('Select max(Id) as maxid from masterfileitems',function(err,row){
                if(!err)
                {
                    callback({success:true,id:row[0].maxid});
                }
            })
        }
    })
}

function deletemasterfileitem(id,callback)
{
    conn.query('Delete from masterfileitems where Id = ' + id,function(err){
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

function deletemastersection(sectionid,id,callback)
{
    conn.query('Delete from masterfilesubsections where Id = ' + id,function(err){
        if(!err)
        {
            if(sectionid == 9)
            {
                conn.query('Delete from masterfileitems where MasterFileSubsectionId = ' + id,function(err){
                    if(!err)
                    {
                        callback({success:true})
                    }
                })    
            }
            
        }
    })
}

function addmasterfilenode(data,callback)
{
    var field = []; var field_value = [];
    var updatevalue = [];
    textfield = ['Name','DefaultContent'];

    for(item in data)
    {
        if(item == 'Id' || item == 'statement')
        {
            continue;
        }
        field.push(item);
        if(textfield.indexOf(item) > -1)
        {
            data[item] = "'" + data[item] + "'";
        }

        updatevalue.push(item + '=' + data[item]);
        field_value.push(data[item]);
    }

    if(!data.Id)
    {
        conn.query('insert into masterfilesubsectionnodes(' + field.join(',') + ') Values(' + field_value.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('select max(Id) as id from masterfilesubsectionnodes',function(err,row){
                    if(!err)
                    {
                        callback({success:true,id:row[0].id});
                    }
                })
            }
        })
    }
    else
    {
        conn.query('update masterfilesubsectionnodes set ' + updatevalue.join(',') + ' where Id = ' + data.Id,function(err){
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

function deletemasterfilenode(data,callback)
{
    if(data.id && data.id.length > 0)
    {
        conn.query('Delete from masterfilesubsectionnodes where Id in (' + data.id.join(',') + ')',function(err){
            if(!err)
            {
                conn.query('Delete from statements where itemId in (' + data.id.join(',') + ')',function(err){
                    if(!err)
                    {
                        callback({success:true});        
                    }
                })
            }
        })    
    }
    
}

function getstatement()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from statements order by ordervalue',function(err,row){
            if(!err)
            {
                let data = {};

                for(item in row)
                {
                    if(!data[row[item].itemId])
                    {
                        data[row[item].itemId] = [];
                    }

                    data[row[item].itemId].push(row[item]);
                }

                resolve(data);
            }
            else
            {
                reject(err);
            }
        })
    })
}

function addstatement(data,callback)
{
    var field = []; var value = ""; var updatevalue = "";

    for(item in data)
    {
        if(item == 'Id')
        {
            continue;
        }

        field.push(item);
        if(item == 'Content')
        {
            data[item] = data[item].replace(/\'/g,"\\'");
            data[item] = "'" + data[item] + "'";
        }

        value += data[item] + ",";
        updatevalue += item + "=" + data[item] + ",";
    }

    updatevalue = updatevalue.substring(0,updatevalue.length - 1);
    value = value.substring(0,value.length - 1);

    if(!data.Id)
    {
        conn.query('insert into statements(' + field.join(',') + ') Values(' + value + ')',function(err){
            if(!err)
            {
                conn.query('Select max(Id) as maxid from statements',function(errstatement,row){
                    if(!errstatement)
                    {
                        callback({success:true,id:row[0].maxid})        
                    }
                })
            }
        })    
    }
    else
    {
        conn.query('update statements set ' + updatevalue + ' where Id = ' + data.Id,function(err){
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


function deletestatement(id,callback)
{
    conn.query('Delete from statements where Id = ' + id,function(err){
        if(!err)
        {
            callback({success:true})
        }
    })
}

module.exports = {
    get:get,
    macro:macro,
    master:masterfile,
    macrofile:macrofile,
    masternode:getmastersubsectionfornode,
    getdiagnostic:getdiagnostic,
    getmeds:getmeds,
    searchmeds:searchmeds,
    alergyinfo:alergyinfo,
    savemaster:savemaster,
    common:common,
    savemasterfile:savemasterfile,
    getrelated:getrelated,
    addrelated:addrelated,
    search:search,
    add:add,
    addmastersection:addmastersection,
    deletemasterfileitem:deletemasterfileitem,
    deletemastersection:deletemastersection,
    addmasterfileitem:addmasterfileitem,
    addmasterfilenode:addmasterfilenode,
    deletemasterfilenode:deletemasterfilenode,
    addstatement:addstatement,
    deletestatement:deletestatement,
    favourite:favourite
}