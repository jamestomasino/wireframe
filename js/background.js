
/*************************************************

BG.js
------
This code is executed on the BACKGROUND
It runs in the context of the extension (not the page)
Is fired when the extension loads and it's always running

*************************************************/

//------------------------------------------------
// UI
//------------------------------------------------

//var textMode = false;
var iconOn = "../imgs/iconOn.png";
var iconOff = "../imgs/iconOff.png";

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	toggleIsEnableAll();
	setListeners();
	updateUI();
	refreshTab(tab.id);
});

function updateUI() {
	var isEnabled = getIsEnableAll();
	var iconCurr = isEnabled ? iconOn : iconOff;
	chrome.browserAction.setIcon({path:iconCurr});
}

function refreshTab(tabId) {
	chrome.tabs.reload(tabId);
}

//------------------------------------------------
// MODE
//------------------------------------------------
function getIsEnableAll()
{
	return localStorage['enable_all'] === "true";
}

function setIsEnableAll(enable)
{
	localStorage['enable_all'] = enable;
	return enable;
}

function toggleIsEnableAll()
{
	return setIsEnableAll(!getIsEnableAll());
}

//------------------------------------------------
// POPUP >> PAGE
//------------------------------------------------
// This function is called on page load by the plain-text.js
// It returns the current Mode
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	var response = {};

	if (request.method === "getMode"){
	  response.enableAll = getIsEnableAll().toString();
	}
	if (request.refresh === "true"){
		setListeners();
		updateUI();
	}

	sendResponse(response); // snub them.
});

//------------------------------------------------
// Avoid loading IMGs, IFRAMEs and OBJECTs
//------------------------------------------------

// Sets the listeners only if the extension is enabled for the current context
onBeforeRequestImage = function(info)
{
	// Redirect the image request to blank.
	return {redirectUrl: chrome.extension.getURL("imgs/bg_blank_1px.png")};
};

onBeforeRequestObject = function(info) {
	// Redirect the asset request to ////.
	return {redirectUrl: chrome.extension.getURL("imgs/bg_lines_03_grey.png")};
};

function setListeners(){
	var isEnabled = getIsEnableAll();

	if (!isEnabled)
	{
		chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestImage);
		chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestObject);
	}
	else
	{
		chrome.webRequest.onBeforeRequest.addListener(
			onBeforeRequestImage, {
				urls: [
					"http://*/*",
					"https://*/*"
				],
				types: ["image"]
			},
			["blocking"]
		);

		chrome.webRequest.onBeforeRequest.addListener(
			onBeforeRequestObject, {
				urls: [
					"http://*/*",
					"https://*/*"
				],
				types: ["object"]
			},
			["blocking"]
		);
	}
}
setListeners();
updateUI();
