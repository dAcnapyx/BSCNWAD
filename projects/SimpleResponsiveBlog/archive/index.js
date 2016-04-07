module.exports = {
	getData: function( req, res, main_callback ) {
		db = require( 'db/dMysql' )
		/* DB TABLES */
		var tables_arr = []; /* used to store the db table names */
		tables_arr.push([[{table_name: 'posts'}]]);
		/* DB TABLES END */
		/* DB FIELDS */
		var fields_arr = []; /* used to store the db fields collections */
		fields_arr.push(['id','DATE_FORMAT(date, \'%b %d, %Y\') as date','title']);
		/* DB FIELDS END */
		/* DB NAMES */
		var dbs_arr = []; /* used to store the db names */
		dbs_arr.push('blog_example');
		/* DB NAMES END */
		/* SMARTY VARS */
		var smarty_vars = []; /* used to store the smarty vars where the pulled data will be stored */
		smarty_vars.push('posts');
		/* SMARTY VARS END */
		/* WHERE CLAUSE */
		var where_arr = []; /* used to store the where clauses of the queries */
		where_arr.push('');
		/* WHERE CLAUSE END */
		function handle_queries( tables, fields, where, db_name, smarty_var,  main_callback ) {
			if ( tables && fields && db_name && smarty_var ) {
				async( tables, fields, where, db_name, smarty_var, function() {
					return handle_queries( tables_arr.shift(), fields_arr.shift(), where_arr.shift(), dbs_arr.shift(), smarty_vars.shift(), main_callback );
				});
			} else {
				main_callback();
			}
		}
		function async( tables, fields, where, db_name, smarty_var, callback ) {
			db.Execute( 'Get', tables, fields, [], where, function ( rows ) {
				if ( rows.length > 0 ) {
					code = 'req.$arr.' + smarty_var + ' = rows;';
					eval( code );
				}
				callback();
			}, db_name );
		}
		/* INITIALIZING SMARTY ARRAY */
		req.$arr = {
			title: 'archive', 
			cur_route: '/archive/', 
			cur_tpl: 'index.tpl' 
		};
		/* INITIALIZING SMARTY ARRAY END */
		handle_queries( tables_arr.shift(), fields_arr.shift(), where_arr.shift(), dbs_arr.shift(), smarty_vars.shift(), main_callback ); /* execute all queries (if have data for them) and return after all data is collected */
	}
}
