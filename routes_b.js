function addRoute() {
	resetBodyShortcuts();
	askFor("Route name", '', function(name) {
		if (name === '' || name === 'exit') { /* when empty name entered -> do nothing */
			editRoute( 'silent' )
			return false
		} 
		/* set data and send to the server */
		else {
			$('#dAction').val('addRoute(req, res)') /* set the action : add */
			$('#dField').val(name) /* set the field */
			hideMFE() /* show info */
			$('#dInfo').html('Adding Route...').removeClass('hide')
			$('#btn_y, #btn_n').addClass('hide') /* hide buttons */
			window.document.getElementById('dForm').submit() /* submit form */
		}
	})
}

function editRoute( mode ) {
	resetBodyShortcuts();
	if ( typeof mode === 'undefined') {
		mode = '';
	}
	/* set onclick function on each selectable item */
	$('[si="true"]').each(function() { /* si = selectable item */
		$(this).click(function() {
			$('#dAction').val('editRoute(req, res)') /* set the action : edit */
			$('#dField').val( $(this).html() ) /* set the field to be route name */
			$('#dInfo').html('Loading Route...').removeClass('hide') /* show info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit()
		})
	})
	if ( mode != 'silent' ) {
		showMF() /* clear form, hide menu, and show form container */		
		$('#dInfo').html('Select Route to Edit it').removeClass('hide') /* show info */
		$('#btn_n').click(function() { /* configure and show cancel button */
			/* removing the action on selectable elements */
			$('[si="true"]').each(function() { /* si = selectable item */
				$(this).unbind( "click" )
			})
			hideMF()
			editRoute( 'silent' )
		}).removeClass('hide').focus()
		enableEscCancel()
	}
}

function delRoute() {
	resetBodyShortcuts();
	/* set onclick function on each selectable item */
	$('[si="true"]').each(function() { /* si = selectable item */
		$(this).click(function() {
			$('#dAction').val('delRoute(req, res)') /* set the action : del */
			$('#dField').val( $(this).html() ) /* set the field to be route name */
			$('#dInfo').html('Deleting Route...').removeClass('hide') /* show info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit() /* submit request */
		})
	})
	showMF() /* clear form, hide menu, and show form container */
	$('#dInfo').html('Select Route to Delete it').removeClass('hide') /* show info */
	$('#btn_n').click(function() { /* configure and show cancel button */
		/* removing the action on selectable elements */
		$('[si="true"]').each(function() { /* si = selectable item */
			$(this).unbind( "click" )
		})
		hideMF()
		editRoute( 'silent' )
	}).removeClass('hide').focus()
	enableEscCancel()
}

function backToProjects() {
	$('#dAction').val('backToProjects(req, res)') /* set the action : back to previos module (projects) */
	window.document.getElementById('dForm').submit() /* submit request */
}

editRoute( 'silent' ) /* enable edit route functionality on all routes in silent mode (whithout displaying info) */