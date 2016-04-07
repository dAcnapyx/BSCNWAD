module.exports = {
	init: function(req, res) {
		var dc = require('./dCore');
		var nsmarty = require('nsmarty');
		var fs = require('fs');
		var ncp = require('ncp');
		var db = require('./dMysql');

		var exec = require( 'child_process' ).exec;
		function puts( error, stdout, stderr ) { console.log( stdout ) }
		/* stop app.js of currently edited project preview (just in case it's started in preview mode) */
		exec( 'pkill -f "node app.js"', puts );
		
		route = cur_route + '/';
		if (cur_route === 'home') { 
			route = '/'
		}

		var path = __dirname + '/projects/' + cur_project + '/' + route;

		/* delete temp template template_edit.tpl if presented */
		fs.exists(__dirname+'/template_edit.tpl', function ( exists ) {
			if ( exists ) {
				fs.unlink(__dirname+'/template_edit.tpl', function(err) { if (err) throw err })
			}
		})

		/* GET CURRENT PROJECT TOP SUGGESTS COLLECTION IF THE FILE EXISTS */
		fs.exists( path + '/top_suggests.txt', function ( exists ) {
			if ( exists ) {
				var lazy = require('lazy');
				var fileLines = [];
				req.arr.top_suggests = [];
				new lazy(fs.createReadStream( path + 'top_suggests.txt' ))
					.lines
					.forEach(function( line  ) {
						cur_line = line.toString(); /* convert the chunk to string */
						cur_arr = cur_line.split('|');
						req.arr.top_suggests.push( { item: cur_arr[ 0 ], count: cur_arr[ 1 ] } ); /* add the line to fileLines array */
					}
				)
			}
		})

		data = ''
		readableStream = fs.createReadStream( __dirname + '/projects/' + cur_project + '/' + route + cur_template )

		readableStream.on( 'data', function ( chunk ) {
			data += chunk
		})

		readableStream.on( 'end', function() {
			/* copy current template into temp editable template_edit.tpl */
			fs.exists( __dirname + '/projects/' + cur_project + '/' + route + '/' + cur_template, function ( exists ) {
				ncp( __dirname + '/projects/' + cur_project + '/' + route + '/' + cur_template, __dirname + '/template_edit.tpl', function ( err ) { if ( err ) throw err })
			})
		})
	},

	ajaxHandler: function(req, res) {
		db = require('./dMysql')
		ids = []

		switch ( req.fields.req ) {
			case 'load_template' :
				var fs = require( 'fs' );
				var util = require( 'util' );
				var nsmarty = require( 'nsmarty' );
				var db = require( './dMysql' );
				var data = '';
				readableStream = fs.createReadStream( req.fields.file );

				readableStream.on( 'data', function( chunk ) {
					data += chunk
				})

				readableStream.on( 'end', function() {
					htmlparser = require( 'htmlparser2' )
					handler = new htmlparser.DefaultHandler(
						function ( error, dom ) {}
						, { ignoreWhitespace: true /* saves some time parsing empty lines */ 
						  , enforceEmptyTags: false /* set to false because when true and the parser got to such tag the last can't go out of a loop */ 
						  }
					)
					parser = new htmlparser.Parser( handler )
					formated_html = ''
					closing_tags_arr = []
					last_index_arr = []
					vars = []

					if ( data.length > 0 ) {
						parse_smarty2dom ( data, function( new_data ) { /* parse smarty elements of the template -> converting them to editable dom containers */
							var re = /([$][\w.]+)/ /* pattern which catches smarty vars */
							data = new_data /* rewrite data while keep new_data untouched */
							/* cycle until no matches left */
							for (var found=data.match(re); found; found=data.match(re))
							{
								/* check for sub vars */
								var_arr = found[0].split('.')
								var_arr.forEach( function( var_name, index ) {
									if ( index == 0 ) { /* when first ( main ) var */
										main_var = var_name
									}

									if ( vars.length > 0 ) { /* when we had added vars already */
										is_found = false
										/* check all added vars for dublication */
										vars.forEach( function( cur_var, cur_index ) {
											if ( main_var == cur_var['main_var'] 
											  && cur_var['name'] == var_name 
											  && cur_var['index'] == index ) { /* when we have full match of var names and levels -> skip adding */
												is_found = true
											}
										})

										if ( !is_found ) { /* only when not found in currently added vars -> add it to coresponding level */
											vars.push({"full_var":found[0],"main_var":main_var,"name":var_name,"index":index})
										}
									}
									else { /* when first var */
										vars.push({"full_var":found[0],"main_var":main_var,"name":var_name,"index":index})
									}
								})
								data = data.slice(found.index + found[0].length);
							}
							/* sort the vars for debug readability */
							vars = vars.sort( function( a, b ) {
								return a.full_var > b.full_var ? 1 : a.full_var < b.full_var ? -1 : 0
							})
							
							parser.parseComplete( new_data ) /* parse the html into ast */ 
							dom = handler.dom /* get ast in dom */

							db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['name'], [], 'WHERE `is_selfcontaining` = 1', function ( rows ) { /* get all selfcontaining html tags */
								selfcontaining_tags = []

								if ( rows.length > 0 ) {
									rows.forEach( function( row ) { /* iterate all rows and populate selfcontaining_tags collection */
										selfcontaining_tags.push( row.name )
									})
								}
								
								parse_html( dom, selfcontaining_tags, function() { /* parse the html to VAB editable one */
									/* add current project path to any src which will be removed on sabe */
									formated_html = formated_html.replace( /src="/g, 'src="/projects/' + cur_project ) /* add project path on each src attribute ( which will be removed on saving ) */
									res_obj = JSON.stringify( { "html": formated_html, "vars": JSON.stringify( vars ) } )
									if ( res_obj.length > 0 ) {
										res.end( res_obj ) /* return formated html to browser */
									}
									else {
										res.end( '' ) /* ensure we return something */
									}
								})
							})
						})
					}
					else {
						res.end( '' ) /* ensure we return something */
					}
				})
				break
			case 'save_template' : 
				fs = require('fs');
				mysql = require('mysql');

				function addTabs( tab_num ) {
					tabs = ''
					if ( tab_num > 0 ) {
						for ( j = 0; j < tab_num; j++ ) {
							tabs += '\t'
						}
					}
					return tabs
				}

				/* set route based on cur_route */
				if (cur_route === 'home') { /* when cur route is home -> remove route string */
					route = ''
				}
				else {
					route = cur_route + '/'
				} 
				
				db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['name'], [], ' WHERE `is_selfcontaining` = 1', function ( rows ) { /* get all selfcontaining html tags */
					selfcontaining_tags = []

					if ( rows.length > 0 ) {
						rows.forEach( function( row ) { /* iterate all rows and populate selfcontaining_tags collection */
							selfcontaining_tags.push( row.name )
						})
					}

					/* INITIALIZE PARAMS */
					var path = __dirname + '/projects/' + cur_project + '/' + route;
					var proj_path = __dirname + '/projects/' + cur_project + '/';
					var tpl_path = __dirname + '/projects/' + cur_project + '/' + route + cur_template; /* set template path */
					var data = req.fields.formated_html;
					var last_ch = '';
					var new_data = '';
					var capture_smarty = false;
					var capture_html = false;
					var in_javascript = false;
					var smarty_closing_tags = [];
					var captured_html = '';
					var captured_smarty = '';
					var captured_txt = '';
					var tag_name = '';
					var tab_num = 0;
					var last_tab_num = 0;
					var lctt = 'none'; /* lctt = Last Captured Tag Type : used for arrangement checks */
					var is_lctt_ta = false /* track if last added html tag was opening textarea */
					var cctt = 'none'; /* cctt = Current Captured Tag Type : used for arrangement checks */
					var in_html_tag = false;

					data = data.replace( /<!--rtos/g, '' ).replace( /rtos-->/g, '' ); /* uncomment any commented script declarations in template data */
					for (i = 0; i <= data.length; i++ ) { /* walk trough data text char by char */
						ch = data.substr( i, 1 ) /* get current char in ch */
						
						if ( i > 0 ) { /* only when not first char */
							last_ch = data.substr( ( i - 1 ), 1 )	
						}

						if ( last_ch == '>' ) { /* when closing html tag found -> reset in_html_tag flag */
							lctt = cctt /* save current captured tag as last captured tag in order to compare them later */
							cctt = 'html_tag'
							if ( captured_html.substr( 0, 8 ) == '<script ' ) { /* when opening script tag detected */
								if ( captured_html.indexOf( 'src' ) == -1 ) { /* only when no 'src' string ( we assume that when no src added to script tag the actual script is there so we set in_javascript flag to prevent adding html tags in js code ) */
									in_javascript = true
								}
							}
							else if ( captured_html.substr( 0, 9 ) == '</script>' ) { /* when closing script tag detected */
								in_javascript = false
							}
							if ( captured_html.substr( 1, 1 ) != '/' ) { /* when not closing tag */
								tag_name = ''
								for( tni = 1; tni < captured_html.length - 1; tni++ ) { /* tni = Tag Name Index */
									ctnc = captured_html.substr( tni, 1 ) /* ctnc = Current Tag Name Char */
									if ( ctnc == ' ' ) { /* when found space -> exit loop */
										break
									}
									else {
										tag_name += ctnc
									}
								}
								
								/* SELFCONTAINING HTML TAG */
								if ( selfcontaining_tags.indexOf( tag_name ) != -1 ) {
									new_data += addTabs( tab_num ) /* add current num tabs */
									new_data += captured_html
									new_data += '\r\n' /* add new line */
								}
								/* OPENING HTML TAG */
								else {
									new_data += addTabs( tab_num ) /* add current num tabs */
									new_data += captured_html
									if ( captured_html.indexOf('<textarea ') == -1 ) { /* add one more tab and new line only when not textarea */
										new_data += '\r\n' /* add new line */
										tab_num++
									}
									else {
										is_lctt_ta = true;
									}
								}
							}
							/* CLOSING HTML TAG */
							else { 
								tab_num--
								if ( !is_lctt_ta ) {
									new_data += addTabs( tab_num ) /* add current num tabs */
								}
								if ( captured_html.indexOf('</textarea') != -1 ) {
									is_lctt_ta = false;
									tab_num++;
								}
								new_data += captured_html
								new_data += '\r\n' /* add new line */
							}
							captured_html = '' /* reset captured_html */
							in_html_tag = false
						}

						if ( ch == '<' ) { /* when start html tag found -> trigger in_html_tag to prevent applying changes if there is smarty statements in tag attributes */
							if ( captured_txt.length > 0 ) { /* only when captured something between two tags */
								if ( captured_txt != ' ' ) {
									new_data += addTabs( tab_num )
								}
								new_data += captured_txt
								if ( captured_txt != ' ' ) {
									new_data += '\r\n'
								}
								captured_txt = ''
							}
							in_html_tag = true
						}

						if ( ch == '}' && !in_html_tag ) { /* when end of smarty detected -> finish capturing of smarty and applying proper html wraper around it */
							lctt = cctt /* save current captured tag as last captured tag in order to compare them later */
							cctt = 'smarty_tag'
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
								in_javascript = true
								smarty_closing_tags.push( '{/javascript' )
							}
							/* IF */
							else if ( captured_smarty.substr(0, 3) == '{if' ) { 
								is_open_or_closing_tag = true
								smarty_closing_tags.push( '{/if' )
							}
							/* OPENING TAG */
							if ( is_open_or_closing_tag ) { /* when opening tag found ( we didn't check for closing yet, so it's opening ) */ 
								new_data += addTabs( tab_num )
								new_data += captured_smarty+'}'
								new_data += '\r\n' /* add new line */
								tab_num++ 
								
								capture_smarty = false /* reset the flag for capturing smarty */
								captured_smarty = '' /* reset captured smarty code */
							}
							/* CLOSING TAG */
							else if ( smarty_closing_tags.length > 0 && !in_html_tag ) { /* when we are looking for closing smarty tags */
								if ( smarty_closing_tags[ smarty_closing_tags.length - 1 ] == captured_smarty ) { /* when last closing tag match current captured_smarty */
									is_open_or_closing_tag = true
									tab_num--
									new_data += addTabs( tab_num )
									new_data += captured_smarty+'}'
									new_data += '\r\n'

									smarty_closing_tags.pop()
									if ( captured_smarty == '{/javascript' ) {
										in_javascript = false
									}

									capture_smarty = false /* reset the flag for capturing smarty */
									captured_smarty = '' /* reset captured smarty code */
								}
							}
							/* NOT OPENING OR CLOSING TAG ( SELFCONTAINING ) */
							if ( !is_open_or_closing_tag && !in_html_tag && capture_smarty ) {
								if ( captured_smarty == '{else' || captured_smarty == '{forelse' || captured_smarty == '{foreachelse' ) {
									tab_num--
								}
								if ( !is_lctt_ta ) { /* add tabs only when not in textarea to prevent whitespaceing in displaying textarea content */
									new_data += addTabs( tab_num )
								}
								new_data += captured_smarty+'}'
								if ( !is_lctt_ta ) { /* add tabs only when not in textarea to prevent whitespaceing in displaying textarea content */
									new_data += '\r\n'
								}
								if ( captured_smarty == '{else' || captured_smarty == '{forelse' || captured_smarty == '{foreachelse' ) {
									tab_num++
								}

								capture_smarty = false /* reset the flag for capturing smarty */
								captured_smarty = '' /* reset captured smarty code */
							}
						}

						if ( ch == '{' && !in_html_tag && !in_javascript ) { /* when "{" found -> start capturing of smarty code */
							if ( captured_txt.length > 0 ) { /* only when captured something between two tags */
								if ( captured_txt != ' ' ) {
									new_data += addTabs( tab_num )
								}
								new_data += captured_txt
								if ( captured_txt != ' ' ) {
									new_data += '\r\n'
								}
								captured_txt = ''
							}
							capture_smarty = true /* set capturing smarty code flag to skip adding it before it's finished and we wrap it properly as present fot the html parser */
						}

						if ( capture_smarty ) { /* when smarty code capturing */
							captured_smarty += ch
						}
						else { /* when not capturing smarty code -> populate new_data as plain text char by char */
							if ( in_html_tag ) { /* when char is in html tag declaration -> add everything */
								captured_html += ch
							}
							else if ( ch != '}' ) { /* otherwise -> add everthing except } which is added when created smarty code wraping */
								captured_txt += ch
								cctt = 'plain_text'
							}
						}
					}

					new_data = new_data.replace( /\/projects\/[\w\.]+/g, '' ) /* remove project path (which is used to preview images and other source files but must not be in final saved file) */

					/* WRITE FORMATED TEMPLATE TO FILE */
					fs.writeFile( tpl_path, new_data ,function( err ) {
						if ( err ) {
							console.error( err )
						}
					})
					
					req.fields.new_classes = JSON.parse( req.fields.new_classes ) /* convert from string to object */

					/* UPDATE PROJECT's global.css IF NEW CLASSES ADDED */
					if ( req.fields.new_classes.length > 0 ) { /* when we have converted styles to classes -> save them to global.css */
						req.fields.new_classes.forEach( function ( cur_class, index ) {
							db.Execute( 'Add', [[{table_name: 'projects_classes'}]], ['project', 'name', 'title'], [mysql.escape(cur_project), mysql.escape(cur_class.name), mysql.escape('')], '', function () {} ) /* add the new class to db */
							cur_new_class = '.' + cur_class.name + ' { ' + cur_class.style + '}\n\n'; /* generate class string for saving */
							fs.appendFileSync( __dirname + '/projects/' + cur_project + '/global.css', cur_new_class )
						})
					}

					/* UPDATE PROJECT'S TOP SUGGEST */
					if ( req.fields.top_suggests !== 'undefined' && req.fields.top_suggests != '' ) {
						var top_suggests = JSON.parse( req.fields.top_suggests ) 
						var top_suggests_content = '';
						fs.writeFile( proj_path + 'top_suggests.txt', top_suggests_content , function( err ) {
							while ( top_suggests.length > 0 ) {
								cur_top_suggest = top_suggests.shift();
								fs.appendFileSync( proj_path + 'top_suggests.txt', cur_top_suggest.item + '|' + cur_top_suggest.count + '\n' );
							}
						})
					}

					/* CHECK IF THERE IS FETCHED VARS FROM DB TO */
					if ( req.fields.vars_db_info !== 'undefined' ) { /* when there is new fetched vars in last edit */
						var db_info = JSON.parse( req.fields.vars_db_info ) 
						var fetched_vars = JSON.parse( req.fields.vars )
						var tables_arr = [] /* used to store the db table names */
						var fields_arr = []; /* used to store the db fields collections */
						var dbs_arr = []; /* used to store the db names */
						var where_arr = []; /* used to store where claueses of the queries (filled manualy from the user) */
						var smarty_vars = []; /* used to store the smarty vars where the pulled data will be stored */

						db_info.forEach( function ( cur_tbl ) {
							var_name = cur_tbl.var_name; /* set the var in which will be stored the result of the db query */
							table_name = cur_tbl.table_name; /* set db table name */
							db_name = cur_tbl.db_name; /* set db name */

							var fields_get = [];

							fetched_vars.forEach( function ( cur_var ) {
								if ( cur_var.main_var == var_name && cur_var.name != cur_var.main_var ) { /* when we have vars match get current db table field name */
									fields_get.push( cur_var.name );
								}
							})

							fields_get_str = '';
							if ( fields_get.length > 0 ) {
								fields_get.forEach ( function ( cur_field, cfi ) {
									fields_get_str += "'"+ cur_field +"'";
									if ( cfi !== fields_get.length - 1 ) { /* when not last add separator */
										fields_get_str += ",";
									}
								})
							}

							tables = "\t\ttables_arr.push([[{table_name: '" + table_name + "'}]]);\n";
							fields = "\t\tfields_arr.push([" + fields_get_str + "]);\n";
							cur_db = "\t\tdbs_arr.push('" + db_name + "');\n";
							cur_var = "\t\tsmarty_vars.push('" + var_name.replace('$', '') + "');\n";
							cur_where = "\t\twhere_arr.push('');\n";

							tables_arr.push( tables );
							fields_arr.push( fields );
							dbs_arr.push( cur_db );
							smarty_vars.push( cur_var );
							where_arr.push( cur_where );
							db_info.shift();
						})

						/* update index.js adding the needed data for the db queries */
						var lazy = require('lazy');
						var fileLines = [];
						new lazy(fs.createReadStream( path + 'index.js' ))
							.lines
							.forEach(function(line) {
								cur_line = line.toString(); /* convert the chunk to string */
								fileLines.push(cur_line); /* add the line to fileLines array */
							}
						)
						.join(function () { /* when reading the file is done */
							fileLinesMirror = [];
							if ( fileLines.length > 0 && fileLines !== fileLinesMirror) {
								index_content = '' /* reset index.js content */
								fs.writeFile( path + 'index.js', index_content , function( err ) {
									if ( err ) {
										console.error( err )
									}
									fileLines.forEach ( function ( cur_line, index ) {
										if ( cur_line.indexOf( '/* DB TABLES END */' ) != -1 && tables_arr.length > 0 ) { /* when found system line for end of db tables initializing */
												while ( tables_arr.length > 0 ) {
												cur_table = tables_arr.shift();
												fs.appendFileSync( path + 'index.js', cur_table );
											}
										}
										else if ( cur_line.indexOf( '/* DB FIELDS END */' ) != -1 && fields_arr.length > 0 ) { /* when found system line for end of db fields initializing */
											while ( fields_arr.length > 0 ) {
												cur_field = fields_arr.shift();
												fs.appendFileSync( path + 'index.js', cur_field );
											}
										}
										else if ( cur_line.indexOf( '/* DB NAMES END */' ) != -1 && dbs_arr.length > 0 ) { /* when found system line for end of db names initializing */
											while ( dbs_arr.length > 0 ) {
												cur_db = dbs_arr.shift();
												fs.appendFileSync( path + 'index.js', cur_db );
											}
										}
										else if ( cur_line.indexOf( '/* SMARTY VARS END */' ) != -1 && smarty_vars.length > 0 ) { /* when found system line for end of smarty vars initializing */
											while ( smarty_vars.length > 0 ) {
												cur_var = smarty_vars.shift();
												fs.appendFileSync( path + 'index.js', cur_var );
											}
										}
										else if ( cur_line.indexOf( '/* WHERE CLAUSE END */' ) != -1 && where_arr.length > 0 ) { /* when found system line for end of where clause initializing */
											while ( where_arr.length > 0 ) {
												cur_where = where_arr.shift();
												fs.appendFileSync( path + 'index.js', cur_where );
											}
										}
										if ( cur_line != '0' ) {
											fs.appendFileSync( path + 'index.js', cur_line + '\n' )
										}
										fileLinesMirror.push(cur_line);
									}) /* end of forEach */
								}) /* end of writeFile */
							} /* end of if */
						});
					}
					res.end()
				})
				break
			case 'get_all_tables_by_db_name' :
				db.getTables( req.fields.db_name, function( db_tbls ) {
					res.end( JSON.stringify( db_tbls ) )
				})
				break
			case 'get_all_fields_by_db_table_name' :
				db.getFields( req.fields.db_name, req.fields.db_table_name, function ( fields ) {
					res.end( JSON.stringify( fields ) )
				})
				break
			case 'get_html_tags_by_str' :
				db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['name', 'title'], [], 'WHERE `name` LIKE "%'+req.fields.str+'%" ORDER BY `name` DESC', function ( rows ) {
					res.end( JSON.stringify( rows ) )
				})
				break
			case 'get_default_attrubutes_by_tag_name' :
				/* detect smarty statement */
				if ( req.fields.name.substr( 0, 1 ) == '{' ) { /* when adding smarty statement */
					db.Execute( 'Get', [[{table_name: 'smarty_statements'}]], ['full_statement'], [], 'WHERE `name` = "'+req.fields.name+'"', function ( rows ) {
						if ( rows.length !== 0 ) {
							data = rows[0].full_statement
							data = data.replace( /\\'/g, "'" )
							parse_smarty2dom ( data, function( parsed_smarty ) { /* parse smarty elements of the template -> converting them to editable dom containers */
								res.end( parsed_smarty )
							})
						}
					})
				}
				else { /* otherwise -> get needed data for the html tag */
					db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['attr_ids', 'is_selfcontaining', 'name'], [], 'WHERE `name` = "'+req.fields.name+'"', function ( rows ) {
						if ( rows.length !== 0 ) {
							ht = rows[0]
							/* initialize id's array */
							ids_str = formatIds( ht.attr_ids )
							if (ids_str.length > 0) {
								where = 'WHERE (`id` IN '+ids_str+' OR `is_global` = 1)'}
							else {
								/* when no html tag specifed attributes we just get global ones */
								where = 'WHERE `is_global` = 1'
							}
							/* get all attributes with prepared query params */
							db.Execute( 'Get', [[{table_name: 'html_attributes'}]], ['*'], [], where+' AND `is_listed_by_default` = 1', function ( rows ) {
								if (rows.length > 0) {
									
									html_str = '<'+ht.name+' '
									
									rows.forEach(function(attr) {
										html_str += attr.name+'="'
										if (attr.default_value !== null) {
											html_str += attr.default_value
										}
										html_str += '" '
									})									

									if (ht.is_selfcontaining) {
										html_str += 'sc="true"/>'
									}
									else {
										html_str += 'sc="true"></'+ht.name+'>'
									}

									/* return formated html tag string */
									if ( html_str.length > 0 ) {
										res.end( html_str )
									}
									else {
										res.end( '' ) /* ensure we return something */
									}
								}
							})
						} 
						else {
							res.end( '' ) /* ensure we return something */ 
						}
					})
				}
				break
			case 'get_attr_posible_vals':
				/* get posible attr ids based on tag name */
				db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['attr_ids'], [], 'WHERE `name` = "'+req.fields.tag_name+'" ORDER BY `name` DESC', function ( rows ) {
					if (rows.length > 0) {
						ht = rows[0]
						/* initialize id's array */
						ids_str = formatIds( ht.attr_ids )
						if (ids_str.length > 0) {
							where = 'WHERE (`id` IN '+ids_str+' OR `is_global` = 1)'}
						else {
							/* when no html tag specifed attributes we just get global ones */
							where = 'WHERE `is_global` = 1'
						}
						db.Execute( 'Get', [[{table_name: 'html_attributes'}]], ['posible_values'], [], where+' AND `name`="'+req.fields.attr_name+'"', function ( rows ) {
							/* remodel the data to pass the requirements : get current result into [name: '', title: ''] */
							res_arr = []
							if (rows.length > 0 && rows[0].posible_values !== null && rows[0].posible_values !== '') {
								posible_values_arr = rows[0].posible_values.split('|')
								if (posible_values_arr.length > 0) {
									posible_values_arr.forEach(function(pos_val) {
										suugest_item = {'name': pos_val}
										/* filter the results by searched string when search str is not empty */
										if (req.fields.str != '') {
											if (pos_val.indexOf(req.fields.str) != -1) {
												res_arr.push(suugest_item)
											}
										}
										else {
											res_arr.push(suugest_item)
										}
									})
								}
							}
							res.end( JSON.stringify( res_arr ) )
						})
					}
				})
				break
			case 'get_classes_by_str':
				data = [] /* init empty data */
				db.Execute( 'Get', [[{table_name: 'bs_classes'}]], ['name', 'title'], [], 'WHERE `name` LIKE "%'+req.fields.str+'%" ORDER BY `name` DESC', function ( rows ) {
					/* add returned from db rows to data array */
					if ( rows.length > 0 ) {
						rows.forEach( function ( val ) {
							data.push( val )
						}) 
					}
					db.Execute( 'Get', [[{table_name: 'projects_classes'}]], ['name', 'title'], [], 'WHERE `project` = "'+cur_project+'" AND `name` LIKE "%'+req.fields.str+'%" ORDER BY `name` DESC', function ( rows ) {
						/* add returned from db rows to data array */
						if ( rows.length > 0 ) {
							rows.forEach( function ( val ) {
								data.push( val )
							}) 
						}
						res.end( JSON.stringify( data ) )
					})
				})
				break
			case 'get_attrs_by_html_tag': 
				/* get posible attr ids based on tag name */
				db.Execute( 'Get', [[{table_name: 'html_tags'}]], ['attr_ids'], [], 'WHERE `name` = "'+req.fields.tag_name+'" ORDER BY `name` DESC', function ( rows ) {
					if (rows.length > 0) {
						ht = rows[0]
						/* initialize id's array */
						ids_str = formatIds( ht.attr_ids )
						if (ids_str.length > 0) {
							where = 'WHERE (`id` IN '+ids_str+' OR `is_global` = 1)'}
						else {
							/* when no html tag specifed attributes we just get global ones */
							where = 'WHERE `is_global` = 1'
						}
						/* get all attributes with prepared query params */
						db.Execute( 'Get', [[{table_name: 'html_attributes'}]], ['name', 'title'], [], where+' AND `name` LIKE "%'+req.fields.str+'%" ORDER BY `name` DESC', function ( rows ) {
							if (rows.length > 0) {
								res.end( JSON.stringify( rows ) )
							}
						})
					}
				})
				break
			case 'get_smarty_statements_by_str':
				if ( req.fields.str != '' ) {
					db.Execute( 'Get', [[{table_name: 'smarty_statements'}]], ['name', 'full_statement'], [], 'WHERE `full_statement` LIKE "'+req.fields.str+'%"', function ( rows ) {
						res.end( JSON.stringify( rows ) )
					})
				}
				else {
					res.end( '' ) /* ensure we return something */
				}
				break
			default:
				res.end( '' ) /* ensure we return something */
		}

		function parse_smarty2dom ( data, callback ) {
			new_data = '' /* init new empty data string */
			capture_smarty = false
			in_html_tag = false
			in_javascript = false
			in_textarea = false
			captured_smarty = ''
			captured_html = ''
			last_ch = ''
			smarty_closing_tags = [] /* posible values : {/block} , {/capture} , {/for} , {/foreach} , {/function} , {/javascript} , {/if} */

			for (i = 0; i < data.length; i++ ) { /* walk trough data text char by char */
				ch = data.substr( i, 1 ) /* get current char in ch */
				if ( i > 0 ) { /* only when not first char */
					last_ch = data.substr( ( i - 1 ), 1 )	
				}

				if ( ch == '<' ) { /* when start html tag found -> trigger in_html_tag to prevent applying changes if there is smarty statements in tag attributes */
					in_html_tag = true
				}

				if ( last_ch == '>' ) { /* when closing html tag found -> reset in_html_tag flag */
					if ( captured_html.substr( 0, 8 ) == '<script ' ) { /* when opening script tag detected */
						if ( captured_html.indexOf( 'src' ) == -1 ) { /* only when no 'src' string ( we assume that when no src added to script tag the actual script is there so we set in_javascript flag to prevent adding html tags in js code ) */
							in_javascript = true
						}
					}
					else if ( captured_html.substr( 0, 9 ) == '</script>' ) { /* when closing script tag detected */
						in_javascript = false
					}
					if ( captured_html.substr( 0, 10 ) == '<textarea ' ) {
						in_textarea = true
					}
					else if ( captured_html.substr( 0, 11 ) == '</textarea>' ) {
						in_textarea = false
					}
					new_data += captured_html;
					captured_html = '' /* reset captured_html */
					in_html_tag = false	
				}

				if ( ch == '}' && !in_html_tag ) { /* when end of smarty detected -> finish capturing of smarty and applying proper html wraper around it */
					if ( in_textarea ) {
						new_data += ch
					}
					else {
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
							in_javascript = true
							smarty_closing_tags.push( '{/javascript' )
						}
						/* IF */
						else if ( captured_smarty.substr(0, 3) == '{if' ) { 
							is_open_or_closing_tag = true
							smarty_closing_tags.push( '{/if' )
						}
						/* OPENING TAG */
						if ( is_open_or_closing_tag ) { /* when opening tag found ( we didn't check for closing yet, so it's opening ) */ 
							new_data += '<code class="nsmarty_code" contenteditable="true" spellcheck="true" sc="true">'
							new_data += '<code class="fsc nsmarty_code" contenteditable="true" spellcheck="true" sc="true">'+captured_smarty+'}</code>' /* fsc = First Smarty Child */
							
							capture_smarty = false /* reset the flag for capturing smarty */
							captured_smarty = '' /* reset captured smarty code */
						}
						/* CLOSING TAG */
						else if ( smarty_closing_tags.length > 0 && !in_html_tag ) { /* when we are looking for closing smarty tags */
							if ( smarty_closing_tags[ smarty_closing_tags.length - 1 ] == captured_smarty ) { /* when last closing tag match current captured_smarty */
								is_open_or_closing_tag = true
								new_data += '<code class="lsc nsmarty_code" contenteditable="true" spellcheck="true" sc="true">'+captured_smarty+'}</code></code>'
								smarty_closing_tags.pop()
								if ( captured_smarty == '{/javascript' ) {
									in_javascript = false
								}
								capture_smarty = false /* reset the flag for capturing smarty */
								captured_smarty = '' /* reset captured smarty code */
							}
						}
						/* NOT OPENING OR CLOSING TAG */
						if ( !is_open_or_closing_tag && !in_html_tag && capture_smarty ) {
							/* put capsulated with html smarty block */
							new_data += '<code class="nsmarty_code" contenteditable="true" spellcheck="true" sc="true">'
							new_data += captured_smarty+'}'
							new_data += '</code>'
							capture_smarty = false /* reset the flag for capturing smarty */
							captured_smarty = '' /* reset captured smarty code */
						}
					}
				}

				if ( ch == '{' && !in_html_tag && !in_javascript && !in_textarea ) { /* when "{" found -> start capturing of smarty code */
					capture_smarty = true /* set capturing smarty code flag to skip adding it before it's finished and we wrap it properly as present for the html parser */
				}

				if ( capture_smarty ) { /* when smarty code capturing */
					captured_smarty += ch
				}
				else { /* when not capturing smarty code -> populate new_data as plain text char by char */
					if ( in_html_tag ) { /* when char is in html tag declaration -> add everything */
						captured_html += ch
					}
					else if ( ch != '}' ) { /* otherwise -> add everthing except } which is added when created smarty code wraping */
						new_data += ch
					}
				}
			}

			if ( typeof callback === 'function' ) {
				callback( new_data )
			}
		}

		function parse_html( arr, selfcontaining_tags, callback ) {
			waiting_for_children = false /* exit point flag */

			index = 0 /* initialize index on each call */
			while ( index < arr.length ) {
				obj = arr[ index ] /* get current item in obj */
				obj_handled = false
				if ( obj.type == 'text' ) { /* when plain text or smarty */
					formated_html += obj.data
					obj_handled = true
				}
				else if ( obj.type == 'tag' ) { /* when html tag */
					if ( obj.children.length > 0 ) {
						formated_html += '<' + obj.name
						obj_class = '' /* to store class attribute when found */
						if ( typeof obj.attribs !== 'undefined' ) {
							for ( attr_name in obj.attribs )
							{
								formated_html += ' ' + attr_name + '="' + obj.attribs[ attr_name ] + '"'
								if ( attr_name == 'class' ) {
									obj_class = obj.attribs[ attr_name ] /* save class to check if it's smarty container later */
								}
							}
						}
						if ( obj_class.indexOf( 'nsmarty_code' ) == -1 ) { /* when not smarty container -> add editable attributes */
							formated_html +=  ' contenteditable="true" spellcheck="true" sc="true"'
						}
						formated_html += '>'
						closing_tags_arr.push('</' + obj.name + '>') /* put in stack the closing tag as string */
						last_index_arr.push( index ) /* put in stack current index which will be restored after return of recurse */
						waiting_for_children = true
						if ( parse_html( obj.children, selfcontaining_tags, function() {} ) == 'handled' ) { /* when finished with inner children loop (recurse) */
							formated_html += closing_tags_arr [ ( closing_tags_arr.length - 1 ) ] /* add lastly added closing tag */
							closing_tags_arr.pop() /* remove the last element */
							index = last_index_arr [ ( last_index_arr.length - 1 ) ] /* restore last index */
							last_index_arr.pop() /* remove the last element */
							obj_handled = true
							waiting_for_children = false
						}
					}
					else {
						formated_html += '<' + obj.name
						obj_class = '' /* to store class attribute when found */
						if ( typeof obj.attribs !== 'undefined' ) {
							for ( attr_name in obj.attribs )
							{
								formated_html += ' ' + attr_name + '="' + obj.attribs[ attr_name ] + '"'
								if ( attr_name == 'class' ) {
									obj_class = obj.attribs[ attr_name ] /* save class to check if it's smarty container later */
								}
							}
						}
						if ( obj_class.indexOf( 'nsmarty_code' ) == -1 ) { /* when not smarty container -> add editable attributes */
							formated_html +=  ' contenteditable="true" spellcheck="true" sc="true"'
						}
						if ( selfcontaining_tags.indexOf( obj.name ) != -1 ) { /* when selfcontaining tag */
							formated_html += '/>'
						}
						else {
							formated_html += '>'
						}
						
					}
				}
				else if ( obj.type == 'script' ) { /* when script tag */
					formated_html += '<!--rtos<' + obj.name; /* rtos = Remove This On Save */
					if ( typeof obj.attribs !== 'undefined' ) {
						for ( attr_name in obj.attribs )
						{
							formated_html += ' ' + attr_name + '="' + obj.attribs[ attr_name ] + '"'
						}
					}
					formated_html += '>'
					if ( obj.children.length > 0 ) {
						formated_html += obj.children[0].data;
					}
					formated_html += '</script>rtos-->'; /* rtos = Remove This On Save */
				}

				if ( !waiting_for_children ) { obj_handled = true } /* prevent infinite loop */
				
				if ( obj_handled ) { /* when we have handled current object */
					index++ /* go to next object or quit */
					obj_handled = false /* reset the flag */
				}
			}

			if ( typeof callback === 'function' ) { /* check if callback is present and it's function */
				if ( closing_tags_arr.length == 0 ) { /* when finished with first level tags */
					callback() /* exit trough callback */
				}
				else {
					return 'handled' /* exit trough return */
				}
			}
		}

		function formatIds( groups_str ) {
			if (groups_str !== null) {
				/* get ids groups in array */
				id_groups = groups_str.split(',')
				if (id_groups.length !== 0) {
					id_groups.forEach(function(val) {
						/* check if we can get min-max combination array */
						id_group = val.split('-')
						/* min-max : true */
						if (id_group.length === 2) {
							/* cycle from first to last value */
							for (i = parseInt(id_group[0]); i <= parseInt(id_group[1]); i++) {
								ids.push(i)
							}
						}
						/* min-max: false - assume we have just one id so push it */
						else {
							ids.push(parseInt(id_group[0]))
						}
					})
					/* prepare query params */
					ids_str = '('
						ids.forEach(function(id, index){
							ids_str += '"'+id+'",'
						})
						ids_str = ids_str.substr(0, ids_str.length - 1)
					ids_str += ')'
					
					return ids_str
				}
			}
			else { /* when null ( no attributes ids ) -> return empty string */
				return ''
			}
		}
	},

	backToTemplates: function(req, res) {
		route = cur_route + '/';
		res.writeHead(301, {Location: '/templates/'+cur_project+'/'+route})
		res.end()
	}
}