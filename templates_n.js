module.exports = {
	init: function( req, res ) {
		dc = require( './dCore' );
		nsmarty = require( 'nsmarty' );

		var route = cur_route;
		if ( cur_route === 'home' ) { 
			route = ''
		}

		var templates = [];
		/* clear cache */
		nsmarty.clearCache('./master.tpl');
		/* Get route templates */
		dc.getAllFilesByType( { debug: true, startPath: __dirname+'/projects/'+cur_project+'/'+route+'/', filter: '.tpl', callback: function ( templates ) { 
			/* assign the result */
			req.arr.list = templates
		}}, res)
	},

	addTemplate: function(req, res) {
		var fs = require('fs'),
			dc = require('./dCore')

		/* add tpl extension if not set */
		if (req.fields.dField.substr(req.fields.dField.length-4,req.fields.dField.length) !== '.tpl') {
			req.fields.dField += '.tpl'
		}

		/* configuring template file */
		var route = cur_route+'/'
		if (cur_route === 'home') { 
			route = ''
		}

		var fullPath = __dirname + '/projects/' + cur_project + '/' + route + req.fields.dField

		/* save template file */
		fs.writeFile(fullPath, '', function(err) {
			if(err) {
				return console.log(err)
			}
			if (req.debug) {
				console.log(fullPath+' was created')
			}
			
			/* open the template for editing */
			res.writeHead(301, {Location: '/template_edit/' + cur_project + '/' + cur_route + '/' + req.fields.dField})
			res.end()
		})
	}, 

	editTemplate: function(req, res) {
		cur_mod = 'template_edit'
		
		/* open the template for editing */
		path = cur_project + '/';
		if ( req.fields.dField.indexOf( '/' ) == -1 ) { /* when the the requested template is not in inner route */
			path += cur_route + '/';
		}
		res.writeHead(301, {Location: '/template_edit/' + path + req.fields.dField})
		res.end()
	},

	delTemplate: function(req, res) {
		var fs = require('fs')

		var route = cur_route+'/'
		if (cur_route === 'home') { 
			route = ''
		}

		fs.unlink(__dirname+'/projects/'+cur_project+'/'+route+req.fields.dField, function (err) {
			if (err) throw err
			if (req.debug) {
				console.log('successfully deleted '+req.file)
			}
		})
		res.writeHead(301, {Location: '/templates/'+cur_project+'/'+cur_route+'/'})
		res.end()
	},

	importTemplate: function(req, res) {
		var fs = require('fs')
		var route = cur_route+'/'
		if (cur_route === 'home') { 
			route = ''
		}

		var dFile = req.files.dFile

		/* rename uploded file to it's original name */
		fs.rename(dFile.path, __dirname+'/projects/'+cur_project+'/'+route+dFile.name, function (err) { if (err) throw err })
		/* redirect to templates */
		res.writeHead(301, {Location: '/templates/'+cur_project+'/'+cur_route+'/'})
		res.end()
	},

	backToRoutes: function(req, res) {
		cur_mod = 'routes'
		cur_route = ''
		res.writeHead(301, {Location: '/'+cur_mod+'/'+cur_project+'/'})
		res.end()
	}
}