<!DOCTYPE html>
<html lang="en">
	<head>
		<title>{$title|default:"Welcome"}</title>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="description" content="{$seo->description|default:'...'}" />
		<meta name="keywords" content="{$seo->keywords|default:'...'}" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		{* [STYLESHEETS START] *}
		<link href="/node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" type="text/css">
		<link href="/global.css" rel="stylesheet" type="text/css">
		<link href='https://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet' type='text/css'>
		<link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
		{* [STYLESHEETS END] *}
		{* [JAVASCRIPTS START] *}
		<script type="text/javascript" src="/node_modules/jquery/dist/jquery.min.js"></script>
		<script type="text/javascript" src="/node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
		{* [JAVASCRIPTS END] *}
	</head>
	<body>
		{include file="master.tpl"}
	</body>
</html>