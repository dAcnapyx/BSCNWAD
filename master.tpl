<!DOCTYPE html>
<html lang="en">
<head>
	<title>{$title|default:"Welcome"}</title>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="description" content="{$seo->description|default:'...'}" />
	<meta name="keywords" content="{$seo->keywords|default:'...'}" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link href="/node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" type="text/css">
	<link href="/global.css" rel="stylesheet" type="text/css">
	<link href="/projects/{$cur_project|default:''}/global.css" rel="stylesheet" type="text/css">

	<script type="text/javascript" src="/node_modules/jquery/dist/jquery.min.js"></script>
	<script type="text/javascript" src="/node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="/textarea-helper.js"></script>
	{* File Uploader js *}
	<script src="/node_modules/jquery-file-upload/js/jquery.uploadfile.js"></script>
</head>
<body class="blueprint-grid-gray">
<div id="start"></div>
	<div id="main">
		<header>
			<div class="col-md-12 hm">
				<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
					<div class="dmm">
		 				<div class="navbar-header">
		 					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#dmain_menu" aria-expanded="false" aria-controls="navbar">
		 						<span class="sr-only">
									 Toggle navigation 
								</span>
		 						<span class="icon-bar">
		 						</span>
		 						<span class="icon-bar">
		 						</span>
		 						<span class="icon-bar">
		 						</span>
		 					</button>
		 				</div>
						<div class="collapse navbar-collapse" id="dmain_menu">
							{include file='/menu.tpl'}
						</div>
					</div>
				</nav>
			</div>
		</header>
		<div id="dBody">
			{if $cur_tpl|default:'' != 'template_edit.tpl' && $module != 'project_preview'}
				<div class="container">
					<div class="row">
						<div class="col-md-12" id="dContent">
							{include file="/$cur_tpl"}
						</div>
					</div>
				</div>
			{else}
				<div id="dContent_con" class="{if $module != 'project_preview'}dccw{/if}">
					<div id="dContent" sc="true">
						{if $module == 'project_preview'}
							{include file="/$cur_tpl"}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
	<div id="end"></div>
	<script type="text/javascript" src="/global.js"></script>
	<script type="text/javascript" src="/keyboard.js"></script>
	<script type="text/javascript" src="/{$module|default'projects'}_b.js"></script>
	<script type="text/javascript">
		/* create menu object for keyboard shortcuts */
		var menu = [];
		var dbs = [];
		var cur_mod = "{$module|default:''}";
		var cur_project = "{$cur_project|default:''}";
		var cur_route = "{$cur_route|default:''}";
		var cur_template = "{$cur_template|default:''}";
		top_suggests = [] /* used to store most used suggest to bring them on top of the list */
		{foreach $menu as $i => $item}
			var temp = {ldelim}ch: "{$item.char}", fn: "{$item.onclick}"{rdelim};
			menu.push(temp);
			{if $item.sub@count gt 0}
				{foreach $item.sub as $si => $sitem}
					var temp = {ldelim}ch: "{$sitem.char}", fn: "{$sitem.onclick}"{rdelim};
					menu.push(temp);
				{/foreach}
			{/if}
		{/foreach}
		/* create dbs array for fetchVarsFromDB() */	
		{foreach $dbs as $i => $item}
			dbs.push( '{$item|default:""}' )
		{/foreach}
		/* populate top_suggests array if we have data */
		{if $top_suggests|default:null != null}	
			{foreach $top_suggests as $i => $item}
				var item = '{$item.item|default:""}';
				var count = {$item.count|default:1}
				top_suggests.push( { item: item, count: count } )
			{/foreach}
		{/if}
		{if $cur_tpl|default:'' == 'template_edit.tpl'}		
			file = "{$cur_tpl|default:''}"
			$.ajax({
				url: "/ajax",
				type: "POST",
				data: {
					dAction: 'ajaxHandler(req, res)',
					req: 'load_template',
					file: file
				},
				success: function(data) {
					if ( data.length > 0 ) {
						obj = jQuery.parseJSON( data )
						$( '#dContent' ).append( obj.html )
						tpl_vars = jQuery.parseJSON( obj.vars )
						tpl_vars.forEach( function( cur_tpl_var, cur_tpl_index ) {
							vars.push( cur_tpl_var )
						})
					}
				},
				error: function() {
				}
			})
		{/if}
	</script>
</body>
</html>