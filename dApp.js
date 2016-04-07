/* IMPORTANT! This is the path for current module files as well as the name for the loaded files */
cur_mod = ''
cur_project = ''
cur_route = ''
cur_template = ''

/* [MODULES] */
express = require( 'express' )
path = require( 'path' )

/* Start The Web Server */
server = express()

/* Configure Paths */
server.use( express.static(__dirname + '/') )
server.use( express.static(path.join(__dirname, cur_mod)) )

/* Server Port */
port = 7000

/* Set Module Vars By Url Params */
function setModVars ( url_arr ) {
	if (typeof url_arr[2] !== 'undefined') { /* set project if presented */
		cur_project = url_arr[2]
	}

	if (typeof url_arr[3] !== 'undefined') { /* set route if presented */
		cur_route = url_arr[3]
	}

	if (typeof url_arr[4] !== 'undefined') { /* set template if presented */
		cur_template = url_arr[4]
	}
}

/* Start Server Listening */
server.listen(port, function() {
	console.log('server listening on port ' + port)
})

/* Home : Temporary redirect to projects */
server.get('/', function(req, res) {
	cur_mod = 'projects'
	cur_project = ''
	res.writeHead(301, {Location: '/projects/'})
	res.end()
})

/* PROJECTS */
server.route(/projects/)
	.get(function(req, res) {
		var dc = require('./dCore')
		cur_mod = 'projects'
		cur_project = ''
		cur_template = ''
		cur_route = ''
		dc.getCurModMenuAndContent(req, res)
	})
	.post(function(req, res) {
		var dc = require('./dCore')
		dc.parseForm(req, res)
	})

/* ROUTES */
server.route(/routes/)
	.get(function(req, res) {
		dc = require('./dCore')
		url_arr = req.url.split('/')
		cur_mod = 'routes'
		cur_template = ''
		setModVars ( url_arr )
		dc.getCurModMenuAndContent(req, res)
	})
	.post(function(req, res) {
		dc.parseForm(req, res)
	})

/* TEMPLATES */
server.route(/templates/)
	.get(function(req, res) {
		dc = require('./dCore')
		url_arr = req.url.split('/')
		cur_mod = 'templates'
		setModVars ( url_arr )
		dc.getCurModMenuAndContent(req, res)
	})
	.post(function(req, res) {
		dc = require('./dCore')
		dc.parseForm(req, res)
	})

/* TEMPLATE EDIT */
server.route(/template_edit/)
	.get(function(req, res) {
		dc = require('./dCore')
		url_arr = req.url.split('/')
		cur_mod = 'template_edit'
		setModVars ( url_arr )
		dc.getCurModMenuAndContent(req, res)
	})
	.post(function(req, res) {
		dc = require('./dCore')
		dc.parseForm(req, res)
	})

/* PROJECT PREVIEW */
server.route(/project_preview/)
	.get(function(req, res) {
		dc = require('./dCore')
		url_arr = req.url.split('/')
		cur_mod = 'project_preview'
		setModVars ( url_arr )
		dc.getCurModMenuAndContent(req, res)
	})

/* AJAX CALLS */
server.route(/ajax/)
	.get(function(req, res) {
		/* no get calls for now */
	})
	.post(function(req, res) {
		dc = require('./dCore')
		cur_mod = 'template_edit'
		url_arr = req.url.split('/')
		setModVars ( url_arr )
		dc.parseForm(req, res)
	})

/* UPLOADER : Handle dynamic uploads for any tag that have src attribute */
server.route(/uploader/)
	.get(function(req, res) {
		/* no get calls for now */
	})
	.post(function(req, res) {
		dc = require('./dCore')
		cur_mod = 'template_edit'
		url_arr = req.url.split('/')
		setModVars ( url_arr )
		dc.parseForm(req, res)
	})
