var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

async function get(callback)
{
    var substance = await substances();

    var options = await socialhistoryoptions();
    var section = await socialhistorysections();

    var data = {};
    for(item in options)
    {
        if(!data[options[item].SocialHistorySectionId])
        {
            data[options[item].SocialHistorySectionId] = [];
        }

        data[options[item].SocialHistorySectionId].push(options[item]);
    }

    for(item in section)
    {
        section[item].options = data[section[item].Id]?data[section[item].Id]:[];
    }

    callback({
        section:section,
        substance:substance
    })
}

async function substances()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from substances',async(err,doc)=>{
            if(err)
            {
                console.log(err);
                reject(err);
            }

            var types = [];
            var units = [];
            var status = [];
            for(item in doc)
            {
                if(doc[item].HasTypes)
                {
                    types.push(doc[item].Id);
                }

                units.push(doc[item].Id);
                status.push(doc[item].Id);
            }

            types = await substancetypes(types);
            units = await getsubstanceunit(units);
            status = await getsubstancestatus(status);

            for(item in doc)
            {
                doc[item].types = types[doc[item].Id]?types[doc[item].Id]:[];
                doc[item].units = units[doc[item].Id]?units[doc[item].Id]:[];
                doc[item].status = status[doc[item].Id]?status[doc[item].Id]:[];
            }

            console.log(doc);
            resolve(doc);
        })
    })
}

async function socialhistorysections()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from socialhistorysections',function(err,doc){
            if(!err)
            {
                resolve(doc);
            }
            else
            {
                console.log(err);
                reject(err);
            }
        })
    })
}

async function socialhistoryoptions()
{
    return new Promise((resolve,reject)=>{
        conn.query('Select * from socialhistorysectionoptions',function(err,doc){
            if(err)
            {
                console.log(err);
                reject(err);
            }

            resolve(doc);
        })
    })
}

async function substancetypes(id)
{
    return new Promise((resolve,reject)=>{
        if(id.length == 0)
        {
            resolve({});   
        }
        

        conn.query('Select * from substancetypes where SubstanceId in (' + id.join(',') + ')',function(err,doc){
            if(err)
            {
                reject(err);
            }

            var data = {};

            for(item in doc)
            {
                if(!data[doc[item].SubstanceId])
                {
                    data[doc[item].SubstanceId] = [];
                }

                data[doc[item].SubstanceId].push(doc[item]);
            }
            resolve(data);
        })
    })
}

async function getsubstancestatus(id)
{
    return new Promise((resolve,reject)=>{
        if(id.length == 0)
        {
            resolve({});   
        }
    
        conn.query('Select * from substanceusestatuses where SubstanceId in (' + id.join(',') + ')',function(err,doc){
            if(err)
            {
                reject(err);
            }

            var data = {};

            for(item in doc)
            {
                if(!data[doc[item].SubstanceId])
                {
                    data[doc[item].SubstanceId] = [];
                }

                data[doc[item].SubstanceId].push(doc[item]);
            }
            resolve(data);
        })
    })
}

async function getsubstanceunit(id)
{
    return new Promise((resolve,reject)=>{
       if(id.length == 0)
        {
            resolve({});   
        }
    
        conn.query('Select * from substanceunits where SubstanceId in (' + id.join(',') + ')',function(err,doc){
            if(err)
            {
                reject(err);
            }

            var data = {};

            for(item in doc)
            {
                if(!data[doc[item].SubstanceId])
                {
                    data[doc[item].SubstanceId] = [];
                }

                data[doc[item].SubstanceId].push(doc[item]);
            }
            resolve(data);
        })
    })
}

module.exports = {
    get:get
}