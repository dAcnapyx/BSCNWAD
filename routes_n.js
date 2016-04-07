module.exports = {
	init: function(req, res) {
		dc = require('./dCore')

		/* Get routes dirs */
		var routes = dc.getDirectories({path: __dirname+'/projects/'+cur_project}, res)
		/* set first route to be home */
		var final_routes = [ 'home' ]
		routes.forEach(function(value, index) {
			/* skip node_modules */
			if (value !== 'node_modules') {
				final_routes.push(value)
			}
		})
		/* assign the result */
		req.arr.list = final_routes
	},

	addRoute: function(req, res) {
		var fs = require('fs'),
			dc = require('./dCore')

		/* creating route dir */
		var path = __dirname + '/projects/' + cur_project + '/' + req.fields.dField
		try {
			fs.mkdir( path, function() {
				/* CREATING EMPTY index.tpl */
				var index_tpl_content = ''; /* initialize empty index template */
				var tName = path + '/index.tpl'; /* creating file path */

				fs.writeFile( tName, index_tpl_content, function ( err ) { /* save index template content into index.tpl file */
					if ( err ) {
						return console.log ( err )
					}
				})

				/* CREATING index.js */
				var index_js_content = ''; /* initialize index_js_content */
				/* adding the content */
				index_js_content += 'module.exports = {\n';
				index_js_content += '\tgetData: function( req, res, main_callback ) {\n';
				index_js_content += '\t\tdb = require( \'db/dMysql\' )\n';
				index_js_content += '\t\t/* DB TABLES */\n';
				index_js_content += '\t\tvar tables_arr = []; /* used to store the db table names */\n';
				index_js_content += '\t\t/* DB TABLES END */\n';
				index_js_content += '\t\t/* DB FIELDS */\n';
				index_js_content += '\t\tvar fields_arr = []; /* used to store the db fields collections */\n';
				index_js_content += '\t\t/* DB FIELDS END */\n';
				index_js_content += '\t\t/* DB NAMES */\n';
				index_js_content += '\t\tvar dbs_arr = []; /* used to store the db names */\n';
				index_js_content += '\t\t/* DB NAMES END */\n';
				index_js_content += '\t\t/* SMARTY VARS */\n';
				index_js_content += '\t\tvar smarty_vars = []; /* used to store the smarty vars where the pulled data will be stored */\n';
				index_js_content += '\t\t/* SMARTY VARS END */\n';
				index_js_content += '\t\t/* WHERE CLAUSE */\n';
				index_js_content += '\t\tvar where_arr = []; /* used to store the where clauses of the queries */\n';
				index_js_content += '\t\t/* WHERE CLAUSE END */\n';
				index_js_content += '\t\tfunction handle_queries( tables, fields, where, db_name, smarty_var,  main_callback ) {\n';
				index_js_content += '\t\t\tif ( tables && fields && db_name && smarty_var ) {\n';
				index_js_content += '\t\t\t\tasync( tables, fields, where, db_name, smarty_var, function() {\n';
				index_js_content += '\t\t\t\t\treturn handle_queries( tables_arr.shift(), fields_arr.shift(), where_arr.shift(), dbs_arr.shift(), smarty_vars.shift(), main_callback );\n';
				index_js_content += '\t\t\t\t});\n';
				index_js_content += '\t\t\t} else {\n';
				index_js_content += '\t\t\t\tmain_callback();\n';
				index_js_content += '\t\t\t}\n';
				index_js_content += '\t\t}\n';
				index_js_content += '\t\tfunction async( tables, fields, where, db_name, smarty_var, callback ) {\n';
				index_js_content += '\t\t\tdb.Execute( \'Get\', tables, fields, [], where, function ( rows ) {\n';
				index_js_content += '\t\t\t\tif ( rows.length > 0 ) {\n';
				index_js_content += '\t\t\t\t\tcode = \'req.$arr.\' + smarty_var + \' = rows;\';\n';
				index_js_content += '\t\t\t\t\teval( code );\n';
				index_js_content += '\t\t\t\t}\n';
				index_js_content += '\t\t\t\tcallback();\n';
				index_js_content += '\t\t\t}, db_name );\n';
				index_js_content += '\t\t}\n';
				index_js_content += '\t\t/* INITIALIZING SMARTY ARRAY */\n';
				index_js_content += '\t\treq.$arr = {\n';
				index_js_content += '\t\t\ttitle: \'' + req.fields.dField + '\', \n';
				index_js_content += '\t\t\tcur_route: \'/' + req.fields.dField + '/\', \n';
				index_js_content += '\t\t\tcur_tpl: \'index.tpl\' \n';
				index_js_content += '\t\t};\n';
				index_js_content += '\t\t/* INITIALIZING SMARTY ARRAY END */\n';
				index_js_content += '\t\thandle_queries( tables_arr.shift(), fields_arr.shift(), where_arr.shift(), dbs_arr.shift(), smarty_vars.shift(), main_callback ); /* execute all queries (if have data for them) and return after all data is collected */\n';
				index_js_content += '\t}\n';
				index_js_content += '}';
				
				/* creating file path */
				var index_js_file = path + '/index.js';

				fs.writeFile( index_js_file , index_js_content, function ( err ) { /* save the content into index.js file */
					if( err ) {
						return console.log ( err )
					}
					if ( req.fields.debug ) {
						console.log ( index_js_file + ' -> created successfully' )
					}
				})

				/* APPEND THE NEW ROUTE TO app.js */
				var app_content = '' /* init empty app_content */
				app_content += '\n\n/* [GET:/' + req.fields.dField + '/] */\n';
				app_content += 'app.get(\'/' + req.fields.dField + '/*\', function( req, res ) {\n';
				app_content += '\tvar module = require( \'./' + req.fields.dField + '/index.js\' );\n';
				app_content += '\tmodule.getData( req, res, function() {\n';
				app_content += '\t\tshowMasterTemplate( req, res )\n';
				app_content += '\t});\n';
				app_content += '})\n';
				app_content += '/* [GET:/' + req.fields.dField + '/ END] */';

				fs.appendFile( __dirname + '/projects/' + cur_project + '/app.js', app_content, function ( err ) { /* append app_content to app.js */
					if ( err ) {
						return console.log ( err )
					}
					res.writeHead( 301, { Location: '/templates/' + cur_project + '/' + req.fields.dField } )
					res.end()
				})
			})
		} catch ( e ) {
			if ( e.code != 'EEXIST' ) throw e
		}
	}, 

	editRoute: function(req, res) {
		cur_mod = 'templates'
		cur_route = req.fields.dField
		res.writeHead(301, {Location: '/'+cur_mod+'/'+cur_project+'/'+cur_route+'/'})
		res.end()
	},

	delRoute: function(req, res) {
		var dc = require('./dCore')

		dc.delDir({path: __dirname + '/projects/'+cur_project+'/'+req.fields.dField}, res)
		res.writeHead(301, {Location: '/routes/'+cur_project+'/'})
		res.end()
	},

	backToProjects: function(req, res) {
		cur_mod = 'projects'
		cur_project = ''
		cur_route = ''
		res.writeHead(301, {Location: '/'+cur_mod+'/'})
		res.end()
	}
}