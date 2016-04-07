Boostrap3-Smarty-Chrome-Browser-Based-Node.JS-Web-App-Designer ( BSCNWAD ) Documentation
========================================================================================

Table of Contents
-----------------

[Install](#install)
[Introduction](#introduction)
[Projects](#projects)
[Routes](#routes)
[Templates](#templates)
[Template Edit](#template_edit)
[Project Preview](#project_preview)

Dependencies
------------

	* [nodejs][].
	* [mysql][].

Installation
------------

You must create db named 'bscnwad' and execute BSCNWAD.sql in it

```sh
$ npm install
```

Start the application with this command:

```sh
$ node dApp.js
```

Then in the browser navigate to this address:

```html
localhost:7000
```

or

```html
http://127.0.0.1:7000/
```

Note : The application is build in Linux enviroment ( Ubuntu ) and Chrome Browser Version 47.0.2526.111 (64-bit). May need corrections in the code in order to run on other OS or browser

Introduction
------------

BSCNWAD is a browser based Node.JS app which goal is to speed up the process of designing responsive web applications providing visual environment, intelligent auto-completion system, build in preview and automated initial code writing. The application is build with modularity in mind. It has currently 5 modules which are Projects, Routes, Templates, Template Edit and Project Preview which are managed by dApp.js correlated with dCore.js. Each module has 4 files starting with module name and finishing with strict suffix (except for the template file which is just the module name). For example the module routes is represented in these 4 files

	* routes_menu.json - for the menu items and their functionality
	* routes_n.js - Node.js (server side)
	* routes_b.js - Browser (front end)
	* routes.tpl - Smarty template that will show module data

### routes_menu.json ( moduleName_menu.json )

```html
...
{
	"txt": "add",
	"chr": "a",
	"act": "addRoute()",
	"ttl": "Add New Route",
	"sub": []
}
...
```

The structure of menu json file is simple:
	
	* txt - The displayed menu item text
	* chr - This is the char that is used for shortcut combination with shift and will trigger the menu item action (e.g. shift+a will call addRoute function)
	* act - The function that will be called when activated ( the function must be in module browser js file in this case routes_b.js. Leave empty if this will be dropdown menu )
	* ttl - The displayed title when hovered with the mouse
	* sub - array of dropdown menu items ( same structure as main menu item leaving sub empty. only one level of deepness implemented )

### routes_n.js

Each server side module file must contain at least init function used to prepare template data which will be displayed on module get request, the rest of that file is usually reflection of the front end functions

### routes_b.js ( moduleName_b.js )

Contains menu action functions as well as all other front end functionality that supports them

### routes.tpl ( moduleName.tpl )

Smarty template that contains module data rendering logic ( In routes example displays all found folders in currently selected project displaying main folder as home )

Projects
--------

This module manage adding/deleting project and is a gate to any project -> routes

When you enter BSCNWAD URL ( default: localhost:7000 ) in your browser it will redirect you to projects and you should see something like this:

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Projects_1.png" alt="Projects" style="width: 100%; margin: 0 auto;" />

NOTE: Before run the example project or be able to use Project Preview in BSCNAWAD you must first install the dependencies like going to /projects/SimpleResponsiveBlog/ in terminal and execute the following command

```sh
$ npm install
```

and then start the app with:

```sh
$ node app.js
```

or/and edit the app with BSCNWAD

Keyboard Shortcuts:

	* shift + a - Add Project
	* shift + e - Edit Project
	* shift + d - Delete Project

### Add

All you need to enter to add new project is it's port ( if left empty will set it to default port 8080 ) and name. The system will create new folder with that name in app projects/ folder in which are created initial app files:

	* app.js - manage application redirecting to differnt pages ( see details below )
	* global.css - for storring global application styles
	* index.js - home page back end handler
	* index.tpl - home page template 
	* master.tpl - master app template ( the one that can be edite trough the BSCNWAD )
	* __master.tpl - the real master template ( which is not visible in BSCNWAD, because of parsing problems )

and default node_modules:

	* bootstrap - for the responsivnest of the app
	* db - This is the only module that is made by me which includes dMysql.js module file for creating automated MySQL queries.
	* express - for the back end framework of the app
	* formidable - for easy handling of forms
	* jquery - needed by bootstrap and for the front end functionality
	* mysql - for database of the app 
	* nsmarty - the best imho Node.JS port of smarty template engine

### Edit

Although the default action of Projects, Routes and Templates modules button items is edit which make that menu item redundant I left it there for visual convenience

Adds onclick functionality to projects button items which leads to Routes listing of selected project

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Projects_2.png" alt="Project Button" style="width: 100%; margin: 0 auto;" />

### Del

Deletes permanently a project ( simply deletes the project folder and it's content )

Routes
------

This module manage adding/deleting routes in selected project and is a gate to any project -> route -> templates

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Routes_1.png" alt="Routes" style="width: 100%; margin: 0 auto;" />

Keyboard Shortcuts:

	* shift + a - Add Route
	* shift + e - Edit Route
	* shift + d - Delete Route
	* shift + b - Goes Back to Projects

### Add

Adds new folder in project and creates indes.js ( which initialize template and db queries init and execution ) and index.tpl ( which is empty on creation )

### Edit

Adds onclick functionality to routes button items which leads to Templates listing of selected project.

### Del

Deletes permanently route folder and it's contents

NOTE: the system will prevent deletion of home route

### Back 

Goes back to previous module ( in this case Projects )

You can also use the breadcrumbs in the upper right corner to quickly navigate back to each of the previous modules )

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Routes_2.png" alt="Breadcrumbs" style="width: 100%; margin: 0 auto;" />

Templates
---------

This module manage adding/deleting/importing templates in currently selected route and is a gate to template edit module

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Templates_1.png" alt="Templates" style="width: 100%; margin: 0 auto;" />

NOTE: in home route you can see/edit all templates from all routes as shown on previous image

Keyboard Shortcuts:

	* shift + a - Add Template
	* shift + e - Edit Template
	* shift + d - Delete Template
	* shift + i - Import Template
	* shift + b - Goes Back to Routes

### Add

Adds new empty template in currently selected project -> route

### Edit

Adds onclick functionality to routes button items which leads to Template Edit of selected template.

### Del

Deletes permanently selected template

### Import

Import smarty template from any local storage into current route

### Back 

Goes back to previous module ( in this case Routes )

Template Edit
-------------

This module manage editing of an template. This is the most important and sophisticated module of BSCNWAD, so I'll add more examples of it's usage. If you open master.tpl of the example project SimpleResponsiveBlog you will see something similar to this image:

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_1.png" alt="Template Edit" style="width: 100%; margin: 0 auto;" />

When template is opened for edit the system reads the template, then parse it for html tags adding to them system attributes ( sc="true" -> idicates that this is selectable container, contenteditable="true" -> to be able to edit element text directly in the browser and spellcheck="true" for easy spell errors detection ). Then the outcome is parsed for smarty statements adding them in system html containers ( with same system attributes as the html tags ). If both operations finish without problems the outcome is sent to the browser for edit. 

On save template and preview route reverse parse for both smarty stetements and html tags is done ( removing all system attributes and containers ) and the outcome is sent to the server to update the changes in the real file. 

If "Fetch Vars" opearation is done durring current edit of the template it will also save the needed info to get that info from the db. 

Also ( that's my favorite feature ) if you had applied style attribute to any selectable container ( trough Chrome DevTools for example ) on save the system will ask class name for each found style then will remove the style attribute, add the new class name and will save automaticaly the class in global.css of the current project as well adding the the classes in BSCNWAD db so you can re-use them with auto-completion when editing html class attribute.

When edit html attributes ( either on add or edit action ) auto-completion functionality is poping up giving you the list of matched results depending on what you have already enetered an what you edit. For exmaple let say you edit class attribute value the auto-completion will suggest you boostrap classes ( instantly previewing the result of selected suggested item ) as well as saved classes for current project in this case. When class value is empty the auto-completion will list all added in db boostrap classes and all dinamically added classes for current project. When you start typing the suggested list will become smaller and if there is no results will hide itself. The way it works: from it starts from current caret position looking back until space char or beging of the text is reached and with that string will search with that string mathing it in any place and show applicable solutions ( in this case predefined classes ). Visual Example:

the string "col-md-1" will limit the suggested items to this list:

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_2.png" alt="Template Edit Example" style="width: 100%; margin: 0 auto;" />

the string "d-1" will produce same result since "d-1" is found in each of the suggested items

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_3.png" alt="Templates Edit Exmaple" style="width: 100%; margin: 0 auto;" />

Knowing this you can try and find the shortest combination of chars in order to bring the desired result up for faster selection

After each selection of auto-completion suggest the selected item goes to collection called top_suggest or if it's already there it add +1 to it's counter, providing even faster development since the most used items are on few arrow downs and enter or bringed to upper posiiton with less writing. That collection is also saved when you save the edited templated giving you that top suggest on every edit of an template 

NOTE: See step by step visual example at the end for more clarity of the usage of Template Edit module

Keyboard Shortcuts:
	
	menu shortcuts:

	* shift + a - Add html tag or smarty statement
	* shift + e - Edit html tag or smarty statement
	* shift + d - Delete html tag block or smarty statement block
	* shift + f - Fetch Vars from db ( mysql )
	* shift + p - Preview current route
	* shift + s - Save template
	* shift + b - Goes Back to current project -> route -> templates

	in container selection ( either on add, edit or delete action ) :

	* c - copy selected container ( html tag or smarty statement container ) to buffer
	* x - copy selected container to buffer with flag to move it instead of just copy it when pasted
	* v - append ( paste ) buffer to selected container
	* shift + v - paste buffer before selected container
	* tab - toggle from normal view of containers to another view mode where ( in most of the cases ) you can see clearly the arrangement of the containers in the template
	* up arrow or w - selection goes one level up in html dom ( from currently selected container stand point )
	* down arrow or s - if currently selected container has childrens ( which are also editable ) goes one level down selecting the first child, otherwise does nothing
	* left arrow or a - if it is not the first child of currently selected container parent selects previous selectable child container, otherwise does nothing
	* right arrow or d - if it is not the last child of currently selected container parent selects next selectable child container, otherwise does nothing
	* enter or left button mouse click - confirms selection of container for the current operation ( when shift key is pressed at the same time and the action is add, it will put the new element before the selected container )
	* middle mouse click - toggle enable/disable of mouse container selection ( useful when you want to select the container with the keyboard and don't want to incidently select other container, since mouse selection works on mouse hover )
	* esc - cancel current operation removing all changes

	in container selection ( add only ):

	* r - activates "wrap selected container" mode ( works only on adding html element, not applicable with adding smarty statement ), note that once activated can't be disabled unless you cancel the add operation and do it again from start

	in container selection ( del only ):

	* u - activates "unwrap selected container" mode ( works only on html element, not applicable with stmarty statement container ), once activated can be disabled only with canceling delete operation

	after container selection ( add and edit only ):

	* tab - goes to next editable element ( html tag add/edit only, not applicable to smarty statement ) that may be attribute name, attribute value or if it's adding the html value of the tag
	* shift + tab - goes to previous editable element ( html tag add/edit only, not applicable to smarty statement )
	* left click attribute name or value ( when not empty ) - focus that element for edit
	* shift + h - goes directly to edit html value if the selected html tag can have children ( only on html tag add )
	* enter - will select currently marked auto-completion item and will replace the searched string with the selection
	* shift + enter - will completely finish current operation ( when you don't want to move and click the ok button ). The only exception is when you enter smarty var name on "Fetch Vars". It's better to click the ok button or press tab to focus the ok button and then press enter

### Add

Adding html tag or smarty statement. The default action is adding html tag. If you want to add smarty statement you should start typing with **{** followed by the first chars of the statement then select it from the list ( note that you can the full statement either html or smarty by hand and it will be still valid )

After selection html tag/smarty statement the system will prompt for container selection. You can select container by either mouse poin it and click left mouse button, or navigate with keyboard arrows ( alternatively you can use **w**, **a**, **s**, **d** ) and hit enter to select desired container or hold **shift** before selection to put the content just before the marked selectable container. You can also wrap marked container with the new html tag by activating wrap mode pressing **r** key before selection

Then ( only if you are adding html tag ) the system will load default attributes for that tag and enters in html tag edit mode where you can fill/add desired attributes ( NOTE: all attributes which are left empty will not be saved in the .tpl file )

### Edit

The system prompt for container select to be edited.

After selection depending of the type of the container you will either be able to edit attributes if it was html tag or the html value of the container if it was smarty statement

NOTE: On container selection mode you can copy ( by pressing **c** on marked container ), cut ( by pressing **x** on marked container ) and paste ( by pressing **v** on marked container or **shift + v** to paste it before marked container ). These operations can be done on each container selection prompt

### Del 

The system prompt for container to be deleted. If you want to unwrap marked container instead deleting it with it's content ( only applicable on html tag container ) you can press **u** before selection

After selection the system will remove ( or unwrap ) that container

### Fetch Vars

BSCNWAD can't create or manage databases, but if you have the db prepared ( created with your preferred MySQL client, or it's old project db ) you can use "Fetch Vars" to bring db info into smarty vars which are shown in auto-completion and when saved will prepare the queries for automatically for you ( only native selection, you must add manually any WHERE clause or other query modifications ).

First the system will prompt for db selection showing in auto-completion all found db names.

After db selection the system prompt for table selection showing found tables in selected db.

After table selection the system will show available field from which you can choose to fetch into template. After finishing that process smarty var collection will be available when adding editing smarty statement in auto-completion system for faster and safer smarty development ( see the example below for more clarity )

### Preview

Saves current state of the template ( without scanning for style attribute ). And runs the project in current route to see how it will look on different screen sizes.

### Save

Scans the template for style attribute on each html tag and if found prompt for class name, which will be later saved in project's global.css as well in project db for later re-usage when adding classes on other html elements in the project. Then saves the template.

### Back

Goes back to previous module ( in this case project -> route -> templates )

Preview
-------

This module runs the project in current route and shows the result in iframe giving you the ability to see how it will look on different screen resolutions. Just change the selected device from the dropdown

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Preview_1.png" alt="Preview" style="width: 100%; margin: 0 auto;" />

Keyboard Shortcuts:

	* shift + b - Goes Back to Template Edit

### Back 

Goes back to previous module ( in this case Template Edit )

Example of using Template Edit
------------------------------

Example scenario showing template edit module in action. I'll show you step by step how you can re-create SimpleResponsiveBlog home page.

Here is how your screen should look when you open for edit any empty template:

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_1.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

From now on I'll add the keyboard shortcuts for each action for easy understandings of the steps.

press **shift + a**

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_2.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

type "iv" in order to bring "div" as only available option

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_3.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

hit enter

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_4.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

press enter again or click with the left mouse button over "dContent" div

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_5.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

type "row", press down arrow to mark the "row"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_6.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and hit enter. You may ask why to select the row since it's already written. That's because when selected once it will be added to top suggest collection and you can select it with less effort

finish operation with **shift + enter** or by clicking ok button

press **shift + a**

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_7.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

You will notice that the "div" is in first position in auto-completion suggests, because it's in top_suggest collection and in our case is the only memeber there. And since we want to add another div we can just hit **enter** here without typing nothing

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_8.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Can you see the little dotted rectangle in the upper left part of the editable area? That's the div you added just now. You can press **tab** key to apply different styling on all selectable containers which makes each of them with 99% width and few more styles ( pressing **tab** again will reverse to normal view )

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_9.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Select the new div either by keyboard or mouse

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_10.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

This Example project is build with one column design so using bootstrap classes we need to tell that on all screen sizes it will one column. Knowing the way auto-completion works you can type "s-12" to bring "col-xs-12" as only suggest

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_11.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Hit enter and repeat type "m-12", **enter**, "d-12", **enter**, "g-12", **enter**. Your screen should be looking like this:

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_12.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Now press **shift + h** to go edit the html of the div and type "12 Feb, 2016" for example ( that will be the line displaying the date of the blog post )

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_13.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

press **shift + enter** ok click ok to finish the operation. click "Add" or press **shift + a**, hit **enter** since ( div must be still on first position ). Before selecting where to put it, lets clone last div. focus with the mouse or keyboard the date you entered

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_14.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Press **c** then focus the parent div and press twice **v**, the result should look like this

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_15.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Now you can add the new div in currently marked container ( the "row" div ) and the same classes. Since they already in top suggest collection typing just "s" will bring "col-xs-12" in top position, same for the others : "m", will focus on "col-sm-12" and so on.

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_16.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

**shift + enter** or click on ok button to finish the operation. Now let's add the "read more" button. **shift + a**, type "a" then **enter**, select and insert the "a" tag in the last added div

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_17.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Type "btn n-d"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_18.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and select "btn-default" option. press **shift + h** to edit the tag html and type "Read More". press **shift + enter** or click ok button. now let's change the 2 extra dates to some sample post title and resume. Mark the second date with the mouse

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_19.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and type some post title, let say "this is a temp post title", do the same with the next date and write example resume text "a temp post requires a temp resume so here it is my fair resume text". now inspect in DevTools each of the lines and style them in order to match our responsive design ( You can see the preview at any time of the styling so you can go back and correct it until you think is ok ). I ended with this styles

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_20.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

For the title line I also changed the "div" element to be "a" directly through the element inspector tool

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_21.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_22.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_23.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and with closed DevTools

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_24.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

You may say that is not that perfect the way it looks now. but since I use Google fonts which are in __master.tpl file of the project and not visible in the editor but only in preview mode

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_25.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_26.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_27.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Once you think it's looking good on all screen sizes ( or the ones that the app is targeted for ) you can press **shift + s** or click on "save" in the menu ( back in template edit ). The system will ask for class name for each detected style attribute

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_28.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

I named them respectively "post_date", "post_title", "post_resume" and "post_btn_rm". Now that the design part is done, let's bring some data from the db. I had prepared the db "blog_example" with single table "post" and put some "Lorem ipsum" post

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_29.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Back in template edit press **shift + f** or click on "Fetch Vars"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_30.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and hit **enter** ( you can also click directly on any suggest with the left mouse button if you like ). On next step

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_31.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

since the "posts" is the only table in that db you can just hit **enter** again to select it. You will see the table fields listed

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_32.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Select all but "content" one

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_33.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and click ok button ( or **shift + enter** )

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_34.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

In this last step enter "$posts" and click ok button ( this is the only place where you should not use **shift + enter** for finishing the operation ). the "$" part is important so don't miss it when you fetch vars. Now the system has that var ( $posts ) and you can use it in smarty statements, as well the query getting that date will be saved in index.js of current route index.js when template is saved. 

Press **shift + a** and type "{fo"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_35.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and hit **enter**. Place it before the "row" div holding **shift** on selection

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_36.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Press **shift + e** and select the opening of the "{foreach}" statement

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_37.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Navigate the caret just after the first "$"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_38.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and hit **enter**. That will replace the default "$myarray" with "$posts". Do the same for "$item" but removing the last "s" so the text will become "{foreach $posts as $post}". finish the edit operation ( with **shift + enter** for example ). **shift + a**, **enter** for selecting "div" tag. When adding new element in smarty statement you can either select it's main container as shown in the image

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_39.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

or one of the smarty statements opening or closing tags. add class "row" and finish operation. div inside the last one with classes as shown

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_40.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Finish the operation and copy that one 3 more times in the new "row" div

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_41.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

That's basically the same structure as on the static test post, and you will see why. Add new div and place it in the first line 

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_42.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Type "post_" and you should see the newly created project classes

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_43.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

Select "post_date" and press **shift + h** to go edit html value and type "{$"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_44.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

As you can see the auto-completion suggest our fetched $posts var. select it, remove the last "s" and type "."

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_45.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

and select "date" from the suggested items type "}" to close the smarty statement and finish the operation. Do the same for the post title and subtitle. Cut the "Read More" button from it's place by pressing "x" when hovering it ( this on container selection ) and then "p" when marked last line of the new "row". Then delete the old "row" container. You should see this image after all operations

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_46.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

You can test now if everything is ok with "Preview"

<img src="https://github.com/dAcnapyx/BSCNWAD/blob/master/docs/images/Template_Edit_Example_47.png" alt="Example_Screenshot" style="width: 100%; margin: 0 auto;" />

As you can see the page now show the results from the db. There are few things to correct yet, but you can see the source of the example project SimpleResponsiveBlog to see how the date is corrected and more.

[nodejs]: https://nodejs.org/en/
[mysql]: https://www.mysql.com/