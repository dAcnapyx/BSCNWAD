module.exports = {
	init: function( req, res ) {
		var now = require( 'sleep' );
		var lazy = require('lazy');
		var exec = require( 'child_process' ).exec;
		var port = 0;

		function puts( error, stdout, stderr ) { console.log( stdout ) }
		
		exec( 'cd projects/ ; cd '+ cur_project +'/ ; node app.js', puts );

		var fileLines = [];
		var path = __dirname + '/projects/' + cur_project + '/';

		new lazy(fs.createReadStream( path + 'app.js' ))
			.lines
			.forEach( function( line ) {
				cur_line = line.toString(); /* convert the chunk to string */
				fileLines.push( cur_line ); /* add the line to fileLines array */
			}
		)
		.join(function () { /* when reading the file is done */
			fileLines.forEach ( function ( cur_line, index ) {
				if ( cur_line.indexOf( 'var port = ' ) != -1 ) {
					port = cur_line.replace('var port = ', '').replace(';', '');
					req.arr.port = port;
				}
			})
		})
		now.sleep( 1 ); /* wait a bit to give time to start required app */
	},

	backToTemplateEdit: function( req, res ) {
		cur_template = ''
		route = cur_route + '/'		
		if (cur_route === 'home') { 
			route = '/'
		}
		/* open the template for editing */
		res.writeHead(301, {Location: '/template_edit/' + cur_project + '/' + route + cur_template})
		res.end()
	}
}