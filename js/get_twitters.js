getTwitters('paxLines', { 
	id: 'pax_lines', 
	count: 3, 
	enableLinks: true, 
	ignoreReplies: true, 
	clearContents: true,
	template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
});
getTwitters('officialPax', { 
	id: 'Official_PAX', 
	count: 6, 
	enableLinks: true, 
	ignoreReplies: true, 
	clearContents: true,
	template: '<p>%text%</p><a class="time" href="http://twitter.com/%user_screen_name%/statuses/%id%/">%time%</a>'
});