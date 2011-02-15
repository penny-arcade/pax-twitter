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
	getTwitters('paxTourney', { 
        id: 'pax_tourney', 
        count: 2, 
        enableLinks: true, 
        ignoreReplies: true, 
        clearContents: true,
        template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
    });
}

twitterPoll();

setInterval("twitterPoll()", 50000);