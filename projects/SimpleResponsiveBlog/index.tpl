{if $posts|default:null}
 	{foreach $posts as $post}
 		<div class="row">
 			<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 				<span class="post_date">
 					{$post.date}
 				</span>
 			</div>
 			<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 				<a class="post_title" href="/post/{$post.id}/">
 					{$post.title}
 				</a>
 			</div>
 			<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 				<div class="post_resume">
 					{$post.resume}
 				</div>
 			</div>
 			<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 				<a class="btn btn-default post_btn_rm" href="/post/{$post.id}/">
					 Read More 
				</a>
 			</div>
 		</div>
 	{/foreach}
 {/if}
