'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;
let newStory;

/******************************************************************************

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);
	let favoriteTF = false;
	let favoriteIcon = ICON_notfavorited;

	// console.log(story.storyId)
	if (currentUser) {
		favoriteTF = checkForFavStory(currentUser, story.storyId);
		favoriteTF ? (favoriteIcon = ICON_favorited) : (favoriteIcon = ICON_notfavorited);
	}

	const hostName = story.getHostName();
	return $(`
    <li id="${story.storyId}">
      <small class="story-favorite" data-favorite="${favoriteTF}">${favoriteIcon}</small>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();

	// add event listener to all favorite icons on list of stories
	$favoriteStoryBtns = $('.story-favorite');
	$favoriteStoryBtns.on('click', favoriteStory);
}

/** Handle add new story form submission */

async function addStory(evt) {
	console.debug('addStory', evt);
	evt.preventDefault();

	const title = $('#newstory-title').val();
	const author = $('#newstory-author').val();
	const url = $('#newstory-url').val();

	newStory = await StoryList.addStory(currentUser, { title, author, url });

	$newStoryForm.trigger('reset');
	getAndShowStoriesOnStart();
}
$newStoryForm.on('submit', addStory);

async function favoriteStory(evt) {
	// console.debug('favoriteStory', evt);
	evt.preventDefault();

	const storyId = $(this).parent().attr('id');
	let favoriteTF = $(this).attr('data-favorite');
	console.log(favoriteTF);

	let addDelete;
	favoriteTF === 'true' ? (addDelete = 'delete') : (addDelete = 'add');
	console.log(addDelete);
	currentUser.favorites = await User.favoriteStory(currentUser, storyId, addDelete);

	if (addDelete === 'add') {
		$(this).html(ICON_favorited);
		$(this).attr('data-favorite', 'true');
	}
	else {
		$(this).html(ICON_notfavorited);
		$(this).attr('data-favorite', 'false');
	}
}

function checkForFavStory(user, storyId) {
	for (let story of user.favorites) {
		if (story.storyId === storyId) return true;
	}
	return false;
}
