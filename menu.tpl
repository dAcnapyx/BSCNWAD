<div class="row">
	<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-right my_breadcrumbs">
		<div class="pull-right">
		{if $module ne 'projects'}
			<a class="my_breadcrumb" href="/projects/">Projects</a>
		{/if}
		{if $cur_project|default:false && $module ne 'routes'}
			&nbsp;/&nbsp;<a class="my_breadcrumb" href="/routes/{$cur_project}/">{$cur_project}</a>
		{/if}
		{if $cur_route|default:false && $module ne 'templates'}
			&nbsp;/&nbsp;<a class="my_breadcrumb" href="/templates/{$cur_project}/{$cur_route}/">{$cur_route}</a>
		{/if}
		</div>
	</div>
</div>
<div id="dMenu" name="dMenu" class="row">
	{if $module eq 'project_preview'}
	<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">
	{else}
	<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">
	{/if}
		<ul>
			{if $menu|count gt 0}
				{foreach $menu as $i => $item}
					{if $item.sub|default:'' != ''}
						<li>
							<div class="dropdown clearfix">
								<a class="mil dropdown-toggle" type="button" id="mi_{$item.char}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" onclick="{$item.onclick|default:''}" title="{$item.title|default:''}">{$item.txt}</a>
								<ul class="dropdown-menu">
									{foreach $item.sub as $si => $sitem}
										<li>
											<a class="mil" id="mi_{$sitem.char}" onclick="{$sitem.onclick|default:''}" title="{$sitem.title|default:''}">{$sitem.txt}</a>
										</li>
									{/foreach}
								</ul>
							</div>
						</li>
					{/if}
					{if $item.sub|default:'' == ''}
						<li>
							<a class="mil" id="mi_{$item.char}" onclick="{$item.onclick|default:''}" title="{$item.title|default:''}">{$item.txt}</a>
						</li>
					{/if}
				{/foreach}
			{else}
				No Menu : Edit menu.js to have one
			{/if}
		</ul>
	</div>
	{if $module eq 'project_preview'}
		<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 pull-right scr_res_con">
			<div class="scr_res_txt">Select Device : </div>
			<select class="form-control scr_res_sel" id="scr_res_sel"></select>
		</div>
	{/if}
</div>
<div class="row hide" id="dFormCon">
	<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
		<form id="dForm" action="/{$module|default'projects'}/" enctype="application/x-www-form-urlencoded" method="post" />
			<fieldset>
				<div id="tplContentCleaner"></div>
				<input type="hidden" id="dAction" name="dAction" value="" />
				<div class="row">
					<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">
						<h4 class="hide" id="dInfo"></h4>
						<input class="form-control" type="hidden" id="dField" name="dField" value="" autocomlete="off" />
						<div id="dSuggests" class="hide"></div>
						<textarea class="dAField hide" id="dAField"></textarea>
					</div>
					<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 text-right" id="dButtons">
						<button id="btn_y" type="button" class="navbar-btn btn btn-small btn-success hide">OK</button>
						<button id="btn_n" type="button" class="navbar-btn btn btn-small btn-danger hide">Cancel</button>
					</div>
				</div>
			</fieldset>
		</form>
	</div>
</div>