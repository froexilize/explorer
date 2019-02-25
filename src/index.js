const express = require('express');
	app = express(),
	swig = require('swig');


swig.setDefaults({ cache: false });
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', './pages/');

global.makeRequest = require('./request');

var server = app.listen(8080, function () {
	console.log('Rasmart webserver started');
});


app.get('/', function(req, res) {
  res.render('index', { title: 'Blocks list' });
});

app.get('/transaction', function(req, res) {
  res.render('transaction', { title: 'Transaction info' });
});

app.get('/transactions', function(req, res) {
  res.render('transactions', { title: 'Transactions list' });
});

app.use(express.static('./pages/'));


app.get("/api/:method", (req, res, next) => {

	makeRequest(req.params.method, req.query).then(response => {
		res.send(response)
	}).catch(err => {
		console.log(err)
		res.status(400).send(err);
	})

})