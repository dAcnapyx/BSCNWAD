function addTemplate() {
	resetBodyShortcuts();
	askFor("Template name", '', function(name) {
		if (name === '' || name === 'exit') { /* when empty name entered -> do nothing */
			editTemplate( 'silent' )
			return false
		} 
		/* set data and send to the server */
		else {
			$('#dAction').val('addTemplate(req, res)') /* set the action : add */
			$('#dField').val(name) /* set the field */
			hideMFE() /* show info */
			$('#dInfo').html('Adding Template...').removeClass('hide')
			$('#btn_y, #btn_n').addClass('hide') /* hide buttons */
			window.document.getElementById('dForm').submit() /* submit form */
		}
	})
}

function editTemplate( mode ) {
	resetBodyShortcuts();
	if ( typeof mode === 'undefined') {
		mode = '';
	}
	/* set onclick function on each selectable item */
	$('[si="true"]').each(function() { /* si = selectable item */
		$(this).click(function() {
			$('#dAction').val('editTemplate(req, res)') /* set the action : edit */
			$('#dField').val( $(this).html() ) /* set the field to be template name */
			$('#dInfo').html('Loading Template...').removeClass('hide') /* show info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit()
		})
	})
	if ( mode != 'silent' ) {
		showMF() /* clear dForm, hide dMenu, and show dForm */
		$('#dInfo').html('Click on Template to Edit it').removeClass('hide') /* show info */
		$('#btn_n').click(function() { /* configure and show cancel button */
			/* removing the action on selectable elements */
			$('[si="true"]').each(function() { /* si = selectable item */
				$(this).unbind( "click" )
			})
			hideMF()
			editTemplate( 'silent' )
		})
		.removeClass('hide').focus()
		enableEscCancel()
	}
}

function delTemplate() {
	resetBodyShortcuts();
	/* set onclick function on each selectable item */
	$('[si="true"]').each(function() { /* si = selectable item */
		$(this).click(function() {
			$('#dAction').val('delTemplate(req, res)') /* set the action : del */
			$('#dField').val( $(this).html() ) /* set the field to be template name */
			$('#dInfo').html('Deleting Template...').removeClass('hide') /* show info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit() /* submit request */
		})
	})
	showMF() /* clear dForm, hide dMenu, and show dForm */
	$('#dInfo').html('Click on Template to Delete it').removeClass('hide') /* show info */
	$('#btn_n').click(function() { /* show cancel button */
		/* removing the action on selectable elements */
		$('[si="true"]').each(function() { /* si = selectable item */
			$(this).unbind( "click" )
		})
		hideMF()
		editTemplate( 'silent' )
	})
	.removeClass('hide').focus()
	enableEscCancel()
}

function importTemplate() {
	resetBodyShortcuts();
	$( '#dFileCon' ).remove() /* remove dFileCon if present */
	showMF() /* clear dForm, hide dMenu, and show dForm */
	/* set buttons actions */
	$( '#btn_y' ).click( function() {
		/* set the action : import */
		$( '#dAction' ).val( 'importTemplate( req, res )' )
		window.document.getElementById( 'dForm' ).submit()
	})

	$( '#btn_n' ).click( function() {
		hideMF()
		editTemplate( 'silent' )
		if (typeof callback === "function") {
			callback('')
		}
	})
	if ( typeof $( '#dFileCon' ).attr( 'id' ) === 'undefined' ) { /* only when not already added */
		$( '#dField' ).before( '<span class="navbar-btn btn btn-info btn-file" id="dFileCon">Browse <input type="file" id="dFile" name="dFile"></span>' ) /* add file upload input to dForm */
	}
	/* change dForm enctype method */
	$( '#dForm' ).attr( 'enctype', 'multipart/form-data' )
	$( '#btn_y' ).removeClass( 'hide' )
	$( '#btn_n' ).removeClass( 'hide' ).focus()
	enableEscCancel()
}

function backToRoutes() {
	$('#dAction').val('backToRoutes(req, res)') /* set the action : back to previous module (routes) */
	window.document.getElementById('dForm').submit() /* submit request */
}

editTemplate( 'silent' ) /* enable edit template functionality on all templates in silent mode (whithout displaying info) */