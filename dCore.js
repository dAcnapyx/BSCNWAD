dirsToCheck = [];
allFiles = [];

module.exports = {
	getCurModMenuAndContent: function( req, res ) {
		fs = require( 'fs' )
		nsmarty = require( 'nsmarty' )
		cm = require( './' + cur_mod + '_n' )
		db = require( './dMysql' )

		nsmarty.tpl_path = __dirname + '/' /* IMPORTANT! Templates path */

		is_preview = false;
		if ( cur_mod == 'project_preview' ) {
			is_preview = true
		}

		/* Prepare Smarty array */
		arr = { title: cur_mod [ 0 ].toUpperCase() + cur_mod.slice(1) + ' ' + cur_template , cur_tpl: cur_mod + '.tpl', cur_project: cur_project, module: cur_mod, cur_route: cur_route, cur_template: cur_template, is_preview: is_preview, menu: [] }

		arr.menu = this.getMenu ( req, res ) /* Load menu.js and format it for smarty */
		req.arr = arr /* add menu to request */
		
		cm.init ( req, res ) /* Start Current Module Init function */
		nsmarty.clearCache ( './master.tpl' ) /* clear cache */
		
		db.getDBs( function( dbs ) { /* Get All DB Names (for edit template module) */
			req.arr.dbs = dbs /* add dbs to main arr */
			stream = nsmarty.assign( './master.tpl', req.arr ) /* merge data with template */
			stream.pipe( res ) /* pipe out the result to the browser */
		})
	},

	getMenu: function( req, res ) {
		res_menu = []
		/* Load Menu */
		menu = require( './' + cur_mod + '_menu.json' )

		/* Parse Menu Items */
		menu.forEach(function( menu_item ) {
			/* set title only if defined */
			mi_title = ''
			if (typeof menu_item.ttl !== 'undefined') { mi_title = menu_item.ttl }
			/* check if we have sub menu */
			mi_sub_menu = []
			if ( typeof menu_item.sub !== 'undefined' ) {
				menu_item.sub.forEach(function( sub_menu_item ) {
					smi_title = ''
					/* set title only if defined */
					if (typeof sub_menu_item.ttl !== 'undefined') { smi_title = sub_menu_item.ttl }
					sub_item = {char: sub_menu_item.chr, txt: sub_menu_item.txt.replace(sub_menu_item.chr, '<span class="chsh">'+sub_menu_item.chr+'</span>'), onclick: sub_menu_item.act, title: smi_title}
					mi_sub_menu.push(sub_item)
				})
			}
			item = {char: menu_item.chr, txt: menu_item.txt.replace(menu_item.chr, '<span class="chsh">'+menu_item.chr+'</span>'), onclick: menu_item.act, title: mi_title, sub: mi_sub_menu}
			res_menu.push(item)
		})
		return res_menu
	},

	getDirectories: function(req, res) {
		fs = require('fs');
		path = require('path');

		return fs.readdirSync(req.path).filter( function( file ) {
			return fs.statSync(path.join(req.path, file)).isDirectory()
		})
	},

	getAllFilesByType: function( req, res ) {
		fs = require( 'fs' )
		path = require( 'path' )

		/* check if this is the first run and if so add current dir to stack */
		if ( dirsToCheck.length === 0 ) {
			dirsToCheck.push( req.startPath )
		}

		if ( !fs.existsSync ( req.startPath ) ) {
			if ( req.debug ) {
				console.log( 'not existing path : ', req.startPath )
			}
			/* return collected so far results */
			req.callback( allFiles )
			/* reset files and dir stacks */
			dirsToCheck = []
			allFiles = []
		}

		files = fs.readdirSync( req.startPath )
	
		for ( i = 0; i < files.length; i++ ) {
			filename = path.join( req.startPath, files[ i ] )

			stat = fs.lstatSync( filename )
			if ( stat.isDirectory() ) {
				dirsToCheck.push( filename )
			}
			else if ( filename.indexOf( req.filter ) !=  -1 ) {
				/* clean the path */
				fn_arr = filename.split( '/' )
				found_route = false
				short_path = '';
				fn_arr.forEach ( function ( val ) {
					if ( found_route ) {
						short_path += val + '/'
					}
					if ( cur_route === 'home' ) {
						/* start combining in path after finding current project */
						if ( val === cur_project ) { found_route = true }
					} else {
						/* start combining in path after finding current project */
						if ( val === cur_route ) { found_route = true }
					}
				})
				/* remove the last '/' */
				short_path = short_path.substr( 0, short_path.length - 1 )
				if ( short_path != '__master.tpl' ) { /* skip _master.tpl */
					allFiles.push( short_path )	
				}
			}
		}

		/* removing the dir which was checked */
		dirsToCheck.shift()
		/* check if we found inside dirs to check */
		if (dirsToCheck.length > 0) {
			/* if so start check in first dir */
			req.startPath = dirsToCheck[0]
			this.getAllFilesByType(req, res)
		} else {
			/* if there is no dirs to check return collected results */
			req.callback(allFiles)
			/* reset files and dir stacks */
			dirsToCheck = []
			allFiles = []
		}
	}, 

	parseForm: 	function(req, res) {
		formidable = require('formidable')
		fs = require('fs')
		form = new formidable.IncomingForm()
		cm = require('./'+cur_mod+'_n')

		/* set directory for upoloads */
		route = cur_route+'/'
		if (cur_route === 'home') { 
			route = ''
		}		
		form.uploadDir = __dirname+'/projects/'+cur_project+'/'+route
		form.keepExtensions = true;

		form.parse(req, function (err, fields, files) {
			/* create action function request object */
			req = {}
			
			/* add error, form fields and files to action function request */
			req.err = err
			req.fields = fields
			req.files = files

			if ( typeof req.files.srcFile !== 'undefined' ) { /* when uploading file for src attribute */
				var fs = require('fs')
				var route = cur_route+'/'
				if (cur_route === 'home') { 
					route = ''
				}

				var dFile = req.files.srcFile

				fs.exists( __dirname+'/projects/'+cur_project+route+dFile.name, function ( exists ) {
					if ( exists ) { /* when already have such file -> remove it */
						fs.unlink( __dirname+'/projects/'+cur_project+'/'+route+dFile.name, function ( err ) { if ( err ) throw err })
					}
					/* rename uploded file to it's original name */
					fs.rename(dFile.path, __dirname+'/projects/'+cur_project+'/'+route+dFile.name, function ( err ) { if ( err ) throw err })
					res.end( JSON.stringify( '/projects/'+cur_project+'/'+route+dFile.name ) )
				})
			}
			else { /* otherwise -> execute predefined action */
				/* catch err */
				if (err !== null) {
					console.log(err)
				} 

				/* Execute passed function */
				eval('cm.'+fields.dAction)
			}
		})
	},

	copyModule: function(req, res) {
		ncp = require('ncp')
		fs = require('fs')

		/* create node_modules dir if not exists */
		if (!fs.existsSync(req.path+'/node_modules/')) {
			try {
				fs.mkdir(req.path+'/node_modules/', function() {
					if (req.debug) {
						console.log('node_modules dir created')
					}
				})
			} catch(e) {
				if ( e.code != 'EEXIST' ) throw e
			}
		}

		/* copy the dir to the destination */
		ncp('./node_modules/'+req.mod_name+'/', req.path+'/node_modules/'+req.mod_name+'/', function (err) {
			if (err) {
				return console.error(err);
			}
			if (req.debug) {
				console.log(cur_mod+' module copied to '+req.path);
			}
		});
	},

	delDir: function(req, res) {
		fs = require('fs')
		dc = require('./dCore')

		if( fs.existsSync(req.path) ) {
			fs.readdirSync(req.path).forEach(function(file,index) {
				curPath = req.path + '/' + file
				if(fs.lstatSync(curPath).isDirectory()) {
					dc.delDir({path: curPath}, res)
				} else {
					fs.unlinkSync(curPath);
				}
			})
			fs.rmdirSync(req.path)
		}
	}
}