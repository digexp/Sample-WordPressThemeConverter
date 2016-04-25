/*******************************************************************************
 * Copyright (c) 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

/* input:
	--name of new theme
	--wpRemoteZipPath wordpress theme zip path
	--wpRootFolder theme root folder name
	--verbose
*/

// =====================================================================

var fs = require('fs');
var path = require('path');
var request = require('request');
var ncp = require('ncp').ncp;
var unzip = require('unzip');
var archiver = require('archiver');
var zipdir = require('zip-dir');
var rimraf = require('rimraf');
var chmodr = require('chmodr');

// =====================================================================

// get command line argument
function getCommandLineArg(key) {
	var ret = false;
	process.argv.forEach((val, index, array) => {
		if(val.indexOf(key+'=') >= 0) {
			ret = val.substring(val.indexOf('=')+1);
		}
	});
	return ret;
}

// verbose flag for logging
var verbose = getCommandLineArg('verbose');

// theme name user input
var themeName = getCommandLineArg('name');
if(!themeName) return console.error("Error: No theme name provided, please set the 'name' parameter");
if(verbose) console.log("\nCreating DX theme '"+themeName+"'");

// path to the remote wordpress theme
var remoteThemePath = getCommandLineArg('wpRemoteZipPath');
if(!remoteThemePath) return console.error("Error: No WordPress theme path provided, please set the 'wpRemoteZipPath' parameter");

// root folder of the WordPress theme
var wpRootFolder = getCommandLineArg('wpRootFolder');
if(!wpRootFolder) return console.error("Error: No WordPress theme root folder provided, please set the 'wpRootFolder' parameter");

// parse theme name input
var themeNameArray = themeName.match(/\S+/g);

// theme name in all lowercase with no spaces
themeNameArray.forEach(function(e, i, a) {
	a[i] = e.toLowerCase();
});
var lowerCase = themeNameArray.join('');

// theme name in camel case
themeNameArray.forEach(function(e, i, a) {
	if(i > 0) a[i] = e.charAt(0).toUpperCase() + e.slice(1);
})
var camelCase = themeNameArray.join('');

// theme name in camel case with first letter capitalized
var capitalCamelCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

// =====================================================================

var asyncDone = 0;
var outputDone = false;
function onEnd() {
	if (!outputDone && ++asyncDone == 20) createOutput();
}

var pathPrefix = 'tmp/paa/'+camelCase+'Theme/components/'+camelCase+'Theme';

function replaceInFiles(filePathArray, regexToReplaceArray, replacementStrArray) {
	if(verbose) console.log("\nReplacing regex: "+regexToReplaceArray.join('\n\t')+"\nwith string(s): "+replacementStrArray.join('\n\t')+"\nin file(s): "+filePathArray.join('\n\t'));
	filePathArray.forEach(function(path) { 
		fs.readFile(path, 'utf8', function (err, contents) { 
			if (err) return console.error("Cannot read file with path '" + path + "': " + err);
			var newContents = contents;
			regexToReplaceArray.forEach(function(regexToReplace, i) {
				newContents = newContents.replace(regexToReplace, replacementStrArray[i]);
			});

			fs.writeFile(path, newContents, function (err) {
				if (err) return console.error("Cannot rewrite file with path '" + path + "': " + err);
				if(verbose) console.log("\nWrote file '"+path+"' with replacements");
				onEnd();
			});
		});
	});
}

// =====================================================================

// copy source directory structure

fs.mkdir('tmp', function(e) {
	if (e) {
		return console.error("Cannot create tmp folder: " + e);
	} else {
		ncp.limit = 16;
		ncp('paaSource', 'tmp/paa', function (err) {
			if (err) {
				return console.error("Cannot copy theme files: " + err);
			} else {
				if(verbose) console.log("\nCopied dx theme files to the tmp directory");
				renameFiles();
				processWordPressTheme();
				renameTheme();
				onEnd();
			}
		});
	}
});

// =====================================================================

function renameFiles() {
	if(verbose) console.log("\nRenaming theme files and folders to '"+camelCase+"Theme'");
	fs.renameSync('tmp/paa/wordPressTheme', 'tmp/paa/'+camelCase+'Theme');
	fs.renameSync('tmp/paa/'+camelCase+'Theme/components/wordPressTheme', pathPrefix);
	fs.renameSync(pathPrefix+'/version/wordPressTheme.component', pathPrefix+'/version/'+camelCase+'Theme.component');
}

// =====================================================================

function renameTheme() {
	//  replace all instances of "Word Press" with the new theme name
	//			all instances of "wordpress" with the new theme name in all lowercase with no spaces
	// 			all instances of "wordPress" with the new theme name in camel case
	//			all instances of "WordPress" with the new theme name in camel case with first letter capitalized

	replaceInFiles([pathPrefix+'/installableApps/ear/WordPressThemeEAR/WordPressThemeWAR/WEB-INF/plugin.xml', 
		pathPrefix+'/content/webdav/themes/WordPressThemeZIP/contributions/theme.json'], 
		[/Word Press/g, /wordpress/g], 
		[themeName, lowerCase]);

	replaceInFiles([pathPrefix+'/content/webdav/themes/WordPressThemeZIP/profiles/profile_deferred.json'], 
		[/wordpress/g], 
		[lowerCase]);

	replaceInFiles([
		pathPrefix+'/installableApps/ear/WordPressThemeEAR/META-INF/application.xml', 
		pathPrefix+'/content/xmlaccess/install/installTheme.xml'], 
		[/wordPress/g, /WordPress/g], 
		[camelCase, capitalCamelCase]);

	replaceInFiles(['tmp/paa/'+camelCase+'Theme/sdd.xml',
		pathPrefix+'/sdd.xml',
		pathPrefix+'/content/xmlaccess/uninstall/uninstallTheme.xml',
		pathPrefix+'/installableApps/ear/WordPressThemeEAR/WordPressThemeWAR/WEB-INF/web.xml',
		pathPrefix+'/version/'+camelCase+'Theme.component'], 
		[/wordPress/g], 
		[camelCase]);
}

// =====================================================================

var wordPressThemeDir = 'tmp/'+wpRootFolder+'/';

function processWordPressTheme() {
	var zipPath = 'tmp/'+path.basename(remoteThemePath);
	if(verbose) console.log("\nDownloading the WordPress theme zip to '"+zipPath+"'");

	request({url:remoteThemePath, encoding: null/*for zip files*/}, function(err, response, body) {
		if(err) return console.error("Cannot download WordPress Theme from '"+remoteThemePath+"' : " + err);
		fs.writeFile(zipPath, body, function(err) {
			if(err) return console.error("Cannot write downloaded WordPress Theme from '"+remoteThemePath+"' : " + err);
			if(verbose) console.log("\nWordPress theme zip download complete");

			var input = fs.createReadStream(zipPath);
			var unzipper = unzip.Extract({ path: 'tmp' });

			unzipper.on('close', function() {
				if(verbose) console.log("\nWordPress theme unzip complete");

				copyStyles();
				processMarkup();
			});

			unzipper.on('error', function(err) {
				return console.error("Cannot unzip WordPress Theme from '"+remoteThemePath+"' : " + err);
			});

			input.pipe(unzipper);
		});
	});
}

// =====================================================================

function copyStyles() {
	var defaultDest = pathPrefix+'/content/webdav/themes/WordPressThemeZIP/css';

	var checkAndCopy = function(src, dir, dest) {
		dest = dest || defaultDest;
		fs.stat(src, function(err, stats) {
			if(!err) {
				if(verbose) console.log("\nCopying over WordPress artifact '"+src+"' to '"+dest+dir+"' in the DX theme");
				ncp(src, dest+dir, function (err) {
					if (err) return console.error("Cannot copy: '"+src+"': " + err);
					onEnd();
				});
			} else onEnd();
		});
	}

	checkAndCopy(wordPressThemeDir+'style.css', '/style.css');
	checkAndCopy(wordPressThemeDir+'images', '/images');
	checkAndCopy(wordPressThemeDir+'img', '/img');
	checkAndCopy(wordPressThemeDir+'rtl.css', '/rtl.css');
	checkAndCopy(wordPressThemeDir+'screenshot.png', '/preview.png', pathPrefix+'/content/webdav/themes/WordPressThemeZIP');
}

// =====================================================================

function processMarkup() {

	// WordPress artifacts that can be removed
	var removeRegexArray = [
		/<title>.*?<\/title>/g, 
		/<\?php\s+?wp_head\(.*?\);\s*?\?>/g, 
		/<\?php\s+?bloginfo\(.*?\);\s*?\?>/g, 
		/<\?php\s+?body_class\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_ID\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_permalink\(.*?\);\s*?\?>/g,
		/<\?php\s+?is_sticky\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_time\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_category\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_post_thumbnail\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_title_attribute\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_author_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?get_next_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?echo\s+?get_next_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?get_previous_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?echo\s+?get_previous_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?get_previous_posts_link\(.*?\);\s*?\?>/g,
		/<\?php\s+?echo\s+?paginate_links\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_posts_pagination\(.*?\);\s*?\?>/g
	];
	var removeReplacementArray = new Array(removeRegexArray.length).fill('');

	// WordPress artifacts that can be replaced
	var replaceRegexArray = [
		/<\?php\s+?wp_footer\(.*?\);\s*?\?>/g, 
		/<\?php\s+?language_attributes\(.*?\);\s*?\?>/g,
		/<\?php\s+?get_search_form\(.*?\);\s*?\?>/g,
		/<\?php\s+?echo\s+?esc_url\(\s*?home_url\s*?\);\s*?\?>/g, 
		/<\?php\s+?echo\s+?get_option\(.*?home.*?\);\s*?\?>/g,
		/<\?php\s+?post_class\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_title\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_excerpt\(.*?\);\s*?\?>/g,
		/<\?php\s+?the_content\(.*?\);\s*?\?>/g,
		/<\/head>/
	];
	var replaceReplacementArray = [
		'<div id="wpthemeComplementaryContent" role="region" aria-labelledby="complementaryContentText">' +
			'<span style="display:none" id="complementaryContentText">Complementary Content</span>' +
			'<a rel="dynamic-content" href="co:config"></a>' +
		'</div>',
		'lang="en"',
		'<form role="search" method="get" class="search-form" action="#"><!-- this is the search form -->\n' +
		'	<label>\n' +
		'		<span class="screen-reader-text">Search for:</span>\n' +
		'		<input type="search" name="query" class="search-field" placeholder="Search..." value="" title="Search for:" /><!-- this is the search input -->\n' +
		'	</label>\n' +
		'	<input type="hidden" name="uri" value="searchCenter:query">\n' +
		'	<input type="submit" class="search-submit" value="Search" /><!-- this is the search submit button -->\n' +
		'</form>',
		'?uri=nm:oid:ibm.portal.Home',
		'?uri=nm:oid:ibm.portal.Home',
		'class="post hentry"',
		'<a rel="dynamic-content" href="lm:title"></a>',
		'<a rel="dynamic-content" href="lm:control"></a>',
		'<a rel="dynamic-content" href="lm:control"></a>',
		'<link rel="dynamic-content" href="co:head">' +
		'<link rel="dynamic-content" href="dyn-cs:id:'+lowerCase+'_head">' +
		'</head>'
	];

	var headerRegex = /<\?php\s+?get_header\(\);\s*?\?>/;
	var footerRegex = /<\?php\s+?get_footer\(\);\s*?\?>/;
	var sidebarRegex = /<\?php\s+?get_sidebar\(\);\s*?\?>/;
	var theLoopRegex = /<\?php\s*?if\s*?\(\s*?have_posts\(\)\s*?\)[\s\S]+?endwhile;[\s\S]+?endif;\s*?\?>/;
	var navRegex = /wp_nav_menu\([\s\S]*?\);[\s\S]*?\?>/;

	var themeHtmlPath = pathPrefix+'/content/webdav/themes/WordPressThemeZIP/theme.html';
	if(verbose) console.log("\nCreating theme.html contents from header.php, footer.php and sidebar.php");
	var themeContents = fs.readFileSync(wordPressThemeDir+'index.php', 'utf8');
	if(themeContents.match(headerRegex)) themeContents = themeContents.replace(headerRegex, fs.readFileSync(wordPressThemeDir+'header.php', 'utf8'));
	if(themeContents.match(footerRegex)) themeContents = themeContents.replace(footerRegex, fs.readFileSync(wordPressThemeDir+'footer.php', 'utf8'));
	if(themeContents.match(sidebarRegex)) themeContents = themeContents.replace(sidebarRegex, fs.readFileSync(wordPressThemeDir+'sidebar.php', 'utf8'));

	// gather navigation information
	var navContents = themeContents.match(navRegex);
	if(navContents && navContents.length > 0) {
		if(verbose) console.log("\nParsing wp_nav_menu from theme.html");
		themeContents = themeContents.replace(navRegex, '?><a rel="dynamic-content" href="dyn-cs:id:'+lowerCase+'_nav"></a>');
		processNavigation(navContents[0]);
	} else onEnd();

	// create skin.html contents
	var skinHtmlPath = pathPrefix+'/content/webdav/themes/WordPressThemeZIP/skins/Standard/skin.html';
	var skinContents = themeContents.match(theLoopRegex);
	if(skinContents && skinContents.length > 0) {
		if(verbose) console.log("\nCopying The Loop from theme.html");
		themeContents = themeContents.replace(theLoopRegex, '<a rel="dynamic-content" href="lm:template"></a>');
		skinContents = skinContents[0];
	}

	// write theme.html contents
	fs.writeFile(themeHtmlPath, themeContents, function (err) {
		if (err) return console.error("Cannot write theme.html: " + err);
		if(verbose) console.log("\nWrote theme.html contents to '"+themeHtmlPath+"'");
		replaceInFiles([themeHtmlPath], removeRegexArray.concat(replaceRegexArray), removeReplacementArray.concat(replaceReplacementArray));
		onEnd();
	});

	// write skin.html contents
	if(skinContents) {
		fs.writeFile(skinHtmlPath, skinContents, function (err) {
			if (err) return console.error("Cannot write skin.html: " + err);
			if(verbose) console.log("\nWrote skin.html contents to '"+skinHtmlPath+"'");
			replaceInFiles([skinHtmlPath], removeRegexArray.concat(replaceRegexArray), removeReplacementArray.concat(replaceReplacementArray));
			onEnd();
		});
	} else onEnd();
}

// =====================================================================

function processNavigation(navPHP) {

	// check for navigation params
	var containerResults = navPHP.match(/'container'\s*?=>\s*?'(.*?)'/);
	var containerClassResults = navPHP.match(/'container_class'\s*?=>\s*?'(.*?)'/);
	var containerIdResults = navPHP.match(/'container_id'\s*?=>\s*?'(.*?)'/);
	var menuClassResults = navPHP.match(/'menu_class'\s*?=>\s*?'(.*?)'/);
	var beforeResults = navPHP.match(/'before'\s*?=>\s*?'(.*?)'/);
	var linkBeforeResults = navPHP.match(/'link_before'\s*?=>\s*?'(.*?)'/);
	var linkAfterResults = navPHP.match(/'link_after'\s*?=>\s*?'(.*?)'/);
	var afterResults = navPHP.match(/'after'\s*?=>\s*?'(.*?)'/);

	// get navigation params
	var container = containerResults && containerResults.length ? containerResults[1] : 'div';
	var container_class = containerClassResults && containerClassResults.length ? containerClassResults[1] : 'menu-main-nav-container';
	var container_id = containerIdResults && containerIdResults.length ? containerIdResults[1] : 'menu';
	var menu_class = menuClassResults && menuClassResults.length ? menuClassResults[1] : 'div';
	var before = beforeResults && beforeResults.length ? beforeResults[1] : '';
	var link_before = linkBeforeResults && linkBeforeResults.length ? linkBeforeResults[1] : '';
	var link_after = linkAfterResults && linkAfterResults.length ? linkAfterResults[1] : '';
	var after = afterResults && afterResults.length ? afterResults[1] : '';

	replaceInFiles([pathPrefix+'/installableApps/ear/WordPressThemeEAR/WordPressThemeWAR/themes/html/dynamicSpots/navigation.jsp'], 
		[/\$container/g, /\$container_class/g, /\$container_id/g, /\$menu_class/g, /\$before/g, /\$link_before/g, /\$link_after/g, /\$after/g], 
		[container, container_class, container_id, menu_class, before, link_before, link_after, after]);
}

// =====================================================================

function createOutput() {
	if(outputDone) return;
	outputDone = true;

	// create an archive (zip, ear, war, paa, etc), and then delete its source folder
	var createArchive = function(destFile, targetPath, tarBombPreventer, cb) {
		var output = fs.createWriteStream(destFile);
		var zipper = archiver('zip');

		output.on('close', function () {
			if(verbose) console.log("Deleting archive source directory at '"+targetPath+"'");
			rimraf(targetPath, function(err) {
				if (err) return console.error("Cannot delete zip source folder '"+targetPath+"': " + err);
				if(cb) cb();
			});
		});

		zipper.on('error', function(err) {
			if (err) return console.error("Cannot create zip at '"+destFile+"': " + err);
		});

		zipper.pipe(output);
		zipper.directory(targetPath, tarBombPreventer);
		zipper.finalize();
	}

	var createZipDir = function(destFile, targetPath, cb) {
		zipdir(targetPath, { saveTo: destFile }, function (err) {
			if (err) return console.error("Cannot zip folder '"+targetPath+"': " + err);
			if(cb) cb();
		});
	}

	var zipPath = pathPrefix+'/content/webdav/themes/';
	var warPath = pathPrefix+'/installableApps/ear/WordPressThemeEAR/';
	var earPath = pathPrefix+'/installableApps/ear/';

	// output  ==>	theme static content zip: tmp/<name>Theme/components/<name>Theme/content/webdav/themes/<name>.zip
	//				theme ear: tmp/<name>Theme/components/<name>Theme/installableApps/ear/<name>Theme.ear
	//				theme war: tmp/<name>Theme/components/<name>Theme/installableApps/ear/<name>Theme.ear/<name>Theme.war
	//				theme paa: output/<name>Theme.paa
	if(verbose) console.log("\nCreating static content zip at '"+zipPath+camelCase+".zip'");
	createArchive(zipPath+camelCase+'.zip', zipPath+'WordPressThemeZIP', camelCase, function() {
		if(verbose) console.log("Creating dx theme war at '"+warPath+camelCase+"Theme.war'");
		createArchive(warPath+camelCase+'Theme.war', warPath+'WordPressThemeWAR', '', function() {
			if(verbose) console.log("Creating dx theme ear at '"+earPath+camelCase+"Theme.ear'");
			createArchive(earPath+camelCase+'Theme.ear', earPath+'WordPressThemeEAR', '', function() {
				if(verbose) console.log("Creating dx theme paa at 'output/"+camelCase+"Theme.paa'");
				createZipDir('output/'+camelCase+'Theme.paa', 'tmp/paa', function() {
					if(verbose) console.log("Deleting 'tmp' directory");
					rimraf('tmp', function(err) {
						if (err) return console.log("Cannot delete 'tmp'" + err);
					});
				});
			});
		});
	});

	// create an output log file with theme information and paa instructions
	ncp('output.html', 'output/output_'+capitalCamelCase+'.html', function (err) {
		if (err) return console.error("Cannot copy: 'output.html' to 'output/output_'+capitalCamelCase+'.html': " + err);
		console.log("\nWriting output information to 'output/output_"+capitalCamelCase+".html'\n");
		replaceInFiles(['output/output_'+capitalCamelCase+'.html'], 
			[/wordPress/g, /WordPress/g, /wordpress/g, /WP_LINK/g], 
			[camelCase, capitalCamelCase, lowerCase, 'creating-an-ibm-digital-experience-v8-5-theme-from-a-wordpress-theme']);
	});
}
