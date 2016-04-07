scr_resolutions = [ /* initialize screen resolutions */
	{name: '10" Notebook', w: 1024, h: 600 }, 
	{name: '12" Notebook', w: 1024, h: 768}, 
	{name: '13" Notebook', w: 1280, h: 800}, 
	{name: '15" Notebook', w: 1366, h: 768}, 
	{name: '19" Desktop', w: 1440, h: 900}, 
	{name: '20" Desktop', w: 1600, h: 900}, 
	{name: '22" Desktop', w: 1680, h: 1050}, 
	{name: '23" Desktop', w: 1920, h: 1080}, 
	{name: '24" Desktop', w: 1920, h: 1200}, 
	{name: 'Kindle Fire HD 7" Portrait', w: 533, h: 853}, 
	{name: 'Kindle Fire HD 7" Landscape', w: 853, h: 533}, 
	{name: 'Kindle Fire Portrait', w: 600, h: 800}, 
	{name: 'Kindle Fire Landscape', w: 880, h: 600}, 
	{name: 'Samsung Galaxy Tab Portrait', w: 600, h: 1024}, 
	{name: 'Samsung Galaxy Tab Landscape', w: 1024, h: 600}, 
	{name: 'Google Nexus 7 Portrait', w: 603, h: 966}, 
	{name: 'Google Nexus 7 Landscape', w: 966, h: 603}, 
	{name: 'Apple iPad (All) Portrait', w: 768, h: 1024}, 
	{name: 'Apple iPad (All) Landscape', w: 1024, h: 768}, 
	{name: 'Kindle Fire HD 8.9" Portrait', w: 800, h: 1280}, 
	{name: 'Kindle Fire HD 8.9" Landscape', w: 1280, h: 800}, 
	{name: 'Motorola RAZR V3m Portrait', w: 176, h: 220}, 
	{name: 'Motorola RAZR V3m Landscape', w: 220, h: 176}, 
	{name: 'Motorola RAZR V8 Portrait', w: 240, h: 320}, 
	{name: 'Motorola RAZR V8 Landscape', w: 320, h: 240}, 
	{name: 'BlackBerry 8300 Portrait', w: 240, h: 320}, 
	{name: 'BlackBerry 8300 Landscape', w: 320, h: 240}, 
	{name: 'Apple Iphone 3/4 Portrait', w: 320, h: 480}, 
	{name: 'Apple Iphone 3/4 Landscape', w: 480, h: 320}, 
	{name: 'LG Optimus S Portrait', w: 320, h: 480}, 
	{name: 'LG Optimus S Landscape', w: 480, h: 320}, 
	{name: 'Samsung Galaxy S2 Portrait', w: 320, h: 533}, 
	{name: 'Samsung Galaxy S2 Landscape', w: 533, h: 320}, 
	{name: 'ASUS Galaxy 7 Portrait', w: 320, h: 533}, 
	{name: 'ASUS Galaxy 7 Landscape', w: 533, h: 320}, 
	{name: 'Apple Iphone 5 Portrait', w: 320, h: 568}, 
	{name: 'Apple Iphone 5 Landscape', w: 568, h: 320}, 
	{name: 'Samsung Galaxy S3/4 Portrait', w: 320, h: 640}, 
	{name: 'Samsung Galaxy S3/4 Landscape', w: 640, h: 320}, 
	{name: 'Samsung Galaxy S5 Portrait', w: 360, h: 640}, 
	{name: 'Samsung Galaxy S5 Landscape', w: 640, h: 360}, 
	{name: 'Apple Iphone 6 Portrait', w: 375, h: 667}, 
	{name: 'Apple Iphone 6 Landscape', w: 667, h: 375}, 
	{name: 'Apple Iphone 6 Plus Portrait', w: 414, h: 736}, 
	{name: 'Apple Iphone 6 Plus Landscape', w: 736, h: 414}
]

$( document ).ready(function() {
	var cur_win_w = $(window).width();
	var cur_win_h = $(window).height();
	/* populate screen resolutions in header menu select */
	scr_resolutions.forEach( function ( item, i ) {
		var selected = '';
		if ( Math.abs( cur_win_w - item.w ) < 30 ) {
			selected = 'selected="selected"';
		}
		$( '#scr_res_sel' ).append( '<option value="'+ i +'" '+ selected +'>'+ item.name +'</option>' );
	})
	/* activate on change of option to apply the new width and height of the main container */
	$( '#scr_res_sel' ).on( 'change', function( event ) {
		var i = $( '#scr_res_sel' )[0].selectedIndex;
		$( '#dIframe' ).css( 'width', scr_resolutions[ i ].w );
		$( '#dURL' ).css( 'width', scr_resolutions[ i ].w );
		$( '#dIframe' ).css( 'height', scr_resolutions[ i ].h );
	})
	/* activate windows resize to correct selected option */
	$( window ).resize( function() {
		on_win_res()
	});
	on_win_res();
	$( '#scr_res_sel' ).focus();
})

function on_win_res() {
	var cur_win_w = $(window).width();
	var cur_win_h = $(window).height();
	var found = false;
	scr_resolutions.forEach( function ( item, i ) {
		if ( Math.abs( cur_win_w - item.w ) < 30 && !found ) {
			$( "#scr_res_sel" ).val( i )
			found = true;
		}
	});
	var i = $( '#scr_res_sel' )[0].selectedIndex;
	$( '#dIframe' ).css( 'width', scr_resolutions[ i ].w );
	$( '#dURL' ).css( 'width', scr_resolutions[ i ].w );
	$( '#dIframe' ).css( 'height', scr_resolutions[ i ].h );
}

function backToTemplateEdit() {
	window.location.href = '/template_edit/'+ cur_project +'/'+ cur_route + '/' + cur_template;
}