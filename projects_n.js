module.exports = {
	init: function( req, res ) {
		dc = require( './dCore' );

		/* Get projects dirs */
		var projects = dc.getDirectories( { path: cur_mod }, res );
		req.arr.list = projects
	},

	addProject: function( req, res ) {
		var fs = require( 'fs' ),
			dc = require( './dCore' );

		/* creating project dir */
		dField = req.fields.dField
		
		var path = __dirname + '/projects/' + dField;
		try {
			fs.mkdir(path, function () {
				res.writeHead( 301, { Location: '/routes/' + dField + '/' } );
				res.end()
			})
		} catch ( e ) {
			if ( e.code != 'EEXIST' ) throw e
		}
		
		/* CREATING app.js */
		var app_content = ''; /* initialize app_content */
		/* adding the content */
		app_content += '/* [VARIABLES] */\n';
		app_content += 'var cur_route = \'\' /* populated from first url param */\n';
		app_content += '/* [VARIABLES END] */\n\n';

		app_content += '/* [MODULES] */\n';
		app_content += 'var express = require( \'express\' );\n';
		app_content += 'var path = require( \'path\' );\n';
		app_content += 'var nsmarty = require( \'nsmarty\' );\n';
		app_content += '/* [MODULES END] */\n\n';

		app_content += 'nsmarty.tpl_path = __dirname + \'/\'; /* IMPORTANT! Init Smarty Templates Path */\n\n';

		app_content += '/* [SEREVER_INIT] */\n';
		app_content += 'var app = express();\n\n';
		app_content += 'app.use( express.static( __dirname + \'/\' ) );\n';
		app_content += '/* [SEREVER_INIT END] */\n\n';

		app_content += '/* [SERVER_PORT] */\n';
		app_content += 'var port = ' + req.fields.dPort + ';\n';
		app_content += '/* [SERVER_PORT END] */\n\n';

		app_content += '/* [SEREVER_LISTEN] */\n';
		app_content += 'app.listen( port, function() {\n';
		app_content += '	console.log( \'server listening on port \' + port );\n';
		app_content += '})\n';
		app_content += '/* [SEREVER_LISTEN END] */\n\n';

		app_content += '/* [SHOW_MASTER_TEMPLATE] */\n';
		app_content += 'function showMasterTemplate( req, res ) {\n';
		app_content += '\tnsmarty.clearCache ( \'./__master.tpl\' ) /* clear cache */\n';
		app_content += '\tstream = nsmarty.assign( \'./__master.tpl\', req.$arr ) /* merge data with template */\n';
		app_content += '\tstream.pipe( res ) /* pipe out the result to the browser */\n';
		app_content += '}\n';
		app_content += '/* [SHOW_MASTER_TEMPLATE END] */\n\n';

		app_content += '/* [GET:/] */\n';
		app_content += 'app.get(\'/\', function( req, res ) {\n';
		app_content += '\tvar module = require( \'./index.js\' );\n';
		app_content += '\tmodule.getData( req, res, function() {\n';
		app_content += '\t\tshowMasterTemplate( req, res )\n';
		app_content += '\t});\n';
		app_content += '})\n';
		app_content += '/* [GET:/ END] */';
		/* creating file path */
		var appName = path + '/app.js';

		fs.writeFile( appName , app_content, function ( err ) { /* save app content into app.js file */
			if( err ) {
				return console.log ( err )
			}
			if ( req.fields.debug ) {
				console.log ( appName + ' -> created successfully' )
			}
		})

		/* CREATING _master.tpl */
		var mt_content = ''; /* initialize master template content */
		/* adding the content */
		mt_content += '<!DOCTYPE html>\n';
		mt_content += '<html lang="en">\n';
		mt_content += '\t<head>\n';
		mt_content += '\t\t<title>{$title|default:"Welcome"}</title>\n';
		mt_content += '\t\t<meta charset="utf-8" />\n';
		mt_content += '\t\t<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
		mt_content += '\t\t<meta name="description" content="{$seo->description|default:\'...\'}" />\n';
		mt_content += '\t\t<meta name="keywords" content="{$seo->keywords|default:\'...\'}" />\n';
		mt_content += '\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
		mt_content += '\t\t{* [STYLESHEETS START] *}\n';
		mt_content += '\t\t<link href="/node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" type="text/css">\n';
		mt_content += '\t\t<link href="/global.css" rel="stylesheet" type="text/css">\n';
		mt_content += '\t\t{* [STYLESHEETS END] *}\n';
		mt_content += '\t\t{* [JAVASCRIPTS START] *}\n';
		mt_content += '\t\t<script type="text/javascript" src="/node_modules/jquery/dist/jquery.min.js"></script>\n';
		mt_content += '\t\t<script type="text/javascript" src="/node_modules/bootstrap/dist/js/bootstrap.min.js"></script>\n';
		mt_content += '\t\t{* [JAVASCRIPTS END] *}\n';
		mt_content += '\t</head>\n';
		mt_content += '\t<body>\n';
		mt_content += '\t\t{include file="master.tpl"}\n';
		mt_content += '\t</body>\n';
		mt_content += '</html>';
		/* creating file path */
		var mtName = path + '/__master.tpl';

		fs.writeFile( mtName, mt_content, function ( err ) { /* save master template content into master.tpl file */
			if( err ) {
				return console.log ( err )
			}
			if ( req.fields.debug ) {
				console.log ( mtName + ' -> created successfully' )
			}
		})

		/* CREATING index.js */
		var index_js_content = ''; /* initialize index_js_content */
		/* adding the content */
		index_js_content += 'module.exports = {\n';
		index_js_content += '\tgetData: function( req, res, main_callback ) {\n';
		index_js_content += '\t\tdb = require( \'db/dMysql\' );\n';
		index_js_content += '\t\tmysql = require( \'mysql\' );\n';
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
		index_js_content += '\t\t\ttitle: \'Welcome\', \n';
		index_js_content += '\t\t\tcur_route: \'/\', \n';
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

		/* CREATING master.tpl */
		var am_content = ''; /* initialize app master template */
		var amName = path + '/master.tpl'; /* creating file path */

		am_content += '{include file="$cur_route/$cur_tpl"}'; /* we set by default to load current route index.tpl */

		fs.writeFile( amName, am_content, function ( err ) { /* save index template content into index.tpl file */
			if( err ) {
				return console.log ( err )
			}
			if ( req.fields.debug ) {
				console.log ( amName + ' -> created successfully' )
			}
		})

		/* CREATING EMPTY index.tpl */
		it_content = ''; /* initialize empty index.tpl */
		var itName = path + '/index.tpl'; /* creating file path */

		fs.writeFile( itName, it_content, function ( err ) { /* save index template content into index.tpl file */
			if( err ) {
				return console.log ( err )
			}
			if ( req.fields.debug ) {
				console.log ( itName + ' -> created successfully' )
			}
		})

		/* CREATING EMPTY global.css */
		var index_content = ''; /* initialize empty content */
		var fName = path + '/global.css'; /* creating file path */

		fs.writeFile( fName, index_content, function ( err ) { /* save global.css file */
			if( err ) {
				return console.log ( err )
			}
			if ( req.fields.debug ) {
				console.log ( fName + ' -> created successfully' )
			}
		})

		/* copy initial modules */
		dc.copyModule( { path: path, mod_name: 'express' }, res ) /* server */
		dc.copyModule( { path: path, mod_name: 'mysql' }, res ) /* mysql */
		dc.copyModule( { path: path, mod_name: 'nsmarty' }, res ) /* template engine */
		dc.copyModule( { path: path, mod_name: 'bootstrap' }, res ) /* boostrap framework */
		dc.copyModule( { path: path, mod_name: 'jquery' }, res ) /* jquery is needed for bootstrap */
		dc.copyModule( { path: path, mod_name: 'formidable' }, res ) /* form post handler including files upload handle */
		dc.copyModule( { path: path, mod_name: 'db' }, res ) /* db modules */
	}, 

	editProject: function( req, res ) {
		cur_mod = 'routes'
		cur_project = req.fields.dField
		res.writeHead( 301, { Location: '/' + cur_mod + '/' + cur_project + '/' } )
		res.end()
	},

	delProject: function( req, res ) {
		var dc = require( './dCore' )
		dc.delDir( { path: __dirname + '/projects/' + req.fields.dField }, res )
		res.writeHead( 301, { Location: '/projects/' } )
		res.end()
	}
}