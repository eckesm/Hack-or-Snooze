"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  // refresh all stories to capture additions
  getAndShowStoriesOnStart();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navNewStory.show()
  $navFavorites.show()
}


/** When a logged in user clicks the "submit" link, bring the user to the "Add New Story" form; if a user is not logged in, load the account forms so the user can login or create an account */

function navNewStoryClick(evt){
  console.debug("navNewStoryClick", evt)
  if (currentUser){
    hidePageComponents()
    $newStoryForm.show()
  } else {
    hidePageComponents()
    $loginForm.show();
    $signupForm.show();
  }
}

$navNewStory.on("click",navNewStoryClick)

function navFavoritesClick(evt){
  console.debug("navFavoritesClick",evt)
  putFavStoriesOnPage()
}

$navFavorites.on("click",navFavoritesClick)