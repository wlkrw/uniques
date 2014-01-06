var express = require('express');
var app = express();
var redis = require('redis');
var db = redis.createClient();
var sha1 = require('crypto-js/sha1');

var settings = require('./settings');

app.post('/img', express.json(), function(req, res) {
  res.end('post it like you mean it: ' + req.body.filename);
});

app.get('/unique/:hash', function(req, res) {
  res.end(req.params.hash);
});

app.get('/uniques', function(req, res) {
  res.end('{uniques:[]}');  
});

console.log('running foo at ' + settings.port);
app.listen(settings.port);
