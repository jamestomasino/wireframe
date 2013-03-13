
/*************************************************

	TAB.js
	------
	This code is executed on the TAB
	Runs on the Page context
	Is fired with each page refresh

*************************************************/


//------------------------------------------------
// PAGE >> POPUP
// Get mode (enabled?)
//------------------------------------------------

// Get Preferences from the Extension
	isEnabled = false;
	//enableAll = false; // Enabled on all domains
	function getMode(response) {

		var enableAll = (response.enableAll === "true");

		isEnabled = enableAll;

		this.setBodyType();
	}
	chrome.extension.sendMessage({method: "getMode", refresh: true}, this.getMode);

// Get BODY tag
	domReady = false;
	function onReady() {

		domReady = true;

		// set up web font Cherry PIE
		var style=document.createElement('style');
		style.id="redacted-style";
		style.innerHTML=
			"@font-face { font-family: 'Redacted'; src: local('☺'), url('"+chrome.extension.getURL("/fonts/redacted-regular.woff")+"') format('woff'); }\n";
		if (document.head)
			document.head.appendChild(style);


		// Inject Font
		//var styleNode           = document.createElement ("style");
		//styleNode.type          = "text/css";
		//styleNode.textContent   =  "@font-face { font-family: 'Redacted';";
		//styleNode.textContent   += "src: url('" + chrome.extension.getURL ("css/redacted-regular.eot") + "');"
		//styleNode.textContent   += "src: url('" + chrome.extension.getURL ("css/redacted-regular.woff") + "') format('woff'),"
		//styleNode.textContent   += "src: url('" + chrome.extension.getURL ("css/redacted-regular.ttf") + "') format('ttf'),"
		//styleNode.textContent   += "src: url('" + chrome.extension.getURL ("css/redacted-regular.svg#filename") + "') format('svg');"
		//styleNode.textContent   += " }";
		//document.head.appendChild (styleNode)

		this.setBodyType();
	}
	window.addEventListener('DOMContentLoaded', onReady, false);


//------------------------------------------------
// Set BODY type (plain_text?)
// Requires both:
//	- settings from the Extension (sendMessage)
//	- <BODY> tag to be ready
//------------------------------------------------
var body_class_plain_text = "__wireframe__";
var body_class_ready = "__wireframe_READY__";

function setBodyType() {
	var body = document.getElementsByTagName("body")[0];

	if(body) {
		if (body.className.indexOf(body_class_ready) < 0)
			body.className += " " + body_class_ready;

		if (isEnabled) {
			if (body.className.indexOf(body_class_plain_text) < 0)
				body.className += " " + body_class_plain_text;
		}
	}
}

//------------------------------------------------
// BLOCK IFRAMES
// Unless they come from this domain
// Might be some needed script
// GMAIL breaks if we block iFrames
//------------------------------------------------

	function urlBelongsToThisSite(assetUrl) {
		var currHost = parseUri(window.location).host;
		var assetHost = parseUri(assetUrl).host;

		return (currHost === assetHost);
	}

	// Use HTML5 dataset to store edits
	// Namespace our keys to avoid conflicts
	var dataset_redirected_key = "__wireframe_redirected__";

	// Don't load any IFRAME unless it's from this same domain
	function doBeforeLoad(event) {

		// Use HTML5 dataset to store edits
		if (isEnabled &&
			!event.srcElement.dataset['redirected'] &&
			event.srcElement.tagName == "IFRAME"  &&
			urlBelongsToThisSite(event.srcElement.src)
			)
		{
			// If it is something we want to redirect then set a data attribute so we know its allready been changed
			// Set that attribute to it original src in case we need to know what it was later
			event.srcElement.dataset['redirected'] = event.srcElement.src;
			// Set the source to the new url you want the element to point to
			// event.srcElement.src = "replacement.png";
			event.srcElement.src = chrome.extension.getURL("imgs/bg_blank_1px.png");

			//event.srcElement.src = chrome.extension.getURL("imgs/bg_blank.png");
			event.srcElement.style.backgroundImage = "url('"+chrome.extension.getURL("imgs/bg_block.png")+"')";
		}

			}

	document.addEventListener('beforeload', doBeforeLoad, true);

