require.paths.unshift(__dirname + '/node_modules/express/support');
var sys = require('sys'),
  fs = require('fs'),
  http = require('http'),
  io = require('socket.io'),
  express = require('express'),
  TwitterNode = require('twitter-node/lib/twitter-node').TwitterNode;

var config = JSON.parse(fs.readFileSync("config.json", 'ascii'));
  
var followed_user_tweets = {},
  followed_keyword_tweets = {};

fs.readFile("cache.json", function(err, data) {
  if (err) {
    console.log('Your cache file could not be found or could not be read. Your data will not be persisted.');
  }
  else {
    var cacheData = {};

    try {
      cacheData = JSON.parse(data.toString('ascii'));
    } catch (e) {
      console.log('Your cache file is not valid JSON. Could not recover any data.');
    }
    followed_user_tweets = cacheData.followed_user_tweets || {};
    followed_keyword_tweets = cacheData.followed_keyword_tweets || {};

    setInterval(function () {
      var cache = {
        followed_user_tweets: followed_user_tweets,
        followed_keyword_tweets: followed_keyword_tweets
      };
      fs.writeFile('cache.json', JSON.stringify(cache), function (err) {});
    }, 10000);
  }
});

var pax_tweets = new TwitterNode({
  user: config.username,
  password: config.password,
  track: config.follow_keywords,
  follow: config.follow_users
});

function formatMessage(type, payload) {
  return JSON.stringify({
    type: type,
    data: payload
  })
}

function broadcastData(type, payload) {
  io.broadcast(formatMessage(type, payload));
}

function sendData(conn, type, payload) {
  conn.send(formatMessage(type, payload));
}

var app = express.createServer();

app.configure(function() {
  app.use(express.staticProvider(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.redirect('index.html');
});

app.listen(config.listen_port);

var io = io.listen(app);

io.on('connection', function(client) {
  for(var j in config.follow_users) {
    var user = config.follow_users[j];
    if (!(typeof followed_user_tweets[user] === "undefined")) {
      for(var i = followed_user_tweets[user].length - 1; i >= 0; i--) {
        sendData(client, 'user', {
          user: user,
          tweet: followed_user_tweets[user][i]
        });
      }
    }
  }
  for(var j in config.follow_keywords) {
    var keyword = config.follow_keywords[j];
    if (!(typeof followed_keyword_tweets[keyword] === "undefined")) {
      for(var i = followed_keyword_tweets[keyword].length - 1; i >= 0; i--) {
        sendData(client, 'keyword', {
          keyword: keyword,
          tweet: followed_keyword_tweets[keyword][i]
        });
      }
    }
  }
});

function inArray(arr, value) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i] == value)
      return true;
  }
  return false;
}

function idInArray(arr, value) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i].id == value)
      return true;
  }
  return false;
}

function addToCache(arr, value) {
  if (arr.unshift(value) > 25) {
    arr.splice(25, arr.length - 25);
  }
}

function deleteFromCaches(id_str) {
  for (var i in followed_user_tweets) {
    followed_user_tweets[i] = followed_user_tweets[i].filter(function(tweet){
      return (tweet.id_str != id_str); // return false (ie, filter out) if id_str matches
    });
  }

  for (var i in followed_keyword_tweets) {
    followed_keyword_tweets[i] = followed_keyword_tweets[i].filter(function(tweet){
      return (tweet.id_str != id_str); // return false (ie, filter out) if id_str matches
    });
  }
}

function deleteTweet(tweet) {
  deleteFromCaches(tweet.id_str);
  broadcastData('delete', {id_str: tweet.id_str});
}

function receivedTweet(tweet) {
  if(inArray(config.follow_users, tweet.user.id)) {
    followed_user_tweets[tweet.user.id] = followed_user_tweets[tweet.user.id] || [];
    addToCache(followed_user_tweets[tweet.user.id], tweet);
    broadcastData('user', {
      user: tweet.user.id,
      tweet: tweet
    });
  }
  for(var i in config.follow_keywords) {
    var keyword = config.follow_keywords[i];
    var pattern = new RegExp(keyword, "i");
    if (pattern.test(tweet.text)) {
      followed_keyword_tweets[keyword] = followed_keyword_tweets[keyword] || [];
      addToCache(followed_keyword_tweets[keyword], tweet);
      broadcastData('keyword', {
        keyword: keyword,
        tweet: tweet
      });
    }
  }
}

pax_tweets.addListener('tweet', function(tweet) {
  receivedTweet(tweet);
});

var reconnectTimer = null;
var reconnect = function() {
  if (reconnectTimer) {
    console.log("Reconnect requested, but ignored");
  } else {
    reconnectTimer = setTimeout(function() {
      if (pax_tweets._clientResponse)
        pax_tweets._clientResponse.removeAllListeners("end");
      pax_tweets.stream();
      reconnectTimer = null;
    }, 15000);
  }
}


pax_tweets.addListener('end', function(statusCode) {
  console.log("Stream Closed with " + sys.inspect(statusCode));
  reconnect();
});

pax_tweets.addListener('error', function(err) {
  console.log(sys.inspect(err));
  reconnect();
});


function primeCache() {
  var twitter_client = http.createClient(80, "twitter.com");

  for (var i in config.follow_users) {
    (function() {
      var user = config.follow_users[i];
      console.log("Queueing cache prime for " + user);
      setTimeout(function() {
        console.log("Executing cache prime for " + user);
        var req = twitter_client.request('GET', '/statuses/user_timeline/' + user + '.json', {'host': 'api.twitter.com'});
        req.on('response', function(response) {
          if (response.statusCode == 200) {
            var body = "";
            response.setEncoding("utf8");
            response.on("data", function(chunk) {
              body += chunk;
            });
            response.on("end", function() {
              try {
                var timeline = JSON.parse(body);
                timeline.sort(function(a,b) {
                  return a.id - b.id;
                });

                var low_id = 0;
                followed_user_tweets[user] = followed_user_tweets[user] || []
                if (followed_user_tweets[user].length > 0)
                  low_id = followed_user_tweets[user][followed_user_tweets[user].length-1].id;
                for(var j in timeline) {
                  if(!idInArray(followed_user_tweets[user], timeline[j].id) && timeline[j].id > low_id) {
                    receivedTweet(timeline[j]);
                  }
                } 
              } catch (err) {
                console.log(sys.inspect(err));
              }
            });
          } else {
            console.log("Failed to collect status for " + user);
          }
        });
        req.end();
      }, 1000 * i);
    })();
  }
}
 
var setupStream = function() {
  primeCache();
  if (pax_tweets._clientResponse)
    pax_tweets._clientResponse.removeAllListeners("end");
  pax_tweets.stream();
}


function extend(a, b) {
  Object.keys(b).forEach(function (key) {
    a[key] = b[key];
  });
  return a;
}

var basicAuth = function basicAuth(user, pass) {
  return "Basic " + new Buffer(user + ":" + pass).toString('base64');
};

pax_tweets.stream = function stream() {
  console.log('New Stream');
  if (this._clientRequest) {
    this._clientRequest.abort();
  }

  if (this.action === 'filter' && this.buildParams() === '') return;

  var client  = this._createClient(this.port, this.host),
      headers = extend({}, this.headers),
      twit    = this,
      request;

  headers['Host'] = this.host;

  if (this.user) {
    headers['Authorization'] = basicAuth(this.user, this.password);
  }

  client.addListener('error', function(error) {
    twit.emit('error', error);
  });

  twit._clientRequest = client.request("GET", this.requestUrl(), headers);

  twit._clientRequest.addListener('response', function(response) {
    twit._clientResponse = response;

    response.addListener('data', function(chunk) {
      twit._receive(chunk);
    });

    response.addListener('end', function() {
      twit.emit('end', this);
      twit.emit('close', this);
    });
  });
  twit._clientRequest.end();
  return this;
};

setupStream();
setInterval( setupStream, 3600000); // Make sure we're still connected every hour
