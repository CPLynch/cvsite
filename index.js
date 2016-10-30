var express =  require('express');
var app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
	res.sendFile(__dirname+'/public/home.html', function(err){
		if (err){
			console.log('There was an error: '+ err)
		}
	});
});

app.listen(3000, function(){console.log('app running on port 3000')});