{if $post[0]|default:null}
 	<div class="row">
 		<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 			<span class="post_date">
 				{$post[0].date}
 			</span>
 		</div>
 		<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 			<div class="post_title title_in_post" href="/post/{$post.id}/">
 				{$post[0].title}
 			</div>
 		</div>
 		<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 			<div class="post_resume resume_in_post">
 				{$post[0].resume}
 			</div>
 		</div>
 		<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
 			<div class="post_resume">
 				{$post[0].content}
 			</div>
 		</div>
 	</div>
 {/if}
