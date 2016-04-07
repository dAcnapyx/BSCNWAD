/* initialize suggest counters */
cur_sel_index = 0
max_sel_itms = 0
last_search_str = 'undefined' /* keeping last search string in order to skip ajax calls */
cur_sel_item_legth = 0 /* the lenght of the selected suggested item */
cur_attr_num = 1 /* pos handler when editing html tag  */
cur_max_attrs_num = 0 /* counter for currently edited html tag attributes */
cur_ap = 'v' /* track which part of the attribute we edit name/value */
last_action = '' /* track actions for better handling of actions while editing html tag */
multi_suggest = false /* sets a multivalue field input like for class attribute */
cur_sc_con = $('#dContent_con') /* current container cointaining selectable containers */
cur_sc = $('#dContent') /* currently marked selectable container for selecting */
cur_sc_index = 0 /* track selectable container siblings index */
wrap_selected_sc = false /* used on add smarty/html container selection to enable by pressing "r" key wraping selected container with the new one */
unwrap_selected_sc = false /* used on unwrap content by pressing "u" on "Del" functionality */
mouse_selection = true /* to enable/disable mouse selection when needed */
mouse_selection_handled = false /* to prevent double handling of middle mouse click */
enter_pressed = false /* to prevent double action with one press of enter key */
mouse_clicked = false /* track mouse click to check it when changing edited attribute/value */
tab_handled = false /* to prevent skipping adding new attribute with tab key */
buffer = '' /* initialize buffer for copy(cut)/paste operations */
preview_class = false /* flag wich tell us if we previewing class from suggest list */
cur_class = '' /* temp string to store current attribute class */
vars = [] /* current smarty template vars */
vars_db_info = [] /* store fetched info from db for creation of db queries */
suggest_vars = false /* flag to identify when to suggest smarty vars and when not */
cur_var_lvl = 0 /* used to keep current deepnes of multiarray */
cur_full_var = '' /* used when suggest multilevel variables to show only correct sub var suggest */
search_str = '' /* define search_str as global to have access to it in functions without need to pass it over */
skip_parse = false /* used to skip parsing smarty statements when such are included without html container */
db_tables = [] /* initialize empty db_tables collection */
/* initialize smarty modifiers (only the ones available in /node_modules/nsmarty/lib/nsmarty/parser.js) */
smarty_modifiers = [ 'capitalize', 'cat', 'count', 'count_characters', 'count_paragraphs', 'count_sentences', 'count_words', 'date_format', 'default', 'escape', 'indent', 'lower', 'nl2br', 'regex_replace', 'replace', 'spacify', 'string_format', 'strip', 'strip_tags', 'truncate', 'upper', 'wordwrap' ]
styled_objs = [] /* keep references to objects that have hard coded styles */
new_classes = [] /* initialize epmty collection for moved hard coded styles to classes on save  */
parents_stack = [] /* initialize epmty collection for saving currently scanned element (parent) */
index_stack = [] /* initialize epmty collection for saving current index before going deep in the rabit hole */
save_handled = false; /* preventing execution of saveTemplate twice in the same time */

function addHTMLorSS( event ) {
	resetBodyShortcuts();
	suggestFor(event, 'html_tags', 'Type/Select HTML Tag', '', function( name ) {
		enter_pressed = true /* set this to true to indicate that enter press was handled and stop double action */
		if (name !== '') {
			prepHtmlTag( name, function( html ) {
				clearMFE()
				$( '#dInfo' ).html('Select Container to Insert the HTML tag (hold shift to put it before or press "r" to wrap selected container)').removeClass("hide")

				$('#btn_n').click(function() { 
					resetBodyShortcuts( function() {
						$( '.popover' ).remove();
						resetDAField() /* remove (unbind) all current functionality on dAField */
						reset_scs() /* remove (unbind) all current functionality on all selectable containers */
						$('#selItmCon').remove() /* destroy selItmCon along with the content */
						hideMF() /* hide the form and show the menu */
					})
				})
				/* ask for insertion place */
				conSelector( html, function() {
					$( '#btn_y' ).click( function() { 
						checkAttrName() /* check if we need to update/remove attr */
						if ( preview_class ) { /* when previewing class -> remove it */
							removePreviewedClass()
						}
						tag_name = getCurTagName() /* get currently edited html tag name */
						if ( !skip_parse && tag_name != 'TEXTAREA') {
							parse_smarty() /* parse smarty statements and html tags */
						}
						else {
							skip_false = false /* reset the flag when used */
						}
						/* unwrap the finished html tag from selItmCon */
						kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
						$(kids[0]).unwrap() /* destroy selItmCon leaving the content */
						resetDAField()
						hideMF() /* hide the form and show the menu */
					})
					reset_scs() /* remove (unbind) all current functionality on all selectable containers */
					resetBodyShortcuts() /* enable normal keyboard functioning */
					if ( html.indexOf( 'nsmarty_code' ) != -1 ) { /* when smarty statement detected -> skip double parsing of smarty statements and finish adding */
						skip_parse = true
						$('#btn_y').click()
					}
					else { /* otherwise -> enable smarty parsing and go to edit currently added html */
						skip_parse = false
						editHTMLTag( html, function() {
							$('#btn_y').click()
						})
					}
				})
				/* show the buttons */
				$('#btn_y, #btn_n').removeClass("hide")
			})
		}
		else {
			hideMF() /* hide the form and show the menu */
		}
	})
}

function editHTMLorSS( event ) {
	resetBodyShortcuts();
	hideSuggests();
	showMF() /* clear form, hide menu, and show form container */
	$( '#dInfo' ).html('Select Container to Edit').removeClass("hide")
	conSelector( '', function() {
		resetBodyShortcuts() /* enable normal keyboard functioning */
		resetDAField() /* remove (unbind) all current functionality on dAField */
		reset_scs() /* remove (unbind) all current functionality on all selectable containers */
		var ee_html_str = $( cur_sc ).prop('outerHTML'); /* ee_html = edited element html string */
		cur_sc_start_html = ee_html_str.substr( 0, ee_html_str.indexOf('>') + 1 ); /* get only the selected sc opening html */
		if ( cur_sc_start_html.indexOf( 'nsmarty_code' ) == -1 ) { /* only when selected sc is not smarty code container */
			$( '#btn_y' ).click( function() { 
				checkAttrName() /* check if we need to update/remove attr */
				if ( preview_class ) { /* when previewing class -> remove the class from thre real html tag */
					removePreviewedClass()
				}
				kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
				$(kids[0]).unwrap() /* destroy selItmCon leaving the content */
				resetDAField()
				hideMF() /* hide the form and show the menu */
			}).removeClass( 'hide' )
			$( '#btn_n' ).click( function() { 
				if ( preview_class ) { /* when previewing class -> remove the class from thre real html tag */
					removePreviewedClass()
				}
				kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
				$(kids[0]).unwrap() /* destroy selItmCon leaving the content */
				resetBodyShortcuts() /* enable normal keyboard functioning */
				resetDAField() /* remove (unbind) all current functionality on dAField */
				reset_scs() /* remove (unbind) all current functionality on all selectable containers */
				hideMF() /* hide the form and show the menu */
			}).removeClass( 'hide' )
			editHTMLTag( cur_sc_start_html, function() {
				$('#btn_y').click()
			})
		}
		else {
			$( '#btn_y' ).click( function() { 
				checkAttrName() /* check if we need to update/remove attr */
				if ( preview_class ) { /* when previewing class -> remove it */
					removePreviewedClass()
				}
				/* unwrap the finished html tag from selItmCon */
				kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
				$(kids[0]).unwrap() /* destroy selItmCon leaving the content */
				resetDAField()
				hideMF() /* hide the form and show the menu */
			}).removeClass( 'hide' )
			$( '#btn_n' ).click( function() { 
				/* unwrap the finished html tag from selItmCon */
				kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
				$(kids[0]).unwrap() /* destroy selItmCon leaving the content */
				resetBodyShortcuts() /* enable normal keyboard functioning */
				resetDAField() /* remove (unbind) all current functionality on dAField */
				reset_scs() /* remove (unbind) all current functionality on all selectable containers */
				hideMF() /* hide the form and show the menu */
			}).removeClass( 'hide' )
			editHTMLTag( ee_html_str, function() {
				$( '#btn_y' ).click() /* cancel operation when try to edit smarty code sc */		
			})			
		}
	})
	$( '#btn_n' ).click( function() { 
		resetBodyShortcuts() /* enable normal keyboard functioning */
		resetDAField() /* remove (unbind) all current functionality on dAField */
		reset_scs() /* remove (unbind) all current functionality on all selectable containers */
		hideMF() /* hide the form and show the menu */
	}).removeClass( 'hide' )
}

function delHTMLorSS( event ) {
	resetBodyShortcuts();
	hideSuggests()
	showMF() /* clear form, hide menu, and show form container */
	$( '.popover' ).remove();
	$( '#dInfo' ).html('Select Container to Delete (Press "u" to activate unwrap mode)').removeClass("hide")
	$( '#btn_n' ).click( function() { 
		$( '.popover' ).remove();
		/* clear all event listners on all selectable contents */
		resetBodyShortcuts() /* enable normal keyboard functioning */
		reset_scs() /* remove (unbind) all current functionality on all selectable containers */
		hideMF() /* hide the form and show the menu */
	}).removeClass( 'hide' )
	conSelector( '', function() {
		reset_scs()
		resetBodyShortcuts( function() {
			if ( $( cur_sc ).attr( 'id' ) !== 'dContent' && $( cur_sc ).attr( 'id' ) !== 'dContent_con' ) { /* only delete when selected container is not dContent */
				$( cur_sc ).unwrap() /* unwrap selected element before deleting it */
				cur_sc.remove() /* the actual deleting of the element */
			}
			$( '.popover' ).remove();
			/* clear all event listners on all selectable contents */
			reset_scs() /* remove (unbind) all current functionality on all selectable containers */			
			cur_sc_con = $('#dContent_con') /* reset cur_sc_con to initial state */
			cur_sc = $('#dContent') /* reset cur_sc to initial state */
			delHTMLorSS( event ); /* re invoke delHTMLorSS for continious deletion of elements */
		})
	})
}

function editHTMLTag( html, callback ) {
	/* replace the brackets their equivalent entity names */
	html = html.replace(/</g, '&lt').replace(/>/g, '&gt')
	/* remove special attribute sc (selectable container) */
	html = html.replace('sc="true"', '')
	/* remove web editable atributes */
	html = html.replace('contenteditable="true"', '')
	html = html.replace('spellcheck="true" ', '')
	/* add editable functionality to each attribute */
	new_html = ''
	/* reset attr counters */
	cur_attr_num = 1
	cur_max_attrs_num = 0

	if ( html.indexOf(" ") != -1 ) { /* when attributes found -> get the tag name */
		var tag_start = html.substr( 0, html.indexOf( ' ' ) ) + ' ';
		if ( html.indexOf( '&gt&lt' ) != -1 ) { /* when not selfcontaining -> add the closing tag */
			var tag_end = '&gt&lt/' + tag_start.substr( 3, ( tag_start.length - 4 ) ) + '&gt';
		}
		else { /* otherwise -> just close the tag */
			var tag_end = '&gt';
		}
	}
	if ( html.indexOf( 'nsmarty_code' ) != -1 ) { /* when editing smarty statement */
		if ( html.indexOf( '&gt&lt' ) != -1 ) { /* when no html ( smarty statement ) value */
			$( '#btn_n' ).click(); /* simulate "cancel" button click */
		}
		else {
			new_html = html.replace( /&gt(.*?)&lt\/code/g, '&gt<span id="htv" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { editHTV() }">$1</span>&lt\/code' )
			$('#dInfo').html('<code>'+new_html+'</code>')
			editHTV()
		}
	}
	else {
		attr_arr = html.match(/ ([^"]*)=\"([^"]*)\"/g);
		if ( attr_arr != null ) {
			attr_arr.forEach(function( attr, i ) {
				attr_arr[i] = attr.substr( 1, attr.length ).replace(/"/g, '');
				/* wrap each attrubute's value in contaniner which is used to access and edit the value */
				if (attr.indexOf('&lt') == -1 && attr.indexOf('&gt') == -1) { /* skip < and > items - leaving only the actual attrubites of the html string */
					attr_parts = attr.split("=")
					attr_parts[0] = attr_parts[0].replace(/ /g, ''); /* remove unwanterd spaces from attribute name */
					attr_parts[1] = attr_parts[1].replace(/"/g, ''); /* remove the '"' from attribute value */
					cur_max_attrs_num++
					src_btn = '' /* initialize empty string which is used ( populated ) only for src attribute */
					if ( attr_parts[ 0 ] == 'src' ) { /* when current attribute is src -> add browse button */
						src_btn = '<span class="btn btn-info btn-file" id="dFileCon"><div id="fileuploader"></div></span><script>$("#fileuploader").uploadFile({ url:"/uploader", fileName:"srcFile", onSuccess:function(files,data,xhr,pd) { data = data.replace( /"/g, "" ); $("#eav_' + cur_max_attrs_num + '").html( data ); kids = $( "#selItmCon" ).children(); $( kids[0] ).attr( "src", data ) } })</script>'
					}
					attr = '<span class="eac" id="ean_' + cur_max_attrs_num + '" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { cur_attr_num = ' + cur_max_attrs_num + '; editAttr(' + cur_max_attrs_num + ', \'n\') }" last-val="' + attr_parts[ 0 ] + '">' + attr_parts[ 0 ] + '</span>="<span class="eac" id="eav_' + cur_max_attrs_num + '" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { cur_attr_num = ' + cur_max_attrs_num + '; editAttr(' + cur_max_attrs_num + ', \'v\') }">' + attr_parts[ 1 ].replace(/"(.*?)"/g, '$1') + '</span>"' + src_btn
				}
				new_html += attr+' '
				/* if it's just before last element add option to add new attribute(s) */
				if (i+1 == attr_arr.length) {
					new_html += ' <a class="btn btn-success btn_ana" id="btn_ana" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { addAttr() }">+</a> '
				}
			})
		} else {
			/* if there is no attributes add option to add new one */
			new_html = ' <a class="btn btn-success btn_ana" id="btn_ana" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { addAttr() }">+</a> '
			setTimeout(function() { /* slow addAttr a bit in order to have time to create btn_ana element */
				addAttr( false )
			}, 1 )
		}
		new_html = tag_start + new_html + tag_end.replace(/&gt&lt/, '&gt<span id="htv" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { editHTV() }"></span>&lt') ;/* when the html tag is not selfcontaining (found '><' in the html string ) -> add value option */
		$('#dInfo').html('<code>'+new_html+'</code>')
		editAttr( cur_attr_num, cur_ap )
	}
}

function clearSelectedClass() {
	/* clear highlight class */
	$('.eac').each(function() {
		$( this ).removeClass( 'tc-lg tc-gy' )
	})
}

function addAttr( update ) {
	last_search_str = 'undefinded'
	if ( typeof update === 'undefined' ) { /* when 'update' is not present */
		update = true
	}
	if ( update ) {
		updateCurAttr( event )
	}
	cur_max_attrs_num++
	/* add empty attribute just before btn_ana */
	$('#btn_ana').before('<span class="eac" id="ean_'+cur_max_attrs_num+'" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { cur_attr_num = '+cur_max_attrs_num+'; editAttr('+cur_max_attrs_num+', \'n\') }" last-val="last-val"></span>="<span class="eac" id="eav_'+cur_max_attrs_num+'" onclick="mouse_clicked = true; if ( checkAttrName() != \'exit\') { cur_attr_num = '+cur_max_attrs_num+'; editAttr('+cur_max_attrs_num+', \'v\') }"></span>" ')
	cur_attr_num = cur_max_attrs_num
	cur_ap = 'n'
	tab_handled = true
	editAttr( cur_attr_num, cur_ap )
}

function editAttr( index, ap ) {
	suggest_type = 'attribute'
	mouse_clicked = false
	if ( last_action == 'editHTV' ) { /* when we was editing html tag value last -> remove the highlight class */
		$('#htv').removeClass('tc-gy')
	}
	else { /* otherwise we assume we was editing either attr name or it's value so clear all highlighted attr part */
		clearSelectedClass()
	}

	last_action = 'editAttr' /* update last action */

	if ( preview_class && $( '#ean_' + cur_attr_num ).html() != 'class' ) {
		removePreviewedClass()
	}

	if ( typeof ap == 'undefined' ) { /* when ap not present -> set it to be value edit as default */
		ap = 'v'
	}

	cur_ap = ap
	
	attr_val = $('#ea'+ ap +'_'+index).html() /* get attribute value as string */
	
	dAField = $('#dAField').removeClass('hide').val( attr_val ) /* set attr val to dAField and unhide it */

	multi_suggest = false /* reset to default */
	
	if ( $('#ean_'+index).html() == 'class' && cur_ap == 'v' ) { /* when edit class value -> set multi suggeset = true */
		multi_suggest = true
	}

	$('#dInfo').after(dAField)
	$('#dAField').unbind('keyup keydown focus blur change') /* detach events from previous use */
	if ( cur_ap == 'v' ) { 
		cur_tc = 'gy' /* different color for each attr part */
		if ( $('#ean_'+index).html() == 'src' ) {
			placeholder = 'Broswse or Drag & Drop File on "Browse" button for "'+ $('#ean_'+index).html() +'"'
		}
		else {
			placeholder = 'Type/Select value for "'+ $('#ean_'+index).html() +'"'
		}
	} 
	else { 
		cur_tc = 'lg' /* different color for each attr part */
		placeholder = "Type/Select attribute name"
	} 

	$('#ea'+ ap +'_'+index).addClass( 'tc-' + cur_tc )
	/* attach new events */	
	$('#dAField').addClass( 'input_ta' )
		.html( attr_val ) /* add default value if defined */
		.removeClass( "hide" ) /* show dAField */
		.focus( function( event ) {
			updateTAHeight()
			suggest( event, suggest_type, 'dAField', 'dSuggests', 'ku', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest)
		})
		.keyup(function(event) { /* setup on key up/down to catch what is writen and suggest items based on that */
			if (event.keyCode == 27) {
				$('#btn_n').click()
				return
			}
			if ( event.shiftKey && event.keyCode == 72 && $('span#htv').length === 1 ) { /* when shift+h -> go directly to edit HTML value */
				editHTV()
				return
			}
			if ( event.shiftKey && event.keyCode == 13 ) { /* when shift+enter execute callback */
				$('#btn_y').click()
				return
			}
			if ($('#ean_'+index).html() == 'src' && cur_ap == 'v') { /* when editing src value */
				event.preventDefault() /* disable editing src value */
			}
			else {
				suggest( event, suggest_type, 'dAField', 'dSuggests', 'ku', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest)
				updateCurAttr( event )
				
				if ( cur_ap == 'v') { /* only when editing attribute value */
					updateRealAttr ( index )
				}
			}
		})
		.keydown(function(event) {
			if ($('#ean_'+index).html() == 'src' && cur_ap == 'v') { /* when editing src value -> enable only tab key */
				attrTabHandler( event )
				event.preventDefault() /* disable editing src value */
			}
			else {
				suggest( event, suggest_type, 'dAField', 'dSuggests', 'kd', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest)
				attrTabHandler( event )
			}
		})
		.change(function(event) {
			hideSuggests()
		})
		.blur(function(event) {
			setTimeout(function() { 
				hideSuggests()
			}, 100 );
		})
		.focus()
}

function editHTV() { /* HTV = HTML Tag Value */
	var mouse_clicked = false;
	var suggest_vars = false;
	var placeholder = 'Type/Select Content';
	var suggest_type = 'smarty_statement'; /* set default suggest type */
	var last_action = 'editHTV'; /* update last action */

	if ( preview_class ) {
		removePreviewedClass()
	}
	hideSuggests()
	clearSelectedClass()
	cur_ap = 'n'
	var cur_val = $('#htv').html() /* get attribute value as string */
	$('#htv').addClass('tc-gy')
	if ( cur_val == '&nbsp;' ) { /* when system space in place -> remove it */
		cur_val = ''
	}
	var dAField = $('#dAField').val(cur_val) /* get dAField object */
	$('#dAField').unbind('keyup keydown focus blur change').removeClass("hide") /* detach events from previous use */
	/* attach new events */	
	$('#dAField').attr('placeholder', placeholder)
		.addClass('input_ta') /* input_ta make the textarea less wide and more input like looking */
		.html(cur_val) /* add current va */
		.removeClass("hide") /* show dAField */
		.focus(function( event ) {
			updateTAHeight()
		})
		.keyup(function( event ) { /* setup on key up/down to catch what is writen and suggest items based on that */
			updateCurHTML( function() {
				suggest( event, suggest_type, 'dAField', 'dSuggests', 'ku', function( event ) { $('#btn_y').click() }, placeholder, true)
				updateRealHTML()
				updateTAHeight()
				if (event.keyCode == 27) {
					$('#btn_n').click()
					return
				}
				if ( event.keyCode == 13 ) { event.preventDefault(); } /* prevent default action of enter key */
				if ( event.shiftKey && event.keyCode == 13 ) { /* when shift+enter execute callback */
					$('#btn_y').click();
					return
				}
			})
		})
		.keydown(function( event ) {
			if ( event.keyCode == 13 ) { event.preventDefault(); } /* prevent default action of enter key */
			suggest( event, suggest_type, 'dAField', 'dSuggests', 'kd', function( event ) { $('#btn_y').click() }, placeholder, true)
			updateTAHeight()
			HTMLTabHandler( event )
			if ( event.keyCode == 13 && typeof callback === 'function' ) { /* when shift+enter execute callback */
				callback()
			}
			/* must suggest already catched smarty vars */
		})
		.change(function( event ) {
			updateRealHTML()
			hideSuggests()
		})
		.blur(function(event) {
			setTimeout(function() { 
				hideSuggests()
			}, 100 );
		})
		.focus()
}

function updateTAHeight() {
	contentHeight = $( '#dAField' ).textareaHelper( "height" )
	if ( contentHeight < 28 ) { contentHeight = 28 } /* when is empty correct the height to match one line */
	$( '#dAField' ).height( contentHeight )
}

function updateCurAttr( event ) {
	if ( last_action != 'editHTV' ) {
		cur_val = $( '#dAField' ).val() /* get currently edited value */
		if ( cur_val.substr( cur_val.length - 1, 1 ) == ' ' && event.keyCode == 9 ) { /* only when leaving editing and last char is space -> remove that space */
			cur_val = cur_val.substr( 0, cur_val.length - 1 )
		}
		if ( cur_ap == 'n' && cur_val == '' && event.keyCode == 9 && !tab_handled ) { /* when empty attribute name and tab pressed -> remove it */
			last_attr_name = $( '#ean_' + cur_attr_num ).attr( 'last-val' ) /* get last attr name */
			kids = $( '#selItmCon' ).children() 
			$( kids[0] ).removeAttr( last_attr_name ) /* removing the attribute from the real html tag */
			if ( handleReIndex( event ) == 'exit') { /* reindex attributes nums */
				hideSuggests()
				return 'exit'
			}
		}
		else { /* update the visual code text  */
			tab_handled = false /* reset tab flag */
			$( '#ea' + cur_ap + '_' + cur_attr_num ).html( cur_val ) /* put the value ot it's place (visual change only in editing form) */
			scrollToLastCodeChange()
		}
	}
}

function updateCurHTML( callback ) {
	cur_val = $( '#dAField' ).val() /* get currently edited value */
	$( '#htv' ).html( cur_val ) /* put the value ot it's place (visual change only in editing form) */
	scrollToLastCodeChange()
	if ( typeof callback === 'function' ) {
		callback()
	}
}

function updateRealAttr( index ) {
	if ( !tab_handled ) {
		attr_name = $( '#ean_' + index ).html() /* get currently edited attribute name */
		cur_val = $( '#eav_' + index ).html() /* get currently entered value */
		kids = $( '#selItmCon' ).children() /* select the edited element by getting childs of the selItemCon container */
		if ( typeof attr_name === 'undefined' ) { /* when ghost attr_name -> add new one */
			cur_attr_num = 1
			addAttr( false )
			return
		}
		if ( !preview_class && attr_name.length > 0 ) { /* only when not previewing class */
			$( kids[0] ).attr( attr_name, cur_val ) /* applying the changes to the current attribute */
		}
	}
}

function updateRealHTML() {
	cur_val = $('#dAField').val() /* get currently entered value */
	kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
	$(kids[0]).html( cur_val ) /* applying the changes */
}

function reIndexAttrs( event ) {
	realIndex = 0 /* set our index var */
	ric = 2 /* set counter ric = Real Index Counter */

	$('.eac').each(function ( index, item ) { /* iterate trough each eac (Editable Attribute Container) */
		/* correct the index to match ours */
		ric++
		if (ric > 2) {
			ric = 1
			realIndex++
		}
		if ( ric == 1 ) {
			cur_part_char = 'n'
		} else {
			cur_part_char = 'v'
		}
		$( item ).attr('id', 'ea'+cur_part_char+'_'+realIndex) /* set real index on every attr helper element in order to correct missing ones */
		$( item ).attr('onclick', 'if ( checkAttrName() != \'exit\') { cur_attr_num = '+realIndex+'; editAttr('+realIndex+', \''+cur_part_char+'\') }') /* correct onclick functionality with the real index */
	})

	cur_max_attrs_num = realIndex /* correct the num of the attributes counter */
	if ( cur_max_attrs_num == 0 ) { /* when there is no attributes left -> Go To Next Selectable Item */
		goToNextSelItm()
	}
}

function handleReIndex( event ) {
	if (cur_attr_num == cur_max_attrs_num) { /* when deleted the last (the rightest attribute in the list) -> move to Next Item */
		if ( event.shiftKey ) { /* go to previous selectable item (previous attr value) */
			updateRealAttr( cur_attr_num )
			/* delete from DOM helper spans for this attribute */
			$('#ean_'+cur_attr_num).remove()
			$('#eav_'+cur_attr_num).remove()
			$('#dInfo').html($('#dInfo').html().replace(' ="" ', " ")) /* remove the equal sign and quotes */
			
			if ( cur_max_attrs_num > 1 ) { /* when not removing last standing attribute */
				cur_ap = 'n'
				reIndexAttrs( event )
			}
			else { /* otherwise -> go to next selectable item */
				goToNextSelItm()
				return 'exit'	
			}
		}
		else { /* go to next selectable item (html tag value or ok button)*/			
			cur_ap = 'v'
			goToNextSelItm()
			return 'exit'
		}
	}
	else {
		/* delete from DOM helper spans for this attribute */
		$('#ean_'+cur_attr_num).remove()
		$('#eav_'+cur_attr_num).remove()
		$('#dInfo').html($('#dInfo').html().replace(' ="" ', " ")) /* remove the equal sign and quotes */
		
		reIndexAttrs( event )
		if ( !mouse_clicked ) {
			if ( event.shiftKey ) { /* when shift key -> go to previous attr */
				cur_ap = 'v'
				cur_attr_num--
				if (cur_attr_num == 0) {
					cur_attr_num = 1
				}
				editAttr ( cur_attr_num, cur_ap )
				return 'exit'
			} 
			else { /* otherwise go to next editable item */
				if ( cur_attr_num < cur_max_attrs_num ) {
					cur_ap = 'n'
					editAttr ( cur_attr_num, cur_ap )
					return 'exit'
				} 
				else {
					goToNextSelItm()
					return 'exit'
				}
			}
		}
	}
}

function HTMLTabHandler( event ) {
	if (event.keyCode == 9 && $( '#dInfo' ).html().indexOf( 'nsmarty_code' ) === -1 ) {
		event.preventDefault()
		updateCurHTML( function() {
			/* go to last attr which is actualy add new attribute option */
			if ( event.shiftKey ) {
				editAttr( cur_attr_num, 'v' )
				return
			}
			/* go to ok button if just tab */
			else {
				$('#btn_y').focus()
				$('#dAField').unbind('keyup keydown focus blur change').addClass("hide") /* detach events from previous use */
			}
		})
	}
}

function attrTabHandler( event ) {
	if (event.keyCode == 9) {
		event.preventDefault()
		if ( checkAttrName() == 'exit' ) { /* before we move away of current attr name check if we had change it in order to update the real edited html tag attributes */
			return 'exit'
		} 
		if ( updateCurAttr( event ) == 'exit' ) {
			return 'exit'
		}

		/* go to previous attr if shit+tab */
		if ( event.shiftKey ) {
			if ( cur_ap == 'v' ) {
				cur_ap = 'n'
			} else {
				if ( cur_attr_num > 1) {
					cur_ap = 'v'
				}
				cur_attr_num--
			}
			if ( cur_attr_num == 0 ) {
				cur_attr_num = 1
			}
		}
		/* go to next attr if just tab */
		else {
			if ( cur_ap == 'n' ) {
				cur_ap = 'v'
			} else {
				if ( cur_attr_num < cur_max_attrs_num) {
					cur_ap = 'n'
				}
				cur_attr_num++
			}
			if ( cur_attr_num > cur_max_attrs_num ) {
				goToNextSelItm()
				return
			}
		}
		if ( preview_class ) {
			removePreviewedClass(function() {
				editAttr( cur_attr_num, cur_ap )
			})
		}
		else {
			editAttr( cur_attr_num, cur_ap )
		}
	}
}

function goToNextSelItm() {
	if ($('#ean_'+(cur_attr_num)).attr('last-val') == 'last-val' || cur_max_attrs_num == 0 || (cur_attr_num == cur_max_attrs_num)) { /* when last was adding new attr */
		if ($('#dAField').val() == '') { /* when skipping adding attributes */
			if ( $('span#htv').length === 1 ) { /* when the html tag is not selfcontaining -> edit the value */
				/* delete from DOM helper spans for this attribute */
				$('#ean_'+cur_attr_num).remove()
				$('#eav_'+cur_attr_num).remove()
				$('#dInfo').html($('#dInfo').html().replace(' ="" ', " ")) /* remove the equal sign and quotes */
				
				cur_attr_num--
				cur_max_attrs_num--
				editHTV()
			}
			else {
				/* delete from DOM helper spans for this attribute */
				$('#ean_'+cur_attr_num).remove()
				$('#eav_'+cur_attr_num).remove()
				$('#dInfo').html($('#dInfo').html().replace(' ="" ', " ")) /* remove the equal sign and quotes */

				cur_attr_num--
				cur_max_attrs_num--

				$('#dAField').addClass("hide")
				$('#btn_y').focus()
			}
		}
		else {
			editHTV()
		}
	}
	else { /* add new attribute */
		addAttr()
	}
}

function getCurTagName() {
	/* get currently edited html tag name */
	kids = $( '#selItmCon' ).children()
	tag_name = $( kids[0] ).prop( 'tagName' )
	return tag_name;
}

function scrollToLastCodeChange() {
	chars_offset = 0 /* init chars_offset counter */
	curPos = $( '#dAField' ).prop( 'selectionStart' ) /* get current caret position */
	tag_name = getCurTagName() /* get currently edited html tag name */
	/* start calculating chars_offset */
	chars_offset += tag_name.length + 2 /* add 2 more to count starting "<" and one space afther the tag name */
	for ( i = 1   ; i <= cur_max_attrs_num; i++ ) {
		chars_offset += $( '#ean_' + i ).html().length /* add current attribute name */
		chars_offset += $( '#eav_' + i ).html().length + 4 /* add current attribute value. The extra 4 are representing the ="" and one space char between each attribute */
		if ( last_action != 'editHTV' ) { /* only when editing attributes -> check if we need to stop the loop */
			if ( cur_attr_num == i ) { /* when we reach currently edited attribute */
				/* reduce the chars_offset so the last entered char/suggested item shoud be center in view */
				if ( cur_ap == 'n' ) {
					chars_offset -= $( '#eav_' + i ).html().length + $( '#ean_' + i ).html().length + 44 /* the extra 40 chars are to center the edited text in the middle of visible code in ( designed at 1366px wide ) */
					chars_offset += curPos /* center view to curPos */
				}
				else {
					chars_offset -= $( '#eav_' + i ).html().length + 44 /* 44 chars is about the middle of visible code in 1366px wide */
					chars_offset += curPos /* center view to curPos */
				}				
				break
			}
		}
	}

	if ( last_action == 'editHTV' ) { /* only when editing html value */
		chars_offset += 6 /* add extra space for btn_ana and > */
		chars_offset += curPos /* center view to curPos */
		chars_offset -= 40 /* 40 chars is about the half of visible chars ( in 1366px width resolution ) */
	}

	$( '#dInfo' ).scrollLeft( ( chars_offset * 12 ) + 3 ) /* scroll the code to caret position : chars_offset is counted chars to caret position; 12 single char width; the extra 3 is for visual correction */
}

function inteligent_paste( target, data ) {
	smarty_detected = false
	if ( $( target ).hasClass( 'lsc' ) ) { /* when LastSmartyChild selected */
		smarty_detected = true
	}
	else if ( $( target ).hasClass( 'fsc' ) ) { /* when FirstSmartyChild selected */
		smarty_detected = true
		target = $( target ).parent().children().last() /* get parent's child last one to select LastSmartyChild */
	}
	else if ( $( target ).children().hasClass( 'lsc' ) ) { /* when current selectable container is parent of smarty block */
		smarty_detected = true
		target = $( target ).children().last() /* select the last child which is LastSmartyChild */
	}				

	if ( wrap_selected_sc ) { /* when wrap selected sc with the new element is enabled */
		var targetOutherHTML = target.prop('outerHTML'); /* get the target html */
		wrap_selected_sc = false /* reset the flag to false */
		data = data.replace('sc="true"><', 'sc="true">' + targetOutherHTML + '<') /* wrap selected sc with the new tag */
		target.before( data ) /* add before selected target */
		target.remove() /* remove the original target */
		cur_sc_con = $('#dContent_con') /* reset cur_sc_con */
		cur_sc = $('#dContent') /* reset cur_sc */
		cur_sc_index = 0 /* reset cur_sc_index */
	}
	else if ( unwrap_selected_sc ) { /* when unwrap functionality is enabled */
		unwrap_selected_sc = false /* reset the flag to false */
		unwrap_SS ( cur_sc )
		cur_sc_con = $('#dContent_con') /* reset cur_sc_con */
		cur_sc = $('#dContent') /* reset cur_sc */
		cur_sc_index = 0 /* reset cur_sc_index */
	}
	else if ( event.shiftKey || smarty_detected ) { /* when shift pressed -> paste the data before the currently selected target */
		target.before( data ) 
	}
	else if ( $( target ).hasClass( 'nsmarty_code' ) ) { /* when smarty code selected put the data after the container instead into it */
		target.after( data )
	}
	else { /* paste in currently selected target */
		if ( target.html() == '&nbsp;' ) { /* when the content is only system non breaking space -> remove it */
			target.html('')
		}
		if ( typeof target.attr( 'sc' ) === 'undefined' ) { /* when targeted element is not selectable container */
			/* backtrace parents until dContent or sc="true" */
			var finished = false
			var parents_str = '.parent()'
			while ( !finished ) {
				/* found ancestor which is selectable content */
				if ( eval( '$( target )' + parents_str + '.attr( "sc" )') ) { /* first parent that is selectable container */
					finished = true
					eval( '$( target )' + parents_str + '.append( \'' + data + '\' )') /* append content here */
				}
				/* end up to begining of edited template without finding hovered selectable content */
				if (eval( '$( target )' + parents_str + '.hasClass( "dContent" )')) { /* sc not found -> add in the main container  */
					finished = true
					eval( '$( target )' + parents_str + '.append( \'' + data + '\' )')
				}
				parents_str += '.parent()' /* go to upper parent */
			}
		}
		else {
			target.append( data )
		}
	}
}

function enableKeyboardElementSelect( html, callback ) {
	last_index_arr = [] /* initialize last known index collection */
	$(document.body).keydown(function ( event ) {
			event.preventDefault();
		})
		.keyup(function( event ) {
		event.preventDefault();
		if ( !enter_pressed ) { /* prevent double action with one hit of an enter */
			event.preventDefault() /* for disabling page scrolling on up down keys */
			cur_sc.removeClass( 'blueprint-grid' ) /* remove blueprint background */

			if ( event.keyCode == 27 ) { /* Esc -> simulate click on cancel button */
				reset_scs()
				$('#btn_n').click()
				return
			}
			else if ( event.keyCode == 9 ) { /* Tab Key -> Toggle between normal and clear visual arrangements */
				if ( $( '.sc_bordered' ).hasClass( 'sc_bordered_full' ) ) {
					$( '.sc_bordered' ).removeClass( 'sc_bordered_full' )
					scrollTo( cur_sc )
				}
				else {
					$( '.sc_bordered' ).addClass( 'sc_bordered_full' )	
					scrollTo( cur_sc )
				}
			}
			else if ( event.keyCode == 37 || event.keyCode == 100 || event.keyCode == 65) { /* Left Arrow or "a" -> Move to previous sibling selectable container */
				if ( cur_sc_index > 0 ) {
					cur_sc_index--
					siblings = cur_sc_con.children( '[sc="true"]' )
					$( '.popover' ).remove(); /* hide currently marked selectable container popover */
					cur_sc = $(siblings[cur_sc_index])
					scrollTo( cur_sc )
				}
			}
			else if ( event.keyCode == 39 || event.keyCode == 102 || event.keyCode == 68 ) { /* Right Arrow or "d"-> Move to next sibling selectable container */
				siblings = cur_sc_con.children( '[sc="true"]' )
				if ( cur_sc_index < ( siblings.length - 1 ) ) {
					cur_sc_index++
					$( '.popover' ).remove(); /* hide currently marked selectable container popover */
					cur_sc = $(siblings[cur_sc_index])
					scrollTo( cur_sc )
				}	
			}
			else if ( event.keyCode == 38 || event.keyCode == 104 || event.keyCode == 87 ) { /* Up Arrow or "w" -> Move to parent selectable container */
				if ( cur_sc_con.attr('id') != 'dBody' ) {
					$( '.popover' ).remove(); /* hide currently marked selectable container popover */
					if ( last_index_arr.length > 0 ) { /* when we have stored indexes of previous levels -> restore the last known */
						cur_sc_index = last_index_arr[ last_index_arr.length - 1 ] /* restore saved child index */
						last_index_arr.pop() /* remove restored index from the stack */
					}
					else { /* otherwise -> reset to zero */
						cur_sc_index = 0
					}
					cur_sc = cur_sc.parent()
					scrollTo( cur_sc )
					cur_sc_con = cur_sc.parent()
				}
			}
			else if ( event.keyCode == 40 || event.keyCode == 98 || event.keyCode == 83 ) { /* Down Arrow or "s" -> Move to first children selectable container */
				siblings = cur_sc.children( '[sc="true"]' )
				if ( siblings.length > 0 ) {
					last_index_arr.push( cur_sc_index ) /* save current level child index */
					$( '.popover' ).remove(); /* hide currently marked selectable container popover */
					cur_sc_index = 0
					cur_sc_con = cur_sc
					cur_sc = $(siblings[0])
					scrollTo( cur_sc )
				}
			}
			else if ( event.keyCode == 67 ) { /* "c" key -> copy currently selected sc to buffer */
				$( '.popover' ).remove(); /* hide the popover if case it's visible */
				buffer = cur_sc.prop('outerHTML')
			}
			else if ( event.keyCode == 88 ) { /* "x" key -> cut currently selected sc to buffer */
				$( '.popover' ).remove(); /* hide the popover if case it's visible */
				buffer = cur_sc
			}
			else if ( event.keyCode == 86 ) { /* "v" key -> paste buffer */
				inteligent_paste( cur_sc, buffer );
			}
			else if ( event.keyCode == 82 ) { /* "r" key -> activate mode wrap selected sc with the new element */
				wrap_selected_sc = true;
			}
			else if ( event.keyCode == 85 ) { /* "u" key -> activate mode "unwrap selected sc content (only removing the selected sc leaving it's content)" */
				unwrap_selected_sc = true;
			}
			else if ( event.keyCode == 13 ) { /* Enter -> Select currently selected selectable container */
				if ( html != '' ) { /* only when html string is not empty (skip if it's edit or delete) */
					html = '<div id="selItmCon">'+html+'</div>';
				}
				else {
					$( cur_sc ).wrap('<div id="selItmCon"></div>');
				}
				/* add the html @ this location */
				inteligent_paste( cur_sc, html )
				if ( typeof callback === 'function' ) {
					$( '.popover' ).remove(); /* hide currently marked selectable container popover */
					reset_scs() /* remove (unbind) all current functionality on all selectable containers */
					callback()
					return
				}
			}
		} else {
			enter_pressed = false
		}
		/* prepare the text for the popover */
		tooltip_txt = '<'
		tooltip_txt += cur_sc.prop( "tagName" ).toLowerCase()+' ' /* add the tag name */
		if ( typeof cur_sc.prop( "id" ) !== 'undefined' && cur_sc.prop( "id" ) !== '' ) { /* when id attr present */
			tooltip_txt += 'id="'+ cur_sc.prop( "id" ) +'" ' /* add the id */
		}	
		if ( typeof cur_sc.prop( "class" ) !== 'undefined' ) { /* when class attr present */
			class_txt = cur_sc.prop( "class" )
			/* remove system classes */
			class_txt = class_txt.replace( 'blueprint-grid', '' ) 
			class_txt = class_txt.replace( 'sc_bordered', '' ) 
			class_txt = class_txt.replace( 'sc_bordered_full', '' )
			class_txt = class_txt.replace( 'nsmarty_code', '' ) 
			class_txt = class_txt.replace( 'fsc', '' ) 
			class_txt = class_txt.replace( 'lsc', '' ) 
			/* check if it was only system classes */
			only_spaces_left = true
			for ( i = 0; i < class_txt.length; i++ ) { 
				if ( class_txt.substr( i, 1 ) != ' ' ) { 
					only_spaces_left = false 
				} 
			}
			if ( only_spaces_left ) { 
				class_txt = ''
			}
			if ( class_txt.length > 20 ) { /* when class string is bigger than 20 chars -> shrink it */
				class_txt = class_txt.substr(0, 17)+'...'
			}
			if ( class_txt.length > 0 ) { /* only when not empty */
				tooltip_txt += 'class="'+ class_txt +'" ' /* add the class */
			}
		}
		tooltip_txt += '>'
		if ( tooltip_txt != '<code >' ) { /* only when not smarty statement container */
			/* show visualy currently marked selectable container */
			cur_sc.attr( 'data-toggle', 'popover' )
			cur_sc.attr( 'data-placement', 'top' )
			cur_sc.attr( 'data-original-title', '' )
			cur_sc.attr( 'data-content', tooltip_txt )
			cur_sc.popover( 'show' )
		}
		$( '.popover-title' ).remove()
		/* set blueprint background */
		cur_sc.addClass('blueprint-grid')
	})
	/* prepare the text for the popover */
	tooltip_txt = '<'
	tooltip_txt += cur_sc.prop( "tagName" ).toLowerCase()+' ' /* add the tag name */
	if ( typeof cur_sc.prop( "id" ) !== 'undefined' && cur_sc.prop( "id" ) !== '' ) { /* when id attr present */
		tooltip_txt += 'id="'+ cur_sc.prop( "id" ) +'" ' /* add the id */
	}
	if ( typeof cur_sc.prop( "class" ) !== 'undefined' ) { /* when class attr present */
		class_txt = cur_sc.prop( "class" )
		/* remove system classes */
		class_txt = class_txt.replace( 'blueprint-grid', '' ) 
		class_txt = class_txt.replace( 'sc_bordered', '' ) 
		class_txt = class_txt.replace( 'sc_bordered_full', '' )
		class_txt = class_txt.replace( 'nsmarty_code', '' ) 
		class_txt = class_txt.replace( 'fsc', '' ) 
		class_txt = class_txt.replace( 'lsc', '' ) 
		/* check if it was only system classes */
		only_spaces_left = true
		for ( i = 0; i < class_txt.length; i++ ) { 
			if ( class_txt.substr( i, 1 ) != ' ' ) { 
				only_spaces_left = false 
			} 
		}
		if ( only_spaces_left ) { 
			class_txt = ''
		}
		if ( class_txt.length > 20 ) { /* when class string is bigger than 20 chars -> shrink it */
			class_txt = class_txt.substr(0, 17)+'...'
		}
		if ( class_txt.length > 0 ) { /* only when not empty */
			tooltip_txt += 'class="'+ class_txt +'" ' /* add the class */
		}
	}
	tooltip_txt += '>'
	if ( tooltip_txt != '<code >' ) { /* only when not smarty statement container */
		/* show visualy currently marked selectable container */
		cur_sc.attr( 'data-toggle', 'popover' )
		cur_sc.attr( 'data-placement', 'top' )
		cur_sc.attr( 'data-original-title', '' )
		cur_sc.attr( 'data-title', '' )
		cur_sc.attr( 'data-content', tooltip_txt )
		cur_sc.popover( 'show' )
	}
	$( '.popover-title' ).remove()
	/* set blueprint background */
	cur_sc.addClass('blueprint-grid')
}

function conSelector( html, callback ) {
	enableKeyboardElementSelect( html, callback )
	scrollTo( cur_sc )
	$('#dContent').on( 'click', function( event ) {
		event.preventDefault();
		if ( event.type === 'click' && event.which == 2 && !mouse_selection_handled ) {
			mouse_selection = !mouse_selection;
		}
	})
	/* iterate trough all selectable containers sc="true" */
	$('[sc="true"]').each(function() { /* sc = seleactable container */
		$( this ).addClass( 'sc_bordered' ) /* show all selectable containers with adding dashed border on each */
		$( this ).prop('contenteditable', 'false'); /* disabling content edit on selection to prevent random pasting or writing in content */
		/* handle all events at once to use the vars in all events */
		$(this).on('mouseover mouseout click', function ( event ) {
			if ( mouse_selection_handled ) {
				event.preventDefault()
				setTimeout(function() { 
					mouse_selection_handled = false;
				}, 1000 );
			}
			if ( mouse_selection ) {
				var found_sc = false, /* do we have selectable container below the mouse cursor */
				is_child = false, /* if hovering on child element insert before else append */
				target = $( event.target ) /* get hovered element */
				/* check current element */
				if ($(target).attr('sc')) { 
					found_sc = true;
					$( '.popover' ).remove(); /* remove the popover tooltip */
					$( '.blueprint-grid' ).removeClass( 'blueprint-grid' ); /* remove old blueprint-grid */
					$( target ).addClass( 'blueprint-grid' ); /* add blueprint-grid to current selectable content */
					/* prepare the tooltip */
					if ( $( target ).attr( 'data-bkp-title' ) === 'undefined' ) { /* only when data-bkp-title is not set */
						if ( typeof $( target ).prop( 'title' ) !== 'undefined' ) { /* when data-toggle ia already used backup the properties we will change in order to restore it later */
							$( target ).attr( 'data-bkp-title', $( target ).attr( 'title' ) )
						} 
						else {
							$( target ).attr( 'data-bkp-title', '' )
						}
					}
					/* prepare tooltip text */
					tooltip_txt = '<'
					tooltip_txt += $( target ).prop( "tagName" ).toLowerCase()+' ' /* add the tag name */
					if ( typeof $( target ).prop( "id" ) !== 'undefined' && $( target ).prop( "id" ) !== '' ) { /* when id attr present */
						tooltip_txt += 'id="'+ $( target ).prop( "id" ) +'" ' /* add the id */
					}
					if ( typeof $( target ).prop( "class" ) !== 'undefined' ) { /* when class attr present */
						class_txt = $( target ).prop( "class" )
						/* remove system classes */
						class_txt = class_txt.replace( 'blueprint-grid', '' ) 
						class_txt = class_txt.replace( 'sc_bordered', '' ) 
						class_txt = class_txt.replace( 'sc_bordered_full', '' )
						class_txt = class_txt.replace( 'nsmarty_code', '' ) 
						class_txt = class_txt.replace( 'fsc', '' ) 
						class_txt = class_txt.replace( 'lsc', '' ) 
						/* check if it was only system classes */
						only_spaces_left = true
						for ( i = 0; i < class_txt.length; i++ ) { 
							if ( class_txt.substr( i, 1 ) != ' ' ) { 
								only_spaces_left = false 
							} 
						}
						if ( only_spaces_left ) { 
							class_txt = ''
						}
						if ( class_txt.length > 20 ) { /* when class string is bigger than 20 chars -> shrink it */
							class_txt = class_txt.substr(0, 17)+'...'
						}
						if ( class_txt.length > 0 ) { /* only when not empty */
							tooltip_txt += 'class="'+ class_txt +'" ' /* add the class */
						}
					}
					tooltip_txt += '>'
					if ( tooltip_txt != '<code >' ) { /* only when not smarty statement container */
						$( target ).attr( 'title', tooltip_txt )
					}
					else { /* ohterwise -> hide title */
						$( target ).attr( 'title', '' )	
					}
					cur_sc = $( target ); /* set current selectable container to be hovered one */
					cur_sc_con = cur_sc.parent(); /* set the sc parrent as cur_sc_con */
					kids = cur_sc_con.children();
					cur_sc_index = kids.index( $( target ) ); /* set the correct child index to cur_sc_index */
				}
				else {
					/* backtrace parents until dContent or sc="true" */
					var finished = false
					var parents_str = '.parent()'
					while ( !finished ) {
						/* found ancestor which is selectable content */
						if ( eval( '$( target )' + parents_str + '.attr( "sc" )') ) {
							finished = true
							found_sc = true
							is_child = true
							eval( '$( target )' + parents_str + '.addClass( "blueprint-grid" )')
						}
						/* end up to begining of edited template without finding hovered selectable content */
						if (eval( '$( target )' + parents_str + '.hasClass( "dContent" )')) {
							finished = true
						}
						parents_str += '.parent()' /* go to upper parent */
					}
				}
				/* onmouseout remove the marker from the DOM */
				if (event.type === 'mouseout' && found_sc) {
					/* remove old blueprint-grid */
					$('.blueprint-grid').removeClass('blueprint-grid')
				}
				/* onclick remove the marker and put the html in selected position */
				if ( event.type === 'click' && found_sc && event.which == 1 ) {
					event.preventDefault();
					/* remove old blueprint-grid */
					$('.blueprint-grid').removeClass('blueprint-grid')
					/* wrap the html tag with container in order to know where to apply the changes since we don't yet have id on the new element */
					if ( html != '' ) { /* only when html string is not empty (skip if it's edit or delete) */
						html = '<div id="selItmCon">'+html+'</div>';
					}
					else {
						$( cur_sc ).wrap('<div id="selItmCon"></div>');
					}
					/* add the html @ this location */
					inteligent_paste( $( target ), html )
					reset_scs() /* remove (unbind) all current functionality on all selectable containers */
					/* exit/return trough callback function */
					if (typeof callback === "function") {
						callback()
					}
				}
			}			
		})
	})
}

function reset_scs() {
	$( '.sc_bordered' ).removeClass( 'sc_bordered' )
	$( '[sc="true"]' ).each(function() {
		$( this ).prop( 'contenteditable', 'true' ); /* enable content edit */
		$(this).unbind( 'mouseover mouseout click' ).removeClass( 'blueprint-grid' ).removeClass( 'sc_bordered' ).removeClass( 'sc_bordered_full' )
		/* restore original titles */
		if ( typeof $( this ).attr( 'data-bkp-title' ) !== 'undefined' ) {
			if ( $( this ).attr( 'data-bkp-title' ).indexOf('<') === -1 ) {
				$( this ).attr( 'title', $( this ).attr( 'data-bkp-title' ) )
			}
			else {
				$( this ).attr( 'title', '' );	
			}
		}
		else {
			$( this ).attr( 'title', '' );	
		}
		/* remove all system attributes */
		$( this ).removeAttr( 'data-bkp-title' )
			.removeAttr( 'data-title' )
			.removeAttr( 'data-toggle' )
			.removeAttr( 'data-placement' )
			.removeAttr( 'data-original-title' )
			.removeAttr( 'data-content' )
			.removeAttr( 'aria-describedby' )
			.removeClass( 'blueprint-grid' )
			.removeClass( 'sc_bordered' )
			.removeClass( 'sc_bordered_full' )
		if ( $( this ).attr( 'title' ) == '' ) { /* when empty title -> remove that attribute too */
			$( this ).removeAttr( 'title' )
		}
	})
}

function resetDAField() {
	/* remove the popover */
	$( '.popover' ).remove();
	/* remove all possible bindings */
	$( '#dAField' ).unbind( 'keyup keydown keypress focus blur change' );
	$( '#btn_y' ).unbind( 'click' );
	$( '#btn_n' ).unbind( 'click' );
	/* reset selection index */
	cur_sel_index = 0;
	/* reset suggest items counter */
	max_sel_itms = 0;
	/* reset multi suggest */
	multi_suggest = false;
	/* reset index vars */
	cur_attr_num = 1;
	cur_ap = 'v';
	cur_max_attrs_num = 0;
}

function suggestFor( event, suggest_type, placeholder, default_val, callback ) {
	/* initialize flag for suggested items content */ 
	var is_res_con_hidden = true
	/* move dAField affter the suggests container in case it was used elsewhere  */
	$( '#dSuggests' ).after( $( '#dAField' ).removeClass( 'input_ta' ) )

	showMF() /* clear form, hide menu, and show form container */
	/* set buttons actions */
	$('#btn_y').click(function() {
		resetDAField()
		if (typeof callback === "function") {
			cur_val = $('#dAField').val()
			if ( typeof callback === "function" ) {
				callback( cur_val )
			}
		}
	})

	$('#btn_n').click(function() {
		hideMF() /* hide the form and show the menu */
		resetDAField()
		if ( typeof callback === "function" ) {
			callback('') /* return empty result */
		}
	})

	/* prepare the textarea */
	$('#dAField').prop('placeholder', placeholder)
		.html(default_val)
		.removeClass( 'hide' )
		.focus(function(event) {
			suggest( event, suggest_type, 'dAField', 'dSuggests', 'ku', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest )
		})
		.keyup(function(event) {
			if ( event.keyCode == 27 ) { /* on esc key -> simulate click on cancel button */
				$('#btn_n').click()
				return
			}
			if ( event.keyCode == 13 && event.shiftKey ) { /* when shift+enter -> simulate ok button click */
				$( '#btn_y' ).click();
			}
			suggest( event, suggest_type, 'dAField', 'dSuggests', 'ku', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest )
		})
		.keydown(function(event) {
			suggest( event, suggest_type, 'dAField', 'dSuggests', 'kd', function( event ) { $('#btn_y').click() }, placeholder, multi_suggest )
		})
		.blur(function(event) {
			setTimeout(function() { 
				hideSuggests()
			}, 100 );
		})
		.focus()

	/* show the buttons */
	$( '#btn_y, #btn_n' ).removeClass( 'hide' )
}

function suggest( event, suggest_type, req_con, res_con, key_event, callback, placeholder, cur_multi_suggest ) {
	/* set the placeholder if present */
	if (typeof placeholder !== 'undefined') {
		$('#'+req_con).prop('placeholder', placeholder)
	}

	/* disable multi_suggest if not present as param */
	if (typeof cur_multi_suggest === 'undefined') {
		multi_suggest = false
	} 
	else {
		multi_suggest = cur_multi_suggest
	}

	var data = $('#'+req_con).val()
	var curPos = $('#'+req_con).prop("selectionStart")
	var cur_char = String.fromCharCode(event.keyCode)
	var selected_name = ''
	var is_res_con_hidden = false

	if ($('#'+res_con).hasClass("hide")) {
		is_res_con_hidden = true
	}

	/* set array of keys as follows : 38 - up arrow, 104 - numpad up arrow, 40 - down arrow, 99 - numpad down arrow, 13 - enter */
	var ar = new Array(38, 104, 40, 98, 13)
	var disableArrowKeys = function(e) {
		if ($.inArray(event.keyCode, ar)>=0) {
			/* disable normal functioning for each of ar keys */
			event.preventDefault()
		}
	}

	/* if suggestions are visible and up or down arrow is pressed cicle trough suggested items, enter for selection */
	if (!is_res_con_hidden && (event.keyCode == 38 || event.keyCode == 104 || event.keyCode == 40 || event.keyCode == 98 || event.keyCode == 13) && key_event == 'kd') {
		$(document).keydown(disableArrowKeys)

		/* Up Arrow */
		if (event.keyCode == 38 || event.keyCode == 104) {
			if (cur_sel_index >= 2) {
				cur_sel_index--
			}
			else {
				cur_sel_index = max_sel_itms+1
			}
			if ( suggest_type == 'attribute' && cur_ap == 'v' && $('#ean_'+cur_attr_num).html() == 'class' ) {
				removePreviewedClass( function() {
					previewSelectedClass( $('#si_'+cur_sel_index).html() )
				})
			}
		}
		
		/* Down Arrow */
		else if (event.keyCode == 40 || event.keyCode == 98) {
			if (cur_sel_index <= max_sel_itms) {
				cur_sel_index++
			}
			else {
				cur_sel_index = 1
			}
			if ( suggest_type == 'attribute' && cur_ap == 'v' && $('#ean_'+cur_attr_num).html() == 'class' ) {
				removePreviewedClass( function() {
					previewSelectedClass( $('#si_'+cur_sel_index).html() )
				})
			}
		}
		/* Enter */
		else {
			event.preventDefault()
			kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
			if ( !event.shiftKey ) {
				$( '#si_' + cur_sel_index ).click() /* call predefined onclick javascript */
			}
			else {
				if ( preview_class ) {
					removePreviewedClass()
				}
			}
		}
		unselectAllSuggests()
		return 
	} 
	else {
		$(document).unbind('keydown', disableArrowKeys) /* enable arrow keys */
	}

	if (!is_res_con_hidden) {
		unselectAllSuggests()
		$('#si_'+cur_sel_index).addClass('suggestItemActive') /* set selected class to currently selected suggested item */
		suggestScrollTo(cur_sel_index) /* scroll to current suggested item */
	}

	/* if left or right arrows pressed try to catch new search string */
	if ((event.keyCode == 37 || event.keyCode == 39) && key_event == 'ku') {
		catchTxtNearCaret( curPos, data, req_con, res_con, suggest_type, callback )
		return
	}

	/* on backspace reinvoke suggest list get */
	if (event.keyCode == 8 && key_event == 'ku') {
		catchTxtNearCaret( curPos, data, req_con, res_con, suggest_type, callback )
		return
	}

	/* starting catching name search sting */
	if ( event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 98 && event.keyCode != 104 && key_event == 'ku' ) {
		str_replace_pos = curPos - 1
		catchTxtNearCaret( curPos, data, req_con, res_con, suggest_type, callback )
		updateTAHeight()
		return
	}

	/* on any keyCode different from arrows and backspace and started catching name search string */
	if (event.keyCode != 8 && event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40 && event.keyCode != 98 && event.keyCode != 104 && key_event == 'ku') {
		if (key_event == 'ku') {
			catchTxtNearCaret( curPos, data, req_con, res_con, suggest_type, callback )
			updateTAHeight()
			return
		}
	}
}

function catchTxtNearCaret( caretPos, data, req_con, res_con, suggest_type, callback ) {
	search_str = ''
	charsToGrab = 1
	found_delimiter = false
	delimiters = [ '$', '\'', '"', '}', ' ', '|', '.', '=', '<', '>', '!', '(', ')', '[', ']' ]

	/* if empty field suggest all options */
	if ( data == '' ) {
		suggest_vars = false
		cur_full_var = ''
		last_search_str = search_str
		getSuggestList( suggest_type, search_str, req_con, res_con, callback )
		return
	}

	cur_var_lvl = 0 /* reset current var level ( used when suggesting smarty variables ) */

	for ( pos = caretPos; pos >= 0; pos-- ) {
		if ( delimiters.indexOf( data.substr( pos - 1, 1 ) ) != -1 || pos == 0 ) { /* when found one of the delimiters -> get out of the loop and bring out the current search_str */
			if ( data.substr( pos - 1, 1 ) == '.' ) { /* when previous char is '.' */
				cur_var_lvl++
			}
			found_delimiter = true
			if ( pos == 1 ) { 
				pen = 1 
			} 
			else { 
				pen = 0
				charsToGrab-- 
			} /* pen = position exception number */
			search_str = data.substr( pos - pen, charsToGrab )
			str_replace_pos = pos - 1
			break
		} else {
			charsToGrab++
		}
	}

	if ( data.substr( pos - 1, 1 ) == '$' ) { /* when found smarty var -> reset cur_full_var */
		cur_full_var = '$'
	}

	if ( cur_var_lvl > 0 ) { /* when we had stoped on '.' */
		cur_var_lvl = 0 /* cur_var_lvl must be 1 at this point and we reset it in order to get proper count of '.' */
		
			for ( pos = pos - 1; pos >= 0; pos-- ) { /* check if there is other levels by searching for the main var '$' or start of the string */
			if ( data.substr( pos, 1 ) == '.' ) { /* when '.' found -> increase current var level */
				cur_var_lvl++
			}
			else if ( data.substr( pos, 1 ) == '$' ) { /* when start of var found -> exit loop */
				cur_full_var = data.substr( pos, parseInt(parseInt(curPos) - pos - 1) )
				break
			}
		}
	}

	cur_pos_ch = data.substr( pos, 1 )
	prev_pos_ch = data.substr( pos - 1, 1 )
	if ( cur_pos_ch == '$' || 
		 prev_pos_ch == '$' || 
		 cur_pos_ch == '.' || 
		 prev_pos_ch == '.' ) { /* when exit on '$' -> activate suggesting smarty vars */
		suggest_vars = true
	} else { /* otherwise -> disable suggesting smarty vars */
		suggest_vars = false
	}

	if ( suggest_vars ) {
		suggest_type = 'smarty_vars'
	}
	else if ( cur_pos_ch == '{' || prev_pos_ch == '{' ) {
		suggest_type = 'smarty_statement'		
	}
	else if ( cur_pos_ch == '|' || prev_pos_ch == '|' ) {
		suggest_type = 'smarty_var_modifiers'
	}
	
	getSuggestList( suggest_type, search_str, req_con, res_con, callback )
}

function setSelectionRange( input, selectionStart, selectionEnd ) {
	if ( input.setSelectionRange ) {
		input.focus()
		input.setSelectionRange( selectionStart, selectionEnd )
	}
	else if ( input.createTextRange ) {
		range = input.createTextRange()
		range.collapse( true )
		range.moveEnd( 'character', selectionEnd )
		range.moveStart( 'character', selectionStart )
		range.select()
	}
}

function setCaretPosition( elemId, caretPos ) {
	var elem = document.getElementById(elemId);

	if(elem != null) {
		if(elem.createTextRange) {
			var range = elem.createTextRange();
			range.move('character', caretPos);
			range.select();
		}
		else {
			if(elem.selectionStart) {
				elem.focus();
				elem.setSelectionRange(caretPos, caretPos);
			}
			else
				elem.focus();
		}
	}
}

function suggestScrollTo( index ) {	
	/* calculate the top_offset we need to scroll to */
	top_offset = 0
	for (i = 1; i < parseInt(index); i++) {
		top_offset += parseInt( $( '#si_' + i ).height() )
	}
	/* scroll to the computed top_offset */
	$( '#dSuggests' ).scrollTop( top_offset )
}

function scrollTo( obj ) {
	$( obj ).get( 0 ).scrollIntoView(); /* scroll to current sc */
	window.scrollBy ( 0, -113 ); /* scroll up a bit because of the fixed menu */
}

function hideSuggests() {
	$('#dSuggests').addClass("hide")
	cur_sel_index = 0 /* reset selection index */
	max_sel_itms = 0 /* reset suggest items counter */
}

function showSuggests() {
	var caret_pos = $('#dAField').textareaHelper('caretPos') /* used for horizontal positioning of the suggests */
	var	elem_pos = $('#dAField').offset() /* used for vertical positioning of the suggests */

	/* re-position the suggest pop-up */
	$('#dSuggests').css('top', elem_pos.top + caret_pos.top - 5 - $('body').scrollTop() + 'px')
	$('#dSuggests').css('left', caret_pos.left + elem_pos.left - 10 + 'px')
	
	$('#dSuggests').removeClass("hide") /* show suggests */
	cur_sel_index = 1
	top_suggests.forEach( function( suggest, index ) {
		$(' .suggestItem ').each( function() {
			if ( $(this).html() == suggest.item ) { /* when top suggest is in current suggests bring in on top */
				$( '#sls' ).after( $(this) )
			}
		})
	})

	reindexSuggests() /* reindex suggests ids */
	suggestScrollTo( cur_sel_index ) /* scroll to current suggest */
	unselectAllSuggests() /* remove active class on all suggest items */
	
	$('#si_'+cur_sel_index).addClass('suggestItemActive') /* set active class to currently selected suggested item */

	if ( cur_ap == 'v' && $('#ean_'+cur_attr_num).html() == 'class') {
		removePreviewedClass( function() {
			previewSelectedClass( $('#si_'+cur_sel_index).html() )
		})
	}
}

function reindexSuggests() {
	i = 1
	$(' .suggestItem ').each( function() {
		$( this ).attr( 'id', 'si_' + i )
		i++
	})
}

function getSuggestList( type, str, req_con, res_con, callback ) {
	/* get currently edited html tag name */
	kids = $('#selItmCon').children()
	/* set counter for results */
	id_num = 1
	tag_name = $(kids[0]).prop("tagName")
	/* set empty attr_name in case we don't search for attribute values */
	attr_name = ''
	/* set proper action based on suggest type */
	switch (type) {
		case 'html_tags':
			req = 'get_html_tags_by_str'
			break
		case 'attribute':
			req = 'get_attr_posible_vals'
			if ( cur_ap == 'v') {
				/* get current attribute name */
				attr_name = $('#ean_'+cur_attr_num).html()
			}
			else {
				req = 'get_attrs_by_html_tag'
			}
			/* if we have class attribute we change to the special method which returns all possible to use classes */
			if (attr_name == 'class') {
				req = 'get_classes_by_str'
			}
			break
		case 'smarty_statement':
			req = 'get_smarty_statements_by_str'
			break
		default:
			req = ''
	}
	/* textareaHelper is used for it's ability to get/set carret position */
	$('#'+req_con).textareaHelper()
	if ( type == 'smarty_vars' && suggest_vars ) {
		if ( vars.length > 0 ) { /* only when we have storred vars */
			$('#'+res_con).html( '<span class="hide" id="sls"></span>' ) /* init suggest container */
			vars.forEach( function( cur_var, cur_index ) {
				if ( cur_var.index == cur_var_lvl 
				  && cur_var.name.indexOf( str ) != -1 
				  && cur_var.full_var.indexOf( cur_full_var ) != -1 ) { /* only suggest vars on same level and containing currently searched string */
					$('#sls').after('<a class="suggestItem" id="si_'+id_num+'" onclick="mouse_clicked = true; selectSuggestedItem(\''+cur_var.name+'\', \''+cur_var.name+'\', \''+type+'\',  '+callback+' )" >'+cur_var.name+'</a>')
					id_num++
				}
			})
			max_sel_itms = id_num-2
			showSuggests()
		}
	}
	else if ( type == 'smarty_var_modifiers' ) {
		$('#'+res_con).html( '<span class="hide" id="sls"></span>' ) /* init suggest container */
		smarty_modifiers.forEach( function( cur_modifier ) {
			if ( cur_modifier.indexOf( str ) != -1 ) { /* only when searched string is part of current smarty modifier */
				$('#sls').after('<a class="suggestItem" id="si_'+id_num+'" onclick="mouse_clicked = true; selectSuggestedItem(\''+cur_modifier+'\', \''+cur_modifier+'\', \''+type+'\',  '+callback+' )" >'+cur_modifier+'</a>')
				id_num++
			}
		})
		max_sel_itms = id_num-2
		showSuggests()
	}
	else if ( type == 'dbs' ) {
		if ( dbs.length > 0 ) { /* only when we have available dbs */
			$('#'+res_con).html( '<span class="hide" id="sls"></span>' ) /* init suggest container */
			dbs.forEach( function( cur_db_name ) {
				if ( cur_db_name.indexOf( str ) != -1 ) { /* only when searched string is part of current db name */
					$('#sls').after('<a class="suggestItem" id="si_'+id_num+'" onclick="mouse_clicked = true; selectSuggestedItem(\''+cur_db_name+'\', \''+cur_db_name+'\', \''+type+'\',  '+callback+' )" >'+cur_db_name+'</a>')
					id_num++
				}
			})
			max_sel_itms = id_num-2
			showSuggests()
		}
	}
	else if ( type == 'db_tables' ) {
		if ( db_tables.length > 0 ) { /* only when we have available db_tables */
			$('#'+res_con).html( '<span class="hide" id="sls"></span>' ) /* init suggest container */
			db_tables.forEach( function( cur_db_table_name ) {
				if ( cur_db_table_name.indexOf( str ) != -1 ) { /* only when searched string is part of current db name */
					$('#sls').after('<a class="suggestItem" id="si_'+id_num+'" onclick="mouse_clicked = true; selectSuggestedItem(\''+cur_db_table_name+'\', \''+cur_db_table_name+'\', \''+type+'\',  '+callback+' )" >'+cur_db_table_name+'</a>')
					id_num++
				}
			})
			max_sel_itms = id_num-2
			showSuggests()
		}
	}
	else { /* send ajax query to server with required data */
		$.ajax({
			url: "/ajax",
			type: "POST",
			data: {
				dAction: 'ajaxHandler(req, res)',
				req: req,
				str: str,
				attr_name: attr_name,
				tag_name: tag_name
			},
			success: function(data) {
				if ( data.length > 0 ) { /* when not empty result */
					obj = jQuery.parseJSON( data )
					$('#'+res_con).html( '<span class="hide" id="sls"></span>' ) /* init suggest container */
					/* add result items */
					for (i in obj)
					{
						/* initialize params */
						var title = ''
						/* set title if not null */
						if (obj[i].title !== null) { title = obj[i].title }
						/* set displayed content on enter */
						if ( typeof obj[i].full_statement !== 'undefined' ) { /* when suggesting smarty statement */
							content = obj[i].full_statement 
						}
						else { /* for all other the name is the content */
							content = obj[i].name
						}
						
						$('#sls').after('<a class="suggestItem" id="si_'+id_num+'" onclick="mouse_clicked = true; selectSuggestedItem(\''+obj[i].name+'\', \''+content+'\', \''+type+'\', '+callback+' )" title="'+title+'">'+obj[i].name+'</a>')
						id_num++
					}

					max_sel_itms = id_num-2
					if ( $( '#dSuggests' ).html() != '<span class="hide" id="sls"></span>' ) {
						showSuggests()
					}
					else {
						hideSuggests()
					}
				}
				else {
					hideSuggests()
				}
			},
			error: function() {
			}
		})
	}
}

function removePreviewedClass( callback ) {
	kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
	if ( typeof $(kids[0]) !== 'undefined' ) {
		html_tag_obj = kids[0]
		if ( preview_class ) {
			setTimeout(function() { 
				/* find class attribute and get it's value */
				$( '.eac' ).each(function() {
					if ( $(this).html() == 'class' ) {
						this_id_arr = $( this ).attr( 'id' ).split('_')
						this_index = this_id_arr[1]
						cur_class = $( '#eav_' + this_index ).html() /* get full class text from attribute class because addClass to children rewrites the whole class string */
					}
				})				
				if ( typeof $( kids[0] ) !== 'undefined' ) {
					$( kids[0] ).attr( 'class', cur_class )
					preview_class = false
				}
			}, 1 ) 
		}
		if ( typeof callback === 'function' ) {
			callback()
		}
	}
}

function previewSelectedClass( class_name ) {
	kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
	setTimeout(function() { 
		cur_class = $('#dAField').val() /* get full class text from and add class_name to it because addClass to children rewrites the whole class string */
		if ( typeof $( kids[0] ) !== 'undefined' && typeof class_name !== 'undefined' ) {
			$( kids[0] ).addClass( cur_class+' '+class_name )
			preview_class = true
		}
	}, 1 )
	
}

function checkAttrName() {
	if ( last_action != 'editHTV' ) { /* skip if we edit html tag value */
		if ( $( '#ean_' + cur_attr_num ).attr('last-val') != $( '#ean_' + cur_attr_num ).html() ) { /* when the attribute name is changed with new -> remove the attribute from real html tag */
			kids = $( '#selItmCon' ).children() /* select the edited element by getting childs of the selItemCon container */
			if ( $( '#ean_' + cur_attr_num ).html().length > 0 ) { /* only when not empty attribute name */
				$( kids[0] ).removeAttr( $( '#ean_' + cur_attr_num ).attr( 'last-val' ) ) /* remove the real attribute which was replaced from the edited html tag */
				$( '#ean_' + cur_attr_num ).attr( 'last-val', $( '#ean_' + cur_attr_num ).html() ) /* update 'last-val' with current one */
				$( kids[0] ).attr( $( '#ean_' + cur_attr_num ).attr('last-val'), $( '#eav_' + cur_attr_num ).html() ) /* add the new attr to the edited html tag and */
			}
			else {
				$( kids[0] ).removeAttr( $( '#ean_' + cur_attr_num ).attr( 'last-val' ) ) /* remove the real attribute from the edited html tag */
				if ( handleReIndex( event ) == 'exit') { /* reindex attributes nums */
					hideSuggests()
					return 'exit'
				}
			}
		}
	}
}

function selectSuggestedItem( item_name, item_data, suggest_type, callback ) {
	curPos = $('#dAField').prop("selectionStart")
	last_cur_pos = curPos
	data = $('#dAField').val()
	delimiters = [ '\'', '"', '}', ' ', '|', '.', '=', '<', '>', '!', '(', ')', '[', ']' ] /* that should be all possible end points of smarty variable */
	if ( suggest_type != 'smarty_statement' ) { /* when not suggesting smarty statement -> add starting smarty tag '{' */
		delimiters.push('{')
	}
	if ( suggest_type != 'smarty_vars' ) { /* when not suggesting smarty statement -> add starting smarty tag '{' */
		delimiters.push('$')
	}
	suggest_vars = false /* reset suggest_vars */
	hideSuggests()

	if ( !event.shiftKey ) { /* only when shft key is not pressed */
		updateTopSuggests( item_name ) /* add/update current item to top suggests list */
	}

	/* move left from current caret position until delimiter found or begining of the data */
	for ( left_pos = curPos; left_pos > 0; left_pos-- ) {
		/* if we find delimiter get out of the loop and bring out the position after the entered item */
		if ( delimiters.indexOf( data.substr( left_pos - 1, 1 ) ) != -1 ) {
			break
		}
	}

	/* move right from current caret position until suggest found or end of the data */
	for ( right_pos = curPos - 1; right_pos < data.length; right_pos++ ) {
		/* if we find suggest get out of the loop and bring out the position after the entered item */
		if ( delimiters.indexOf( data.substr( right_pos + 1, 1 ) ) != -1 ) {
			right_pos++
			break
		}
	}

	if ( suggest_type == 'smarty_statement' && $('#dAField').prop('placeholder').indexOf('HTML') !== -1 ) { /* when suggested item is smarty statement and we are on HTML tag adding -> put item_name */
		new_data = data.substr( 0, left_pos ) + item_name + data.substr( right_pos )
	}
	else { /* otherwise -> put item_data */
		new_data = data.substr( 0, left_pos ) + item_data + data.substr( right_pos )
	}

	if ( multi_suggest && right_pos == data.length && suggest_type != 'smarty_vars' ) {
		new_data += ' '
	}

	if ( new_data.indexOf('undefined') == -1 ) { /* only when enter pressed on suggested item */
		$( '#dAField' ).val( new_data )	/* pupolate textarea with replaced string */
	}

	if ( multi_suggest ) { /* when multi suggest -> stay editing same field just reposition the caret */
		add_pos = 0 /* initialize zero additional pos var */
		if ( suggest_type == 'smarty_statement' ) { /* when suggesting smarty statement -> stay on same place */
			/* try to find first parameter value position */
			fpv_pos = item_data.indexOf("''") /* fpv = First Param Value */
			if ( fpv_pos != -1 ) { /* when found parameter */
				add_pos = fpv_pos /* update add_pos */
			}
			/* find fist space in the smarty statement */
			else {
				space_pos = item_data.indexOf(" ")
				if ( space_pos != -1 ) { /* when found space */
					add_pos = space_pos /* update add_pos */
				}
				else {
					add_pos = item_data.length /* update add_pos */
				}
			}
			last_cur_pos = last_cur_pos - ( search_str.length ) + 1 /* correct cursor position in front of searching string + 1 */
			setCaretPosition( 'dAField', parseInt( parseInt( last_cur_pos + add_pos ) ) )
		}
		else { /* otherwise -> go to currently added item end */
			if ( item_data.substr( 0, 1 ) == '$' && right_pos < data.length ) { /* when smarty var and not at the and of the data correct add_pos */
				add_pos = -1
			}
			else if ( suggest_type == 'attribute' ) { /* when adding attribute -> go after the space char */
				add_pos = 2
			}
			last_cur_pos = last_cur_pos - ( search_str.length ) /* correct cursor position in front of searching string */
			setCaretPosition( 'dAField', parseInt( parseInt( last_cur_pos ) + item_data.length + add_pos ) )
		}
		return false
	}
	else { 
		if (cur_attr_num < cur_max_attrs_num ) { /* when not in the end of the attributes list */
			updateCurAttr( event ) /* update the visual part */
			updateRealAttr( cur_attr_num ) /* update the real html tag attr */
		}
		else { /* at the end of the attributes list or not editing attrubites at all */
			if ( cur_ap == 'n' ) {
				updateCurAttr( event )
				updateRealAttr( cur_attr_num )
				checkAttrName()
				cur_ap = 'v'
				editAttr ( cur_attr_num, cur_ap ) /* go to edit current attribute value */
			}
			else if ( $('span#htv').length === 1 ) { /* when the html tag is not selfcontaining */
				updateCurAttr( event )
				updateRealAttr( cur_attr_num )
				editHTV()
			}
			else {
				$( '#btn_y' ).focus()
			}
		}
	}

	/* when detect 'html' in placeholder exit trough callback if present */
	if ( ( $('#dAField').prop('placeholder').indexOf('HTML') !== -1 || $('#dAField').prop('placeholder').indexOf('DB ') !== -1 ) && typeof callback === 'function' ) {
		callback()
	}
}

function updateTopSuggests( item_name ) {
	found = false
	top_suggests.forEach( function( item, index ) {
		if ( item_name == item.item ) { /* when there is same suggest -> increase its count */
			top_suggests[index].count++
			found = true
		}	
	})

	if ( !found ) { /* when not found -> add it */
		top_suggests.push( { item: item_name, count: 1 } )
	}

	/* sort the top suggest by count asscending */
	top_suggests = top_suggests.sort( function( a, b ) {
		return a.count > b.count ? 1 : a.count < b.count ? -1 : 0
	})
}

function unselectAllSuggests() {
	$('.suggestItem').each(function() {
		$(this).removeClass( "suggestItemActive" )
	})
}

function prepHtmlTag( name, callback ) {
	$.ajax({
		url: "/ajax",
		type: "POST",
		data: {
			dAction: 'ajaxHandler(req, res)',
			req: 'get_default_attrubutes_by_tag_name',
			name: name
		},
		success: function(data) {
			if (data) {
				/* return prepared html tag for edit */
				callback(data)
			}
			else {
				/* if no result (wrong entered html tag name) just hide the form and show the menu */
				hideMF()
			}
		},
		error: function() {
		}
	})
}

function fetchVarsFromDB() {
	resetBodyShortcuts() /* disable previous keyboard functionality */
	suggestFor( event, 'dbs', 'Type/Select DB Name', '', function( db_name ) {
		/* do nothing when empty name entered */
		if ( db_name === '' ) {
			return false
		}
		$.ajax({
			url: "/ajax",
			type: "POST",
			data: {
				dAction: 'ajaxHandler(req, res)',
				req: 'get_all_tables_by_db_name',
				db_name: db_name
			},
			success: function( data ) {
				if ( data ) {
					db_tables = [] /* reset db_tables collection */
					data = jQuery.parseJSON( data ) /* convert from string to js collection ( array ) */
					data.forEach( function( db_table ) {
						db_tables.push( db_table )
					})
					setTimeout(function() { /* delay next suggestFor call to prevent executing two actions with one press of enter key */
						suggestFor( event, 'db_tables', 'Type/Select DB Table Name', '', function( db_table_name ) {
							/* do nothing when empty name entered */
							if ( db_table_name === '' ) {
								return false
							}
							$.ajax({
								url: "/ajax",
								type: "POST",
								data: {
									dAction: 'ajaxHandler(req, res)',
									req: 'get_all_fields_by_db_table_name',
									db_name: db_name,
									db_table_name: db_table_name
								},
								success: function( data ) {
									if ( data ) {
										data = jQuery.parseJSON( data ) /* convert from string to js collection ( array ) */
										fields = '' /* initialize fields html string */
										fi = 3
										data.forEach( function( field ) {
											fields += '<input tabindex="' + fi + '" class="ci dbtfcb" type="checkbox" id="dbtf_' + fi + '" onchange="toggleField( this )"/> <label id="dbtfl_' + fi + '" class="ci" for="dbtf_' + fi + '">' + field + '</label>&nbsp;&nbsp;&nbsp;'
											fi++
										})
										clearMFE()
										$( '#dInfo' ).html('<div class="pf">Select Field(s) for the Collection : <button tabindex="1" id="sadbf" type="button" class="navbar-btn btn btn-small btn-primary	" onclick="selectAllFields()">All</button>&nbsp;&nbsp;&nbsp;<button tabindex="2" type="button" class="navbar-btn btn btn-small btn-default" onclick="unselectAllFields()">None</button></div><br/><br/>' + fields).removeClass("hide")
													 .keyup( function ( event ) { 
														if (event.keyCode == 27) {
															$( '#btn_n' ).click()
															return
														}
														if ( event.keyCode == 13 && event.shiftKey ) { /* when shift+enter -> simulate ok button click */
															$( '#btn_y' ).click()
														}
													 })
										$( '#btn_y' ).click( function() { 
											resetBodyShortcuts();
											selected_fields = [] /* initialize fields collction ( array ) to store selected fields which later will be converted to smarty variables */
											$('.dbtfcb').each( function() { /* iterate trough each Data Base Table Field check box */
												if ( $( this ).is(":checked") ) { /* when current check box is checked -> add the field to the collection */
													id_arr = $( this ).attr( 'id' ).split('_') /* split current id to get it's number */
													label = $( '#dbtfl_' + id_arr[1] ) /* id_arr index 1 must be the current id number */
													selected_fields.push( label.html() )
												}
											})
											if ( selected_fields.length > 0 ) { /* only when we have selected atleast one of the present fields */
												multi_suggest = true
												suggestFor( event, 'smarty_vars', 'Type/Select Smarty Variable Name for the Selected Fields Collection', '', function( collection_name ) {
													multi_suggest = false
													if ( collection_name != '' ) {
														collection_arr = collection_name.split( '.' )
														/* fill each part of the collection as separate var ( for better suggesting ) if not already present */
														collection_arr.forEach( function( cur_col_var, cur_var_lvl ) {
															found_in_vars = false
															if ( vars.length > 0 ) { /* when we have stored smarty vars */
																vars.forEach( function( cur_var, cur_index ) {
																	if ( cur_var.index == cur_var_lvl 
																	  && cur_var.name == cur_col_var
																	  && cur_var.main_var == collection_arr[0] ) {
																		found_in_vars = true
																	}
																})
																if ( !found_in_vars ) { /* only when not found in current vars collection -> add current field as var */
																	vars.push({"full_var":collection_name,"main_var":collection_arr[0],"name":cur_col_var,"index":cur_var_lvl})
																}
															}
															else { /* when first var -> just add it */
																vars.push({"full_var":collection_name,"main_var":collection_arr[0],"name":cur_col_var,"index":cur_var_lvl})
															}
														})
														
														cur_var_lvl = collection_arr.length /* set the current var level depending on collection_arr length */
														/* fill each selected field as separate var in vars collection if not already present */
														selected_fields.forEach( function( cur_table_field ) {
															cur_full_var = collection_name + '.' + cur_table_field
															found_in_vars = false
															vars.forEach( function( cur_var, cur_index ) {
																if ( cur_var.index == cur_var_lvl 
																  && cur_var.name == cur_table_field
																  && cur_var.main_var == collection_arr[0] ) {
																	found_in_vars = true
																}
															})
															if ( !found_in_vars ) { /* only when not found in current vars collection -> add current field as var */
																vars.push({"full_var":collection_name,"main_var":collection_arr[0],"name":cur_table_field,"index":cur_var_lvl})
															}
														})
														vars_db_info.push({"db_name":db_name,"table_name":db_table_name,"var_name":collection_name});
														hideMF() /* hide the form and show the menu */
													} else {
														hideMF() /* hide the form and show the menu */
													}
												})
											}
										}).removeClass( 'hide' )
										$('#btn_n').click(function() { 
											hideMF() /* hide the form and show the menu */
										}).removeClass( 'hide' )
										$( '#sadbf' ).focus()
									}
									else {
										/* if no result (wrong entered or empty db name) just hide the form and show the menu */
										hideMF() 
									}
								}
							})
						})
					}, 100 )
				}
				else {
					/* if no result (wrong entered or empty db name) just hide the form and show the menu */
					hideMF()
				}
			}
		})
	})
}

function addStyledObj( obj ) {
	if ( styled_objs.length > 0 ) { /* when we had stored styled objects in the stack */
		found_duplicate = false
		styled_objs.forEach( function( cur_obj, index ) {
			if ( cur_obj.stored_style == $( obj ).attr('style') ) { /* when duplicate style found */
				found_duplicate = true
				styled_objs[ index ].objs.push( $( obj ) ) /* add only the object to existing styling */
			}
		})
		if ( !found_duplicate ) { /* when unique styling found -> add the object and it's styling to the stack */
			styled_objs.push( { objs: [ $( obj ) ], stored_style: $( obj ).attr('style') } )
		}
	}
	else { /* add first object to the stack */
		styled_objs.push( { objs: [ $( obj ) ], stored_style: $( obj ).attr('style') } )
	}
}

function scanForHardCodedStyles( start_con, callback ) {
	waiting_for_children = false; /* exit point flag */
	
	i = 0; /* initialize index on each call */	
	kids = $( start_con ).children(); /* get all children of current container */
	if ( kids.length > 0 ) { /* when we have children */
		obj_handled = false;
		found_style = false;

		while ( i < kids.length ) {
			if ( $( kids[ i ] ).children().length == 0 ) { /* when current child is childless */
				if ( typeof $( kids[ i ] ).attr( 'style' ) !== 'undefined' ) { /* when we have applied hard coded styles to current kid */
					addStyledObj( $( kids[ i ] ) ) /* add/update stack with this kid */
				}
				obj_handled = true /* set flag to move to next element */
			}
			else { /* when current child have own kids */
				if ( typeof $( kids[ i ] ).attr( 'style' ) !== 'undefined' ) { /* when we have applied hard coded styles to current kid */
					addStyledObj( $( kids[ i ] ) )/* add/update stack with this kid */
				}
				waiting_for_children = true; /* block second exit point */
				parents_stack.push( $( start_con ) ) /* save curently scanned element (parent) to know what to continue to scan when returned from wonderland */
				index_stack.push( i ) /* save current index before going even deeper */
				if ( scanForHardCodedStyles( $( kids[ i ] ) ) == 'handled' ) { /* when finished with inner children loop (recurse) */
					start_con = parents_stack[ parents_stack.length -1 ] /* restore previous deepnes level */
					i = index_stack[ index_stack.length - 1 ] /* restore prevoius deepnes level index */
					kids = $( start_con ).children(); /* get all children of current container */
					parents_stack.pop() /* remove the last element from the stack */
					index_stack.pop() /* remove the last element from the stack */
					obj_handled = true /* set flag to go next item or exit if finished */
					waiting_for_children = false /* set the second exit point flag */
				}
			}
			
			if ( !waiting_for_children ) { obj_handled = true } /* prevent infinite loop */

			if ( obj_handled ) { /* when we have handled current object */
				i++ /* go to next object or quit */
				obj_handled = false /* reset the flag */
			}
		}

		if ( typeof callback === 'function' ) { /* when callback is present and it's function */
			callback( styled_objs ) /* exit trough callback */
		}
		else {
			return 'handled' /* exit trough return */
		}
	}
}

function acts( cur_class_name, cur_obj ) { /* acts = Add Class to Stack */
	new_class = { name: cur_class_name, style: $( cur_obj ).attr( "style" ) }; 
	new_classes.push( new_class ); 
}

function previewProject() {
	saveTemplate( true );
}

function saveTemplate( is_preview ) {
	if ( typeof is_preview == 'undefined' ) {
		is_preview = false;
	}
	resetBodyShortcuts();
	if ( !save_handled ) {
		save_handled = true;
		hideSuggests() /* just in case suggest are visible */
		if ( !is_preview ) {
			var schcsRes = scanForHardCodedStyles( $( '#dContent_con' ), function ( styled_objs ) { /* scan content for hard coded styles */
				if ( styled_objs.length > 0 ) { /* when hard coded styles found */
					cte = ''; /* cte = Code To Execute */
					/* Generating dynamic code section (for better handling of multiple askFor calls) */
					for ( i = 0; i < styled_objs.length; i++ ) { /* iterate each styled objects adding to cte (Code To Execute) in way that each next is executed after the callback of the precious is called */
						styled_obj = styled_objs[ i ]

						cte += '$( styled_objs[ ' + i + ' ].objs[ 0 ] ).addClass( "hard_shadow" ); ' /* add highlight class to first object */
						cte += 'cur_sc = $( styled_objs[ ' + i + ' ].objs[ 0 ] ); ' /* udpdate cur_sc with current object  */
						cte += 'scrollTo( cur_sc ); '; /* scroll to highlighted object */
						cte += 'askFor( "Enter a Class Name For Highlighted Element Styles", "", function ( cur_class_name ) { '; /* ask for name of the new class */
							cte += 'styled_objs[ ' + i + ' ].objs.forEach( function( cur_obj, cur_index ) { '; /* iterate each object with same style and remove the styling updatating the element with the new class instead */
								cte += 'if ( cur_index == 0 && cur_class_name != "exit") { '; /* when it's the highlighted object */
									cte += 'acts( cur_class_name, $( cur_obj ) ); '; /* add the new class to the stack */
									cte += '$( cur_obj ).addClass( cur_class_name ); '; /* add the created class instead of the styles */
								cte += '}; ';
								cte += '$( cur_obj ).removeClass ( "hard_shadow" ); '; /* remove hightligh class */
								cte += '$( cur_obj ).removeAttr( "style" ); '; /* remove style attribute */
							cte += '}); ';
					}
					cte += ' prepHTMLandSave(); '; /* after all hard coded styles are named in classes -> continue saving the data */
					for ( i = 0; i < styled_objs.length; i++ ) {
						cte += '}); '; /* add closing tags for each call of askFor() in cte (Code To Execute) */
					}
					eval( cte ) /* Execute Generated Code */
				}
				else {
					prepHTMLandSave();
				}
			})
		}
		else {
			prepHTMLandSave( true );
		}
	}
}

function prepHTMLandSave( is_preview ) {
	if ( typeof is_preview == 'undefined' ) {
		is_preview = false;
	}
	$( '#dContent' ).html( $( '#dContent' ).html()
		.replace( /\r/g, '' ) 
		.replace( /\n/g, '' )
		.replace( /\t/g, '' ) ) /* .replace( /&nbsp;/g, '' ) remove all non-breaking spaces, new lines or tabs */
	reverse_parse_HTML( $( '#dContent' ) ) /* remove ( BSCNWAD ) edit helping content from the HTML */	
	showMF()
	if ( is_preview ) {
		$( '#dInfo' ).html( 'Preparing Preview...' ).removeClass( 'hide' )
	}
	else {
		$( '#dInfo' ).html( 'Saving Template...' ).removeClass( 'hide' )
	}
	formated_html = $( '#dContent' ).html() /* move cleaned template html into js var */
	/* SEND COLLECTED DATA TO SERVER TO BE SAVED */
	$.ajax({
		url: "/ajax",
		type: "POST",
		data: {
			dAction: 'ajaxHandler(req, res)',
			req: 'save_template',
			formated_html: formated_html,
			vars: JSON.stringify ( vars ),
			vars_db_info: JSON.stringify ( vars_db_info ),
			new_classes: JSON.stringify ( new_classes ), 
			top_suggests: JSON.stringify ( top_suggests ), 
			is_preview: is_preview
		},
		success: function() {
			setTimeout(function() { /* wait quater of second just for user convinience (to see that "save template" text is showing and disapearing) */
				if ( is_preview ) {
					window.location.href = '/project_preview/'+ cur_project +'/'+ cur_route + '/' + cur_template;
				}
				else {
					location.reload(); /* reload page to apply style/class changes (if had some) */
				}
			}, 250 )
		},
		error: function( err ) {
			console.log('ERROR : ' + err)
		}
	})
}

function unwrap_SS( obj ) {
	$( obj ).append('<span class="unwrap_helper"></span>') /* add unwrap helper element */
	$( '.unwrap_helper' ).unwrap() /* unwrwap nsmarty_code container */
	$( '.unwrap_helper' ).remove() /* remove the helper element */
}

function reverse_parse_HTML( obj ) {
	kids = $( obj ).children()
	if ( kids.length > 0 ) {
		$( kids ).each( function( kid_index, cur_kid ) {
			has_kids = false
			/* remove all system (VAB) attributes from current html element */
			$( cur_kid ).removeAttr( 'contenteditable' )
			.removeAttr( 'spellcheck' )
			.removeAttr( 'sc' )
			attrs_to_remove = []
			
			for (var i = 0; i < cur_kid.attributes.length; i++) { /* iterate trough all cur_kid attributes */
				var attr = cur_kid.attributes[i] /* get current attribute in attr */
				if ( attr.value.length == 0 ) { /* if the attr is specified and it's empty -> remove it attr.specified &&  */
					attrs_to_remove.push( attr.name ) /* mark current attribute for removing */
				}
			}

			if ( attrs_to_remove.length > 0 ) { /* when empty attributes found */
				attrs_to_remove.forEach( function( cur_empty_attr ) { /* iterate trough each attr name */
					$( cur_kid ).removeAttr( cur_empty_attr ) /* remove current empty attribute */
				})
			}

			if ( $( cur_kid ).children().length > 0 ) { /* when current child have childs */
				reverse_parse_HTML( $( cur_kid ) ) /* (recurse) */
			}
			else { /* otherwise -> check for smarty statement container and remove it */
				if ( $( cur_kid ).hasClass( 'nsmarty_code' ) ) {
					unwrap_SS( cur_kid )
				}
			}
		})
	}
	
	if ( $( obj ).hasClass( 'nsmarty_code' ) ) { /* when current obj is nsmarty_code container */
		unwrap_SS( obj )
	}
}

function parse_smarty() {
	kids = $('#selItmCon').children() /* select the edited element by getting childs of the selItemCon container */
	if ( $(kids[0]).html() != '' ) {
		data = $(kids[0]).html() /* get current html */
		parsed_html = '' /* initialize parsed html */
		capture_smarty = false /* initialize capture_smarty flag */
		captured_smarty = '' /* we keep currently captured smarty statement here */
		last_ch = ''
		smarty_closing_tags = [] /* posible values : {/block} , {/capture} , {/for} , {/foreach} , {/function} , {/javascript} , {/if} */

		/* parsing begins here */
		for (i = 0; i < data.length; i++ ) { /* walk trough data text char by char */
			ch = data.substr( i, 1 ) /* get current char in ch */
			if ( i > 0 ) { /* only when not first char */
				last_ch = data.substr( ( i - 1 ), 1 ) /* keep last ch for later checks */
			}

			if ( ch == '}' ) { /* when end of smarty detected -> finish capturing of smarty and applying proper html wraper around it */
				is_open_or_closing_tag = false
				/* check if current smarty statement is opening smarty tag */
				/* BLOCK */
				if ( captured_smarty.substr(0, 6) == '{block' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/block' )
				}
				/* CAPTURE */
				else if ( captured_smarty.substr(0, 8) == '{capture' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/capture' )
				}
				/* FOR */
				else if ( captured_smarty.substr(0, 5) == '{for ' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/for' )
				}
				/* FOREACH */
				else if ( captured_smarty.substr(0, 9) == '{foreach ' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/foreach' )
				}
				/* FUNCTION */
				else if ( captured_smarty.substr(0, 9) == '{function' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/function' )
				}
				/* JAVASCRIPT */
				else if ( captured_smarty.substr(0, 11) == '{javascript' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/javascript' )
				}
				/* IF */
				else if ( captured_smarty.substr(0, 3) == '{if' ) { 
					is_open_or_closing_tag = true
					smarty_closing_tags.push( '{/if' )
				}
				/* OPENING TAG */
				if ( is_open_or_closing_tag ) { /* when opening tag found ( we didn't check for closing yet, so it's opening ) */ 
					parsed_html += '<code class="nsmarty_code" sc="true">'
					parsed_html += '<code class="fsc nsmarty_code" sc="true">'+captured_smarty+'}</code>' /* fsc = First Smarty Child */
					
					capture_smarty = false /* reset the flag for capturing smarty */
					captured_smarty = '' /* reset captured smarty code */
				}
				/* CLOSING TAG */			
				else if ( smarty_closing_tags.length > 0 ) { /* when we are looking for closing smarty tags */
					if ( smarty_closing_tags[ smarty_closing_tags.length - 1 ] == captured_smarty ) { /* when last closing tag match current captured_smarty */
						is_open_or_closing_tag = true
						parsed_html += '<code class="lsc nsmarty_code" sc="true">'+captured_smarty+'}</code>'
						parsed_html += '</code>'
						smarty_closing_tags.pop()
						capture_smarty = false /* reset the flag for capturing smarty */
						captured_smarty = '' /* reset captured smarty code */
					}
				}
				/* NOT OPENING OR CLOSING TAG */
				if ( !is_open_or_closing_tag ) {
					/* put capsulated with html smarty block */
					parsed_html += '<code class="nsmarty_code" sc="true">'
					parsed_html += captured_smarty+'}'
					parsed_html += '</code>'
					capture_smarty = false /* reset the flag for capturing smarty */
					captured_smarty = '' /* reset captured smarty code */
				}
			}

			if ( ch == '{' ) { /* when "{" found -> start capturing of smarty code */
				capture_smarty = true /* set capturing smarty code flag to skip adding it before it's finished and we wrap it properly as present fot the html parser */
			}

			if ( capture_smarty ) { /* when smarty code capturing */
				captured_smarty += ch
			}
			else { /* when not capturing smarty code -> populate parsed_html as plain text char by char */
				if ( ch != '}' ) { /* otherwise -> add everthing except } which is added when created smarty code wraping */
					parsed_html += ch	
				}
			}
		}

		$(kids[0]).html( parsed_html ) /* replace current html with parsed one */
	}
}

function toggleField( obj ) {
	id_arr = $( obj ).attr( 'id' ).split('_')
	label = $( '#dbtfl_' + id_arr[1] )
	if ( $(label).hasClass( 'tc-gy' ) ) { /* when the current label has highligh class -> remove it */
		$(label).removeClass( 'tc-gy' )
	} else { /* otherwise -> add highligh class */
		$(label).addClass( 'tc-gy' )
	}
}

function selectAllFields() {
	/* dbtfcb = Data Base Table Field Check Box */
	$('.dbtfcb').each( function() { /* iterate trough each check box and check it */
		id_arr = $( this ).attr( 'id' ).split('_') /* split current id to get it's number */
		label = $( '#dbtfl_' + id_arr[1] ) /* id_arr index 1 must be the current id number */
		$( this ).prop("checked", true) /* select current field */		
		$(label).addClass( 'tc-gy' ) /* set highlight class to current label */
	})
}

function unselectAllFields() {
	/* dbtfcb = Data Base Table Field Check Box */
	$('.dbtfcb').each( function() { /* iterate trough each check box and check it */
		id_arr = $( this ).attr( 'id' ).split('_') /* split current id to get it's number */
		label = $( '#dbtfl_' + id_arr[1] ) /* id_arr index 1 must be the current id number */
		$( this ).prop("checked", false) /* unselect current field */		
		$(label).removeClass( 'tc-gy' ) /* remove highlight class to current label */
	})
}

function backToTemplates() {
	/* set the action : back to previous module (templates) */
	$('#dAction').val('backToTemplates(req, res)')
	/* submit request */
	window.document.getElementById('dForm').submit()
}