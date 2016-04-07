<div class="panel">
	<div class="row">
		<div class="col-md-12">
			<article class="main">
				<h3>{$title|default:"Welcome"}</h3>
			</article>
		</div>
	</div>
</div>
<div class="row">
	<div class="col-md-10">
		{if $list|count gt 0}
			{foreach $list as $i => $item}
				<a class="btn btn-lg btn-success floating_btn" href="javascript:void(0)" si="true">{$item}</a>&nbsp;&nbsp;
			{/foreach}
		{/if}
	</div>
</div>