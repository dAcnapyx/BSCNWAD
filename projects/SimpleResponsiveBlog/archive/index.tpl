{if $posts|default:null}
 	{foreach $posts as $post}
 		<div class="row">
 			<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 				<span class="post_date">
 					{$post.date}
 				</span>
 				<a class="post_title post_title_in_archive " href="/post/{$post.id}/">
 					{$post.title}
 				</a>
 			</div>
 		</div>
 	{/foreach}
 {/if}
