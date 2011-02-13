$(document).ready(function() {
  var socket = new io.Socket(); 
  socket.connect();
  socket.on('message', function(message){
    message = JSON.parse(message);
    if (message.type == 'user') {
      var el = $('<li><p>' + message.data.tweet.text + '</p><a class="time" href="http://twitter.com/' + message.data.tweet.user.screen_name + '/status/' + message.data.tweet.id + '/">' + message.data.tweet.created_at + '</a></li>');
      if (message.data.tweet.user.screen_name == 'pax_lines') {
        $('#paxLines').prepend(el);
      } else if (message.data.tweet.user.screen_name == 'Official_PAX') {
        $('#officialPax').prepend(el);
      }
    }
  }); 
  // Do I need this?
  // socket.on('disconnect', function(){ setTimeout(function() {socket.connect()}, 5000) }); 
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

