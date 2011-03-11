$(document).ready(function() {
  function addTweet(tweet, selector, max_count, show_user) {
    var container = $(selector);
    if (container.length > 0 && container.find("[data-tweet-id='" + tweet.id_str + "']").length == 0) {
      var tweet_el = $('<li data-tweet-id="' + tweet.id_str + '"></li>');
      if (show_user) {
        tweet_el.append('<div class="screen_name">' + tweet.user.screen_name + '</div>');
        tweet_el.css({ 'background-image': 'url(' + tweet.user.profile_image_url + ')' });
      }
      var tweet_html = '<p>' + TwitterText.auto_link(tweet.text) + '</p><a class="time" href="http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '/"><abbr title="' + tweet.created_at + '">' + tweet.created_at + '</abbr></a>';
      tweet_el.append(tweet_html);
      tweet_el.find('abbr').timeago();
      container.prepend(tweet_el);
      var li_selector = 'li:gt(' + (max_count - 1) + ')';
      container.find(li_selector).remove();
    }
  }

  var socket = new io.Socket(); 
  socket.connect();
  socket.on('message', function(message){
    message = $.parseJSON(message);
    if (message.type == 'user' && message.data.tweet.text.match(/^@/) == null) {
      if (message.data.tweet.user.screen_name.toLowerCase() == 'pax_lines') {
        addTweet(message.data.tweet, '#paxLines', 2); 
      } else if (message.data.tweet.user.screen_name.toLowerCase() == 'official_pax') {
        addTweet(message.data.tweet, '#officialPax', 4); 
      } else if (message.data.tweet.user.screen_name.toLowerCase() == 'tt_hq') {
        addTweet(message.data.tweet, '#paxTourney', 5); 
      }
    } else if (message.type == "keyword" && message.data.keyword.toLowerCase() == "#ttlfg" ) {
      addTweet(message.data.tweet, "#ttlfg", 7, true);
    } else if (message.type == "delete") {
      $("[data-tweet-id='" + message.data.id_str + "']").remove();
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

