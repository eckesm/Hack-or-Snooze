/* ****************************************************************************
----------------------------------- Settings ----------------------------------
**************************************************************************** */
'use strict';

// So we don't have to keep re-finding things on page, find DOM elements once:
const $body = $('body');

const $storiesLoadingMsg = $('#stories-loading-msg');
const $allStoriesList = $('#all-stories-list');
const $newStoryForm = $('#newstory-form');

/* The buttons used to favorite, unfavorite, edit, and delete stories are 
declared below but necessarily defined in the stories script by the following 
functions: addEventListenerstoFavoriteBtns(), addEventListenerstoEditOwnBtns(), 
addEventListenerstoDeleteOwnBtns() */
let $favoriteStoryBtns, $editOwnBtns, $deleteOwnBtns;

const $loginForm = $('#login-form');
const $signupForm = $('#signup-form');

const $navLogin = $('#nav-login');
const $navUserProfile = $('#nav-user-profile');
const $navLogOut = $('#nav-logout');
const $navNewStory = $('#nav-newstory');
const $navFavorites = $('#nav-favorites');
const $navSubmissions = $('#nav-submissions');
const $navDividers = $('.nav-divider');

// Custom images and icons
const ICON_favorited = '<i class="fas fa-heart"></i>';
const ICON_notfavorited = '<i class="far fa-heart"></i>';
const ICON_deleteStory = '<i class="fas fa-trash"></i>';
const ICON_editStory = '<i class="fas fa-edit"></i>';

/* ****************************************************************************
------------------------------ Main & DOM Load --------------------------------
**************************************************************************** */

/** To make it easier for individual components to show just themselves, hides 
most visible forms and sections on the page other than the navbar and containers. 
After calling this, individual components can re-show just what they want. */
function hidePageComponents() {
	const components = [ $allStoriesList, $newStoryForm, $loginForm, $signupForm ];
	components.forEach(c => c.hide());
}
// ____________________________________________________________________________

/** Overall function to kick off the app. */
async function start() {
	// console.debug('start');

	// "Remember logged-in user" and log in, if credentials in localStorage
	await checkForRememberedUser();
	await getAndShowStoriesOnStart();

	// if we got a logged-in user
	if (currentUser) updateUIOnUserLogin();
}
// ____________________________________________________________________________

/** Once the DOM is entirely loaded, begin the app */
// console.warn(
// 	'HEY STUDENT: This program sends many debug messages to' +
// 		" the console. If you don't see the message 'start' below this, you're not" +
// 		' seeing those helpful debug messages. In your browser console, click on' +
// 		" menu 'Default Levels' and add Verbose"
// );
$(start);
