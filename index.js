var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var connectionString = process.env.DATABASE_URL|| "postgres://tabayrafa:300350087@depot:5432/tabayrafa_jdbc";

var client = new pg.Client(connectionString);
client.connect();

var app = express();
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); //we are going to use the middleware to parse the json data

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {
    console.log('Example app listening on port' + port);
});

app.get('/test_database',function(req,res) {
    //SQL Query > Select Data
    var query = client.query("Select * from todo");
    var results= [];

    query.on('row', function(row){
        results.push(row);
    });
    query.on('end',function(){
        res.json(results);
    });
    //useful for debugging
    query.on('error',function(err){
        console.log(err);
    })
});

app.post('/task_add/:taskName',function(req,res) {
    //This querying to our databse,
    var task = req.params.taskName;
    var query_string = "insert into todo (task,done) values ('" + task + "',false)";
    var query = client.query(query_string);

    query.on('end', function(){
        getID(res);
    });
    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);
    });

});


app.put('/task_done/:boolean/:id',function(req,res) {
    //SQL Query > Select Data
    var booleanDone= req.params.boolean;
    var idNumber = req.params.id;
    var query = client.query("update todo set done = '"+booleanDone+ "' where id = '" + idNumber + "'");

    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);
    });

    query.on('end',function(){
        res.sendStatus(200);
    });

});

app.put('/task_edit/:editedTask/:id',function(req,res) {
    var idNumber = req.params.id;
    var taskName= req.params.editedTask;
    var query = client.query("update todo set task = '"+taskName+ "' where id = '" + idNumber + "'");

    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);

    });
    query.on('end',function(){
        res.sendStatus(200);
    });
});

app.delete('/delete_task/:id',function(req,res) {
    var idNumber = req.params.id;
    var query = client.query("delete from todo where id = '" + idNumber + "' ");

    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);

    });
    query.on('end',function(){
        res.sendStatus(200);
    });


});


app.get('/task_display',function(req,res) {
    var query = client.query("Select * from todo");
    var results= [];

    query.on('row', function(row){
        results.push(row);
    });
    query.on('end',function(){
        res.json(results);
    });
    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);

    })
});


app.put('/task_updateTodoList/:id_todo',function(req,res) {
    //SQL Query > Select Data
    var id= req.params.id_todo;
    var query = client.query("update todo set done = 'false' where id = '" + id + "'");

    query.on('end',function(){
        res.sendStatus(200);
    });
    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);
    });
});

app.put('/task_updateCompleteList/id_todo',function(req,res) {
    //SQL Query > Select Data
    var id= req.params.id_todo;
    var query = client.query("update todo set done = 'true' where id = '" + id + "'");
    query.on('end',function(){
        res.sendStatus(200);
    });
    query.on('error',function(err){
        console.log(err);
        res.sendStatus(err.statusCode);
    });
});


function getID(res){

    var query_string = "select MAX(id) from todo";
    var query = client.query(query_string);
    var number;
    query.on('row', function(row){
        res.send(row);
    });


}