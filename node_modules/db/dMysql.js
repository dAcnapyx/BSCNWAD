var debug = false;
module.exports = {
	capsulateFields: function (str) {
		res = ''

		v_arr = str.split('.')
		v_arr.forEach ( function ( value, index ) {
			res += '`' + value + '`'
			if ( index < v_arr.length - 1 ) { res += '.' }
		})

		return res
	},

	Execute: function ( action, tables, fields, values, add_params, callback, db_name ) {
		mysql = require('mysql')
		dMysql = require('./dMysql')
		q = ''

		if ( typeof db_name === 'undefined' ) {
			db_name = 'bscnwad'
		}

		/* start building the query based on 'action' param */
		switch ( action.toLowerCase() ) {
			case 'get' :
				q += 'SELECT '
				break
			case 'put' :
				q += 'UPDATE ' + dMysql.capsulateFields(tables[0][0].table_name) + ' '
				break
			case 'add' :
				q += 'INSERT INTO ' + dMysql.capsulateFields(tables[0][0].table_name) + ' '
				break
			case 'del' :
				q += 'DELETE FROM ' + dMysql.capsulateFields(tables[0][0].table_name) + ' '
				break
		}

		if ( action.toLowerCase() != 'del' ) {
			/* only for put and add */
			if ( action.toLowerCase() != 'get' ) {
				q += ' SET '
			}
			/* add the fields to query str */
			fields.forEach( function ( value, index ) {
				q += value
				if ( action.toLowerCase() != 'get' ) {
					q += ' = ' + values[ index ]
				}
				/* adding comma except for the last element */
				if ( index < fields.length - 1 ) { q += ', ' }
			})
		}

		if ( action.toLowerCase() == 'get' ) {
			/* add the tables and their links to query str */
			tables.forEach ( function ( table_arr, main_index ) {
				table_arr.forEach ( function ( table, index ) {
					/* first table is the main one */
					if ( main_index == 0 ) {
						q += ' FROM `' + table.table_name + '`'
					} else {
						/* link tables by LEFT JOIN : if other methods needed this may be added as additinal parameter */
						q += ' LEFT JOIN ' + '`' + table.table_name + '`'
						/* and in all others we looking for link field(s) */
						if ( typeof table.link_by !== 'undefined') {
							table.link_by.forEach ( function ( link, index ) {
								if ( index == 0 ) { q += ' ON ' } 
								else { q += ' AND ' }
								q += dMysql.capsulateFields( link.src_field ) + ' = ' + dMysql.capsulateFields( link.dest_field )
							})
						}
					}
				})
			})
		}

		/* add additional parameters to query str */
		q += add_params

		if ( debug ) {
			console.log(q)
		}
		
		/* execute the result query */
		connection = mysql.createConnection({
			host	 : 'localhost',
			user	 : 'db_user',
			password : 't3mpdbpasswd',
			database : db_name
		})

		/* start connection */
		connection.connect()

		/* execute selection query */
		connection.query(q, function(err, rows, fields) {
			if (err) throw err
			callback(rows, fields)
		})

		/* end connection */
		connection.end()
	},

	getDBs: function ( callback, db_name ) {
		mysql = require('mysql')

		if ( typeof db_name === 'undefined' ) {
			db_name = 'bscnwad'
		}

		/* connect to bscnwad db */
		connection = mysql.createConnection({
			host	 : 'localhost',
			user	 : 'db_user',
			password : 't3mpdbpasswd',
			database : db_name
		})

		/* start connection */
		connection.connect()

		/* execute selection query */
		connection.query( 'SHOW DATABASES', function(err, rows, fields) {
			if (err) throw err
			if ( rows.length > 0 ) {
				dbs = [] /* initialize dbs collection */
				rows.forEach( function( row ) {
					if ( row.Database != 'information_schema' 
					  && row.Database != 'mysql'
					  && row.Database != 'performance_schema' ) { /* when not recognized system table -> add it to the collection */
						dbs.push ( row.Database ) /* add current db name to dbs collection */
					}
				})
				callback( dbs ) /* retrun the result trough callback */
			}
		})

		/* end connection */
		connection.end()
	},

	getTables: function ( db, callback ) {
		mysql = require('mysql')

		/* connect to bscnwad db */
		connection = mysql.createConnection({
			host	 : 'localhost',
			user	 : 'db_user',
			password : 't3mpdbpasswd',
			database : db
		})

		/* start connection */
		connection.connect()

		/* execute selection query */
		connection.query( 'SHOW TABLES', function(err, rows, fields) {
			if (err) throw err
			if ( rows.length > 0 ) {
				db_tbls = []
				rows.forEach( function( row ) {
					db_tbls.push( eval('row.Tables_in_'+db ) )
				})
			}
			callback( db_tbls )
		})

		/* end connection */
		connection.end()
	}, 

	getFields: function ( db, table, callback ) {
		mysql = require('mysql')
		dMysql = require('./dMysql')

		/* connect to bscnwad db */
		connection = mysql.createConnection({
			host	 : 'localhost',
			user	 : 'db_user',
			password : 't3mpdbpasswd',
			database : db
		})

		/* start connection */
		connection.connect()

		/* execute selection query */
		connection.query( 'SHOW COLUMNS FROM ' + dMysql.capsulateFields( db ) + '.' + dMysql.capsulateFields( table ), function(err, rows, fields) {
			if (err) throw err
			if ( rows.length > 0 ) {
				fields = []
				rows.forEach( function( row ) {
					fields.push( row.Field )
				})
			}
			callback( fields )
		})

		/* end connection */
		connection.end()
	}
}

/*******************************************************************************************
 * Example Data and Usage : 															   *
 *																						   *
 *	tables_get = [																		   *
 *		[																				   *
 *			{ table_name: 'users' }														   *
 *		], 																				   *
 *																						   *
 *		[																				   *
 *			{ table_name: 'users_data',													   *
 *		  	link_by: 																	   *
 *				[																		   *
 *					{ src_field: 'users.id', dest_field: 'users_data.user_id' }			   *
 *				] 																		   *
 *			}																			   *
 *		], 																				   *
 *																						   *
 *		[																				   *
 *			{ table_name: 'images', 													   *
 *			  link_by: 																	   *
 *				[																		   *
 *					{ src_field: 'users.id', dest_field: 'images.user_id' }, 			   *
 *					{ src_field: 'users_data.avatar', dest_field: 'images.file' }		   *
 *				]																		   *
 *			}																			   *
 *		]																				   *
 *	]																					   *
 *																						   *
 *																						   *
 *	var tables_put = [																	   *
 *		[																				   *
 *			{ table_name: 'users' }														   *
 *		]																				   *
 *	]																					   *
 *																						   *
 *	var fields_get = ['users.id', 'user', 'avatar']										   *
 *	var fields_put = ['user', 'avatar']													   *
 *																						   *
 *	var values_get = []																	   *
 *	var values_put = ['We3D', 'spiral.jpg']												   *
 *																						   *
 *	var add_params = [ ' WHERE `users`.`id` = 1' ]										   *
 *	var add_params_add = []																   *
 *																						   *
 *	Execute ( 'Get', tables_get, fields_get, values_get, add_params, callback )			   *
 *																						   *
 *	Execute ( 'Get', tables_get, fields_get, values_get, add_params, callback, 'db_name' ) *
 *																						   *
 *	Execute ( 'Put', tables_put, fields_put, values_put, add_params, callback )			   *
 *																						   *
 *	Execute ( 'Add', tables_put, fields_put, values_put, add_params_add, callback )		   *
 *																						   *
 *	Execute ( 'Del', tables_put, fields_put, values_put, add_params, callback )			   *
 *																						   *
 *******************************************************************************************/