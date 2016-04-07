<nav class="navbar navbar-default">
 	<div class="container-fluid">
 		<div class="navbar-header">
 			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
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
 		<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
 			<ul class="nav navbar-nav">
 				<li class="{if $cur_route|default:'/' == '/'} active {/if}">
					<a href="/">
						Home 
						{if $cur_route|default:'/' == '/'}
						<span class="sr-only">
							(current)
						</span>
						{/if}
					</a>
				</li>
 				<li class="{if $cur_route|default:'/' == '/archive/'} active {/if}">
					<a href="/archive/">
						Archive
						{if $cur_route|default:'/' == '/'}
						<span class="sr-only">
							(current)
						</span>
						{/if}
					</a>
				</li>
 				<li class="{if $cur_route|default:'/' == '/about/'} active {/if}">
					<a href="/about/">
						About
						{if $cur_route|default:'/' == '/'}
						<span class="sr-only">
							(current)
						</span>
						{/if}
					</a>
				</li>
 			</ul>
 		</div>
 	</div>
 </nav>
