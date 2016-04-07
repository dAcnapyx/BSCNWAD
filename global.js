function askFor( placeholder, default_val, callback ) {
	var key_handled = false /* used to prevent double action with one hit of key */
	/* clear form, hide menu, and show form container */
	showMF()
	/* set buttons actions */
	$( '#btn_y' ).click(function() {
		var val = $( '#dAField' ).val()
		if ( typeof callback === 'function' ) {
			callback( val )
		}
	})

	$( '#btn_n' ).click(function() {
		hideMF()
		if ( typeof callback === 'function' ) {
			callback('exit')
		}
	})

	/* prepare the input */
	$( '#dAField' ).prop( 'placeholder', placeholder )
		.val( default_val )
		.prop( 'type', 'text' )
		.keydown( function ( event ) { /* bind down listner */
			if ( event.keyCode == 13 ) { /* when enter key pressed -> prevent default behavior */
				event.preventDefault()
			}
		})
		.keyup( function ( event ) { /* bind keyup listner */
			if (event.keyCode == 27) { /* when esc key pressed -> simulate click on cancel button */
				$('#btn_n').click()
				return
			}
			if ( event.keyCode == 13 ) { /* when enter key pressed -> simulate click on ok button */
				if ( !key_handled ) {
					key_handled = true
					$('#btn_y').click()
					return
				}			
			}
		})
		.removeClass( 'hide' )
		.focus()
	
	/* show the buttons */
	$( '#btn_y, #btn_n' ).removeClass( 'hide' )
}

/* MFE = Menu Form Elements */
function clearMFE() {
	/* remove the placeholder and value of dField */
	$( '#dField' ).prop( 'placeholder', '' )
	.val('')
	.prop( 'type', 'hidden' )

	/* remove the placeholder and value of dAField */
	$( '#dAField' ).prop( 'placeholder', '' )
	.val('')
	.addClass( 'hide' )
	
	/* remove dInfo and hide it */
	$( '#dInfo' ).html('').addClass( 'hide' )
	
	/* hide buttons */
	$( '#btn_y, #btn_n' ).addClass( 'hide' ).unbind( 'click' )
}

/* MFE = Menu Form Elements */
function hideMFE() {
	/* hide dField */
	$( '#dField' ).prop( 'type', 'hidden' )

	/* hide dAField */
	$( '#dAField' ).addClass( 'hide' )

	/* clear suggests pop-up and hide it */
 	$( '#dSuggests' ).val('').addClass( 'hide' )
 	/* reset selection index */
	cur_sel_index = 0
	/* reset suggest items counter */
	max_sel_itms = 0
	
	/* remove dInfo and hide it */
	$( '#dInfo' ).addClass( 'hide' )
	
	/* hide buttons */
	$( '#btn_y, #btn_n' ).addClass( 'hide' )
}

/* MF = Menu Form */
function showMF() {
	/* clear Menu Form Beafore each showing : the data of the form is set from the local module functions */
	clearMFE()

	/* hide the main menu */
	$( '#dMenu' ).addClass( 'hide' )
	
	/* unhide the container of the ask form */
	$( '#dFormCon' ).removeClass( 'hide' )
}

/* MF = Menu Form */
function hideMF() {
	$( '#dFormCon' ).addClass( 'hide' ) /* hide the form */
	$( '#dMenu' ).removeClass( 'hide' ) /* show the menu */
	$( '#btn_y, #btn_n' ).unbind( 'click' ) /* remove buttons click functionality */
	enableBodyMenuShortcuts() /* enable menu keyboard shortcuts */
}