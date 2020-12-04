var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);


function get(params,callback)
{
    var query_array = [];

    for(item in params)
    {
        query_array.push(item + " like '%" + params[item] + "%'");
    }


    var query = "Select * from locations";
    
    if(query_array.length > 0)
    {
        query += " where " + query_array.join(' and '); 
    }


    conn.query(query,function(err,doc){
        if(err)
            throw err;
        callback(doc);
    })
}

module.exports = {
    get:get
}