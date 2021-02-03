/* ****************************************************************************
------------------------ Settings & Table of Contents -------------------------
**************************************************************************** */
"use strict";

/** TABLE OF CONTENTS
 * - navAllStories() + event listener
 * - navLoginClick () + event listener
 * - updateNavOnLogin()
 * - navNewStoryClick ()  + event listener
 * - navSubmissionsClick() + event listener
 * - navFavoritesClick() + event listener
 */

/* ****************************************************************************
------------------------------- Navbar Functions ------------------------------
**************************************************************************** */

/** Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  // console.debug("navAllStories", evt);
  hidePageComponents();
  // refresh all stories to capture additions
  getAndShowStoriesOnStart();
}

// add event listener to body
$body.on("click", "#nav-all", navAllStories);
// ____________________________________________________________________________

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  // console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

// add event listener to navbar link "login/signup"
$navLogin.on("click", navLoginClick);
// ____________________________________________________________________________

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  // console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navDividers.show()
}
// ____________________________________________________________________________

/** Shows the "Add New Story" form */
function navNewStoryClick(evt){
  // console.debug("navNewStoryClick", evt)
  // reset editStoryId and form inputs in case a story edit was started but not submitted
  editStoryId=undefined
  $newStoryForm.trigger('reset')
  
  hidePageComponents()
  $newStoryForm.show()
}

// add event listener to navbar link "submit"
$navNewStory.on("click",navNewStoryClick)
// ____________________________________________________________________________

/** Shows a list of the user's submissions */
function navSubmissionsClick(evt){
  // console.debug("navSubmissionsClick",evt)
  hidePageComponents()
  putStoriesToArrayThenOnPage(currentUser.ownStories)
}

// add event listener to navbar link "submissions"
$navSubmissions.on("click",navSubmissionsClick)
// ____________________________________________________________________________


/** Shows a list of the user's favorite stories */
function navFavoritesClick(evt){
  // console.debug("navFavoritesClick",evt)
  hidePageComponents()
  putStoriesToArrayThenOnPage(currentUser.favorites)
}

// add event listener to navbar link "favorites"
$navFavorites.on("click",navFavoritesClick)