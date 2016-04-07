function addProject() {
	resetBodyShortcuts();
	askFor( "App Port", '', function ( port ) {
		if ( port !== 'exit' ) {
			port = parseInt( port ) /* make sure port is number */
			if ( port == '' || isNaN( port ) || port == '0' ) { /* when empty or not a number or 0 -> set default 80 */
				port = 8080
			}
			$( '#dField' ).after( '<input type="hidden" id="dPort" name="dPort" value="' + port + '" />' ) /* add the port as hidden input after dField */
			askFor( "Project name", '', function ( name ) {
				if ( name === '' ) { /* when empty name -> do nothing */
					return false
				} 
				else if ( name === 'exit' ) { /* when 'exit' -> Hide Menu Form and Show Main Menu */
					hideMF()
					editProject( 'silent' )
				}
				else {
					$( '#dField' ).val( name ) /* populate dField with name  */
					/* Add this line before form submit to enable server debug output : $( '#dField' ).after( '<input type="hidden" name="debug" value="true" />' ) /* add debug option */
					$( '#dAction' ).val( 'addProject( req, res )') /* set the action : add */
					hideMFE() /* hide Menu Form Elements */
					$('#btn_y, #btn_n').addClass('hide') /* hide buttons */
					$('#dInfo').html('Adding Project...').removeClass('hide') /* show action info */
					window.document.getElementById('dForm').submit() /* submit form */
				}
			})
		}
		else { /* when 'exit' -> Hide Menu Form and Show Main Menu */
			hideMF()
			editProject( 'silent' )
		}		
	})
}

function editProject( mode ) {
	resetBodyShortcuts();
	if ( typeof mode === 'undefined') {
		mode = '';
	}
	$('[si="true"]').each(function() { /* si = selectable item | set onclick function on each selectable item */
		$(this).click(function() {
			$('#dAction').val('editProject(req, res)') /* set the action : edit */
			$('#dField').val( $(this).html() ) /* set the field to be project name */
			$('#dInfo').html('Loading Project...').removeClass('hide') /* show info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit() /* submit form */
		})
	})
	if ( mode != 'silent' ) {
		showMF() /* clear form, hide menu, and show form container */
		$('#dInfo').html('Select Project to Edit it').removeClass('hide') /* show action info */
		$('#btn_n').click(function() { /* set and show cancel button */
			$('[si="true"]').each(function() { /* si = selectable item | removing the action on selectable elements */
				$(this).unbind( "click" ) /* remove onclick function */
			})
			hideMF() /* Hide Menu Form */
			editProject( 'silent' )
		}).removeClass('hide').focus()
		enableEscCancel()
	}
}

function delProject() {
	resetBodyShortcuts();
	$('[si="true"]').each(function() { /* si = selectable item | set onclick function on each selectable item */
		$(this).click(function() {
			$('#dAction').val('delProject(req, res)') /* set the action : del */
			$('#dField').val( $(this).html() ) /* set the field to be project name */
			$('#dInfo').html('Deleting Project...').removeClass('hide') /* show action info */
			$('#btn_n').addClass('hide') /* hide cancel button */
			window.document.getElementById('dForm').submit() /* submit form */
		})
	})
	showMF() /* clear form, hide menu, and show form container */
	$('#dInfo').html('Select Project to Delete it').removeClass('hide') /* show action info */
	$('#btn_n').click(function() { /* show cancel button */
		$('[si="true"]').each(function() { /* si = selectable item | removing the action on selectable elements */
			$(this).unbind( "click" )
		})
		hideMF()
		editProject( 'silent' )
	}).removeClass('hide').focus()
	enableEscCancel()
}

editProject( 'silent' ) /* enable edit project functionality on all projects in silent mode (whithout displaying info) */