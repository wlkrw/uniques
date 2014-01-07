var express = require('express');
var app = express();
var redis = require('redis');
var db = redis.createClient();
var sha1 = require('crypto-js/sha1');
var async = require('async');

var settings = require('./settings');

app.post('/img', express.json(), function(req, res) {
  res.end('post it like you mean it: ' + req.body.filename);
});

app.get('/unique/:hash', function(req, res) {
  async.waterfall(
    [
      function(next){
        // get members of the set of image recs sharing this hash
        db.smembers('pics:'+req.params.hash, function(err, members) {
          if (err) next(err);
          next(null, members);
        });
      },
      function(members, next) {
        // bind each value of members to a function suitable for use w/ async.parallel
        async.map(
          members, 
          function(member, cb){
            cb(null, function(callback){ 
              db.hgetall(member, function(err, memberData){
                if (err) next(err);
                callback(null, memberData);
              }); 
            });
          },
          function(err, memberDatas){
            // get hashes for each image / member
            async.parallel(memberDatas, function(err, memberDatas){
              if (err) next(err);
              next(null,memberDatas);
            });
          }
        );
      }
    ],
    function(err, memberDatas){
      // memberDatas is an array of member objects representing the (duplicate) images of :hash in the route param
      if (err) {/* TODO send 500 ?*/ console.log(err)}
      res.send({"duplicates": memberDatas});
    }
  );
});

app.get('/uniques', function(req, res) {
  res.end('{uniques:[]}');  
});

console.log('running foo at ' + settings.port);
app.listen(settings.port);
