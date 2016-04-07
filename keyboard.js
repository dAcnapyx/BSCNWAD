function enableBodyMenuShortcuts() {
	/* bind function to check if Shift + some predefined char from menu was pressed */
	$( document.body ).keydown( function( event ) {
			if ( event.shiftKey ) { /* disable normal keyboard functionality when shift pressed */
				event.preventDefault();
			}
		}).keyup( function( event ) {
		menu.forEach( function( val, index ) {
			if ( event.shiftKey && val.ch.toLowerCase() === String.fromCharCode( event.keyCode ).toLowerCase()) {
				event.preventDefault()
				/* if so activate the predefined function */
				$( '#mi_' + val.ch ).click()
			}
		})

		if ( event.keyCode === 13 ) { /* on enter -> pevent default action */
			event.preventDefault()
		}
	})
}

function enableEscCancel() {
	$( document.body ).keyup( function( event ) {
		if ( event.keyCode === 27 ) { /* when esc key pressed -> simulate click on cancel button */
			$( '#btn_n' ).click()
			return
		}
	})
}

function resetBodyShortcuts( callback ) {
	$( document.body ).unbind( 'keyup keydown' )
	$( '#dInfo' ).unbind( 'keyup keydown keypress focus blur change' );
	if ( typeof callback === 'function' ) {
		callback()
	}
}

$( function() { /* On Load -> Enable Menu Keyboard Shortcuts */
	enableBodyMenuShortcuts()
})