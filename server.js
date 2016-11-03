var express =  require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 80;

app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/public/home.html', function(err){
		if (err){
			console.log('There was an error: '+ err)
		}
	});
});

app.get('/hello', function(req, res){
	res.send('hello everyone!');
});

app.listen(port, function(){console.log('app running on port '+port)});