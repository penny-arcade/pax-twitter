$(document).ready(function() {
  function addTweet(tweet, selector, max_count) {
    var container = $(selector);
    if (container.length > 0) {
      var tweet_el = $('<li><p>' + TwitterText.auto_link(tweet.text) + '</p><a class="time" href="http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '/"><abbr title="' + tweet.created_at + '">' + tweet.created_at + '</abbr></a></li>');
      tweet_el.find('abbr').timeago();
      container.prepend(tweet_el);
      var li_selector = 'li:gt(' + (max_count - 1) + ')';
      container.find(li_selector).remove();
    }
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
      } else if (message.data.tweet.user.screen_name == 'PAX_Tourney') {
        addTweet(message.data.tweet, '#PaxTourney', 2); 
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

