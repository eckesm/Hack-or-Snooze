/* ****************************************************************************
------------------------ Settings & Table of Contents -------------------------
**************************************************************************** */
'use strict';

// The global list of the stories, an instance of StoryList
let allStoriesList;
// The global variable for editStoryID which controls how certain functions operate application
let editStoryId;

/** TABLE OF CONTENTS
 * - getAndShowStoriesOnStart()
 * - generateStoryMarkup()
 * - putStoriesToArrayThenOnPage()
 * - putStoriesOnPage()
 * - addEditStory()
 * - populateNewStoryFormWithEdit()
 * - deleteStory()
 * - favoriteStory()
 * 
 * Auxillary Functions & Event Listeners
 * - checkForFavStory()
 * - checkForOwnStory()
 * - event listeners & functions
 */ 

/* ****************************************************************************
---------------------------------- Stories UI ---------------------------------
**************************************************************************** */

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
	allStoriesList = await StoryList.getStories();
	$storiesLoadingMsg.remove();
	// console.log(storyList.stories)
	putStoriesOnPage(allStoriesList.stories);
}
// ____________________________________________________________________________

/** A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - addEdit: an option input; if "edit" then changes what markup is returned 
 *   to the caller (prevents the <li> tag from being duplicated when user 
 *   makes an edit to a story)
 * 
 * Returns the markup for the story.
 */
function generateStoryMarkup(story, addEdit) {
	// console.debug("generateStoryMarkup", story);
	let favoriteTF = false;
	let favoriteIcon = ICON_notfavorited;
	let favoriteHtml = '';
	let ownTF = false;
	let ownHtml = '';

	// if a user is logged in, add a favorite or unfavorite icon
	// if logged-in user is owner/creator of a story and add edit pencil icon
	if (currentUser) {
		favoriteTF = checkForFavStory(currentUser, story.storyId);
		favoriteTF ? (favoriteIcon = ICON_favorited) : (favoriteIcon = ICON_notfavorited);
		favoriteHtml = `<small class="story-favorite">${favoriteIcon}</small>`;

		ownTF = checkForOwnStory(currentUser, story.storyId);
		if (ownTF)
			ownHtml = `<small class="story-editown"> ${ICON_editStory} </small>
    <small class="story-deleteown"> ${ICON_deleteStory} </small>`;
	}

	const hostName = story.getHostName();
	let markupHtml = `${favoriteHtml}
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    ${ownHtml}
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>`;

	/* if the markup is being added to the page and not edited on the page, 
     add in <li> element around html */
	if (addEdit !== 'edit') {
		markupHtml = `<li id="${story.storyId}">${markupHtml}</li>`;
	}
	return markupHtml;
}
// ____________________________________________________________________________

/** Given an array of story data, converts to array of Story instances and 
 * sends to putStoriesonPage().
 * - Necessary when taking array of stories directly from API that has not 
 * been converted to class instance yet */
function putStoriesToArrayThenOnPage(stories) {
	putStoriesOnPage(stories.map(s => new Story(s)));
}
// ____________________________________________________________________________

/** Takes an array of Story instances, creates html markup for each, and adds 
 *  each to $allStoriesList on page */
function putStoriesOnPage(storiesArray) {
	// console.debug('putStoriesOnPage');
	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storiesArray) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();

	// refresh event listeners to favorite, unfavorite, edit, or delete stories
	addEventListenerstoFavoriteBtns();
	addEventListenerstoEditOwnBtns();
	addEventListenerstoDeleteOwnBtns();
}
// ____________________________________________________________________________

/** Handle add new story and edit existing story form submission
 * - references editStoryId (which would be set by clicking the "edit icon")
 */
async function addEditStory(evt) {
	// console.debug('addEditStory', evt);
	evt.preventDefault();

	const title = $('#newstory-title').val();
	const author = $('#newstory-author').val();
	const url = $('#newstory-url').val();

	// add/edit API
	let addedEditedStory = await StoryList.addEditStory(currentUser, { title, author, url }, editStoryId);

	if (editStoryId === undefined) {
		// if adding a story
		currentUser.ownStories.push(new Story(addedEditedStory));

		// add new story to the list and to currentUser
		allStoriesList.stories.unshift(new Story(addedEditedStory));
		putStoriesOnPage(allStoriesList.stories);
	}
	else {
		// if editing a story
		for (let story of currentUser.ownStories) {
			if (story.storyId === editStoryId) {
				story.title = title;
				story.author = author;
				story.url = url;
			}
		}
		console.log($(`#${editStoryId}`));
		$(`#${editStoryId}`).html(generateStoryMarkup(new Story(addedEditedStory), 'edit'));
		editStoryId = undefined;
	}

	// show all stories list
	hidePageComponents();
	$allStoriesList.show();

	// refresh event listeners to favorite, unfavorite, edit, or delete stories
	addEventListenerstoFavoriteBtns();
	addEventListenerstoEditOwnBtns();
	addEventListenerstoDeleteOwnBtns();

	$newStoryForm.trigger('reset');
}

// ____________________________________________________________________________

function populateNewStoryFormWithEdit(evt) {
	// console.log('populateNewStoryFormWithEdit', evt);
	editStoryId = $(this).parent().attr('id');

	for (let story of currentUser.ownStories) {
		if (story.storyId === editStoryId) {
			$('#newstory-title').val(story.title);
			$('#newstory-author').val(story.author);
			$('#newstory-url').val(story.url);
		}
	}

	hidePageComponents();
	$newStoryForm.show();
}
// ____________________________________________________________________________

/** Deletes a story from API, page, and currentUser's ownStories and favorites 
 * variable arrays */
async function deleteStory(evt) {
	// console.debug('deleteStory', evt);

	const storyId = $(this).parent().attr('id');
	const response = await StoryList.deleteStory(currentUser, storyId);

	// remove deleted story <li> from page
	const deletedStory = new Story(response);
	$(`#${deletedStory.storyId}`).remove();

	// remove story from ownStories (in case user clicks into "submissions" before page reloads)
	let storyIndex = 0;
	for (let story of currentUser.ownStories) {
		if (story.storyId === deletedStory.storyId) {
			currentUser.ownStories.splice(storyIndex, 1);
			return;
		}
		else {
			storyIndex++;
		}
	}

	// remove story from favorites, if applicable (in case user clicks into "favorites" before page reloads)
	storyIndex = 0;
	for (let story of currentUser.favorites) {
		if (story.storyId === deletedStory.storyId) {
			currentUser.favorites.splice(storyIndex, 1);
			return;
		}
		else {
			storyIndex++;
		}
	}
}
// ____________________________________________________________________________

/** add or remove favorite designation for a story with API, on page, and in currentUser variable */
async function favoriteStory(evt) {
	// console.debug('favoriteStory', evt);

	const storyId = $(this).parent().attr('id');
	// check if favorite
	let favoriteTF = checkForFavStory(currentUser, storyId);

	let addDelete;
	favoriteTF === true ? (addDelete = 'delete') : (addDelete = 'add');
	// tell User.favoriteStory() to add or delete favorite
	currentUser.favorites = await User.favoriteStory(currentUser, storyId, addDelete);

	// update html icon
	addDelete === 'add' ? $(this).html(ICON_favorited) : $(this).html(ICON_notfavorited);
}

/* ****************************************************************************
-------------------- Auxillary Functions & Event Listeners --------------------
**************************************************************************** */

/** Check if given story is a favorite of a given user */
function checkForFavStory(user, storyId) {
	for (let story of user.favorites) {
		if (story.storyId === storyId) return true;
	}
	return false;
}
// ______________________________________________

/** Check if given story was created by a given user */
function checkForOwnStory(user, storyId) {
	for (let story of user.ownStories) {
		if (story.storyId === storyId) return true;
	}
	return false;
}
// ______________________________________________

// event listener for new story form submission (and edits)
$newStoryForm.on('submit', addEditStory);

/** the following functions apply event listers are applied to variables that 
 * are declared in the Settings section of the Main script, but defined below */
function addEventListenerstoFavoriteBtns() {
	$favoriteStoryBtns = $('.story-favorite');
	$favoriteStoryBtns.on('click', favoriteStory);
}

function addEventListenerstoEditOwnBtns() {
	$editOwnBtns = $('.story-editown');
	$editOwnBtns.on('click', populateNewStoryFormWithEdit);
}

function addEventListenerstoDeleteOwnBtns() {
	$deleteOwnBtns = $('.story-deleteown');
	$deleteOwnBtns.on('click', deleteStory);
}
