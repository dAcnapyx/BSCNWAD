/* [VARIABLES] */
var cur_route = '' /* populated from first url param */
/* [VARIABLES END] */

/* [MODULES] */
var express = require( 'express' );
var path = require( 'path' );
var nsmarty = require( 'nsmarty' );
/* [MODULES END] */

nsmarty.tpl_path = __dirname + '/'; /* IMPORTANT! Init Smarty Templates Path */

/* [SEREVER_INIT] */
var app = express();

app.use( express.static( __dirname + '/' ) );
/* [SEREVER_INIT END] */

/* [SERVER_PORT] */
var port = 8080;
/* [SERVER_PORT END] */

/* [SEREVER_LISTEN] */
app.listen( port, function() {
	console.log( 'server listening on port ' + port );
})
/* [SEREVER_LISTEN END] */

/* [SHOW_MASTER_TEMPLATE] */
function showMasterTemplate( req, res ) {
	nsmarty.clearCache ( './__master.tpl' ) /* clear cache */
	stream = nsmarty.assign( './__master.tpl', req.$arr ) /* merge data with template */
	stream.pipe( res ) /* pipe out the result to the browser */
}
/* [SHOW_MASTER_TEMPLATE END] */

/* [GET:/] */
app.get('/', function( req, res ) {
	var module = require( './index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/ END] */

/* [GET:/post/] */
app.get('/post/*', function( req, res ) {
	var module = require( './post/index.js' );
	url_arr = req.url.split('/');
	req.post_id = url_arr[2];
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/post/ END] */

/* [GET:/archive/] */
app.get('/archive/*', function( req, res ) {
	var module = require( './archive/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/archive/ END] */

/* [GET:/archive/] */
app.get('/archive/*', function( req, res ) {
	var module = require( './archive/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/archive/ END] */

/* [GET:/archive/] */
app.get('/archive/*', function( req, res ) {
	var module = require( './archive/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/archive/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/archive/] */
app.get('/archive/*', function( req, res ) {
	var module = require( './archive/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/archive/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */

/* [GET:/about/] */
app.get('/about/*', function( req, res ) {
	var module = require( './about/index.js' );
	module.getData( req, res, function() {
		showMasterTemplate( req, res )
	});
})
/* [GET:/about/ END] */