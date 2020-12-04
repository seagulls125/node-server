var mysql = require('mysql');
var dataconfig = require('../../config/database.json');

var conn = mysql.createConnection(dataconfig);

function get(id,callback)
{
    if(!id)
    {
        callback({success:false});
    }
    conn.query('Select templateentries.* from templateentries,templates where templateentries.TemplateId = templates.Id and templates.NoteTypeId = ' + id + " and IsDefault = true",function(err,doc){
        if(!err)
        {   
            callback(doc);
        }
    })
}

module.exports = {
    get:get
}