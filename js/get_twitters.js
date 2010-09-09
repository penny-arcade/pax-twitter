function twitterPoll() {
    getTwitters('paxLines', { 
        id: 'pax_lines', 
        count: 2, 
        enableLinks: true, 
        ignoreReplies: true, 
        clearContents: true,
        trimUser: true,
        template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
    });
    getTwitters('officialPax', { 
        id: 'Official_PAX', 
        count: 4, 
        enableLinks: true, 
        ignoreReplies: true, 
        clearContents: true,
        trimUser: true,
        template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
    });
}

// The initial request
twitterPoll();

// We poll *much* faster at the conference (~5 sec)
// You should only change this if you have a whitelisted ip
setInterval("twitterPoll()", 5*1000);

// Reload the page once to clear the virtual memory
setTimeout("window.location.reload()", 30*60*1000);
