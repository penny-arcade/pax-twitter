$(document).ready(function() {
  function addTweet(tweet, selector, max_count) {
    var parsed_date = new Date(Date.parse(tweet.created_at));
    var date_str = parsed_date.format('h:MM tt mmm dS, yyyy');
    var tweet_el = $('<li><p>' + TwitterText.auto_link(tweet.text) + '</p><a class="time" href="http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '/">' + date_str + '</a></li>');
    var container = $(selector);
    container.prepend(tweet_el);
    var li_selector = 'li:gt(' + (max_count - 1) + ')';
    container.find(li_selector).remove();
  }

  var socket = new io.Socket(); 
  socket.connect();
  socket.on('message', function(message){
    message = JSON.parse(message);
    if (message.type == 'user' && message.data.tweet.text.match(/^@/) == null) {
      if (message.data.tweet.user.screen_name == 'pax_lines') {
        addTweet(message.data.tweet, '#paxLines', 2); 
      } else if (message.data.tweet.user.screen_name == 'Official_PAX') {
        addTweet(message.data.tweet, '#officialPax', 4); 
      }
    }
  }); 
  // Do I need this?
  var reconnectTimer;

  var reconnect = function() {
    if (reconnectTimer == null) {
      reconnectTimer = setTimeout(function() {
        socket.connect();
        reconnectTimer = null;
      }, 5000);
    }
  }
  socket.on('disconnect', reconnect);
  socket.on('connect_failed', reconnect); 
});


// Keeping this until we're happy with the new stuff
function twitterPoll() {


    getTwitters('paxLines', { 
        id: 'pax_lines', 
        count: 2, 
        enableLinks: true, 
        ignoreReplies: true, 
        clearContents: true,
        template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
    });
    getTwitters('officialPax', { 
        id: 'Official_PAX', 
        count: 4, 
        enableLinks: true, 
        ignoreReplies: true, 
        clearContents: true,
        template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
    });
}

