'use strict';

// This is the global list of the stories, an instance of StoryList
let allStoriesList
let newStory;

/******************************************************************************

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	allStoriesList = await StoryList.getStories();
	$storiesLoadingMsg.remove();
  // console.log(storyList.stories)
	putStoriesOnPage(allStoriesList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);
  let favoriteHtml=""
  let favoriteTF = false;
  let favoriteIcon = ICON_notfavorited;
  let ownHtml=""
  let ownTF=false

	// if a user is logged in, add a favorite icon
	if (currentUser) {
		favoriteTF = checkForFavStory(currentUser, story.storyId);
    favoriteTF ? (favoriteIcon = ICON_favorited) : (favoriteIcon = ICON_notfavorited);
    favoriteHtml=`<small class="story-favorite" data-favorite="${favoriteTF}">${favoriteIcon}</small>`

    ownTF=checkForOwnStory(currentUser,story.storyId)
    if (ownTF) ownHtml=`<small class="story-deleteown">${ICON_deleteStory}</small>`
  }

	const hostName = story.getHostName();
	return $(`
    <li id="${story.storyId}">
      ${favoriteHtml}
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      ${ownHtml}
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
      </li>
  `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesToArrayThenOnPage(stories) {
  // load all favorite stories in Story class before sending it putStoriesOnPage()
  const storiesArray=[]
  for (let story of stories){
    storiesArray.push(new Story(story))
  }
	putStoriesOnPage(storiesArray)
}

function putStoriesOnPage(storiesArray) {
  console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storiesArray) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
  }
  
	$allStoriesList.show();

	// refresh event listeners to favorite, unfavorite, or delete stories
  addEventListenerstoFavoriteBtns()
  addEventListenerstoDeleteOwnBtns()
}




/** Handle add new story form submission */

async function addStory(evt) {
	console.debug('addStory', evt);
	evt.preventDefault();

	const title = $('#newstory-title').val();
	const author = $('#newstory-author').val();
	const url = $('#newstory-url').val();

  newStory = await StoryList.addStory(currentUser, { title, author, url });
  currentUser.ownStories.push(new Story(newStory))
  
  // add new story to the list and to currentUser
  const $newStory = generateStoryMarkup(newStory)
  $allStoriesList.prepend($newStory)

  hidePageComponents()
  $allStoriesList.show()

  // refresh event listeners to favorite, unfavorite, or delete stories
  addEventListenerstoFavoriteBtns()
  addEventListenerstoDeleteOwnBtns()

  $newStoryForm.trigger('reset');
	
}
$newStoryForm.on('submit', addStory);

async function deleteStory(evt){
  console.debug('deleteStory',evt)
 
  const storyId = $(this).parent().attr('id');
  const response=await StoryList.deleteStory(currentUser,storyId)

  const deletedStory=new Story(response)
  
  $(`#${deletedStory.storyId}`).remove()
  
  let storyIndex=0
  for (let story of currentUser.ownStories){
    if (story.storyId===deletedStory.storyId){
      currentUser.ownStories.splice(storyIndex,1)
      return
    } else{
      storyIndex++
    }
  }

}

async function favoriteStory(evt) {
	// console.debug('favoriteStory', evt);

	const storyId = $(this).parent().attr('id');
	let favoriteTF = $(this).attr('data-favorite');

	let addDelete;
	favoriteTF === 'true' ? (addDelete = 'delete') : (addDelete = 'add');
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

function checkForOwnStory(user, storyId) {
	for (let story of user.ownStories) {
		if (story.storyId === storyId) return true;
	}
	return false;
}


function addEventListenerstoFavoriteBtns(){
	$favoriteStoryBtns = $('.story-favorite');
	$favoriteStoryBtns.on('click', favoriteStory);
}

function addEventListenerstoDeleteOwnBtns(){
  $deleteOwnBtns = $('.story-deleteown');
	$deleteOwnBtns.on('click', deleteStory);
}



