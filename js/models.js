/* ****************************************************************************
------------------------ Settings & Table of Contents -------------------------
**************************************************************************** */
'use strict';
const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/** TABLE OF CONTENTS
 * Story class
 * - getHostName()
 * 
 * StoryList class
 * - getStories()
 * - addEditStory()
 * - deleteStory()
 * 
 * User class
 * - favoriteStory()
 * - signup()
 * - login()
 * - loginViaStoredCredentials()
 */

/* ****************************************************************************
-------------------------------- Story class ----------------------------------
**************************************************************************** */

/** Story: a single story in the system */
class Story {
	/** Make instance of Story from data object about story:
   *  - {title, author, url, username, storyId, createdAt}
   */
	constructor({ storyId, title, author, url, username, createdAt }) {
		this.storyId = storyId;
		this.title = title;
		this.author = author;
		this.url = url;
		this.username = username;
		this.createdAt = createdAt;
	}

	/** Parses hostname out of URL and returns it. */
	getHostName() {
		const urlString = this.url;
		const hostnameStart = urlString.indexOf('//');
		let hostnameEnd = urlString.indexOf('/', hostnameStart + 2);

		// remove port string, if present, and make end of string
		const urlPort = urlString.indexOf(':', hostnameStart);
		if (urlPort > hostnameStart && urlPort < hostnameEnd) hostnameEnd = urlPort;

		// if there is no terminal "/", take the entire rest of the url; otherwise use the "/" following the intiail "//" to indicate the end of the hostname part of the url
		let hostname =
			hostnameEnd === -1 ? urlString.slice(hostnameStart + 2) : urlString.slice(hostnameStart + 2, hostnameEnd);

		// console.log(hostname)
		return hostname;
	}
}

/* ****************************************************************************
----------------------------- StoryList class ---------------------------------
**************************************************************************** */

/** List of Story instances: used by UI to show story lists in DOM. */
class StoryList {
	/** Make instance of StoryList from instance of Story. */
	constructor(stories) {
		this.stories = stories;
  }
  // __________________________________________________________________________

	/** Generate a new StoryList. It:
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
	static async getStories() {
		// Note presence of `static` keyword: this indicates that getStories is
		//  **not** an instance method. Rather, it is a method that is called on the
		//  class directly. Why doesn't it make sense for getStories to be an
		//  instance method?

		// query the /stories endpoint (no auth required)
		const response = await axios({
			url    : `${BASE_URL}/stories`,
			method : 'GET'
		});

		// turn plain old story objects from API into instances of Story class
		const stories = response.data.stories.map(story => new Story(story));

		// build an instance of our own class using the new array of stories
		return new StoryList(stories);
  }
  // __________________________________________________________________________

	/** Adds story data to API and makes a Story instance.
   * - user token: the current instance of User who will post the story
   * - obj of {title, author, url}
   * 
   * If passed a optional third input of an existing story's id, will send 
   * edited story data to API and make a Story instance.
   *
   * Returns the new or updated Story instance
   */
	static async addEditStory(user, addEditStory, storyId) {
		let apiMethod, apiUrl;
		if (editStoryId === undefined) {
			apiUrl = `${BASE_URL}/stories`;
			apiMethod = 'POST';
		}
		else {
			apiUrl = `${BASE_URL}/stories/${storyId}`;
			apiMethod = 'PATCH';
		}

		const response = await axios({
			url    : apiUrl,
			method : apiMethod,
			data   : {
				token : user.loginToken,
				story : { author: addEditStory.author, title: addEditStory.title, url: addEditStory.url }
			}
		});

		let { story } = response.data;
		return new Story({
			author    : story.author,
			createdAt : story.createdAt,
			storyId   : story.storyId,
			title     : story.title,
			url       : story.url,
			username  : story.username
		});
  }
  // __________________________________________________________________________

	/** Sends delete story data to API, makes a Story instance of the deleted 
   * story.
   * - token - the token for the owner/creator of the story (only a story's 
   *   creator/owner can delete it)
   * - story ID of the story to be deleted
   *
   * Returns the new Story instance
   */
	static async deleteStory(user, storyId) {
		const response = await axios({
			url    : `${BASE_URL}/stories/${storyId}`,
			method : 'DELETE',
			data   : { token: user.loginToken }
		});

		let { story } = response.data;
		return new Story({
			author    : story.author,
			createdAt : story.createdAt,
			storyId   : story.storyId,
			title     : story.title,
			url       : story.url,
			username  : story.username
		});
	}
}

/* ****************************************************************************
-------------------------------- User class -----------------------------------
**************************************************************************** */

/** User: a user in the system (only used to represent the current user) */
class User {
	/** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */
	constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
		this.username = username;
		this.name = name;
		this.createdAt = createdAt;

		// instantiate Story instances for the user's favorites and ownStories
		this.favorites = favorites.map(s => new Story(s));
		this.ownStories = ownStories.map(s => new Story(s));

		// store the login token on the user so it's easy to find for API calls.
		this.loginToken = token;
  }
  // __________________________________________________________________________

	/** Sends data to API to add or remote a story favorite from a user. 
   * - will use POST as method to add a favoite
   * - will use DELETE as method to remove a favorite
   * 
   * Returns an array of the user's updated favorite story objects.
  */
	static async favoriteStory(user, storyId, addDelete) {
		let apiMethod;
		addDelete === 'add' ? (apiMethod = 'POST') : (apiMethod = 'DELETE');

		const response = await axios({
			url    : `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
			method : `${apiMethod}`,
			data   : { token: user.loginToken }
		});

		return response.data.user.favorites;
  }
  // __________________________________________________________________________

	/** Register new user in API, make User instance & return it.
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */
	static async signup(username, password, name) {
		const response = await axios({
			url    : `${BASE_URL}/signup`,
			method : 'POST',
			data   : { user: { username, password, name } }
		});

		let { user } = response.data;
		return new User(
			{
				username   : user.username,
				name       : user.name,
				createdAt  : user.createdAt,
				favorites  : user.favorites,
				ownStories : user.stories
			},
			response.data.token
		);
  }
  // __________________________________________________________________________

	/** Login in user with API, make User instance & return it.
   * - username: an existing user's username
   * - password: an existing user's password
   */
	static async login(username, password) {
		const response = await axios({
			url    : `${BASE_URL}/login`,
			method : 'POST',
			data   : { user: { username, password } }
		});

		let { user } = response.data;
		return new User(
			{
				username   : user.username,
				name       : user.name,
				createdAt  : user.createdAt,
				favorites  : user.favorites,
				ownStories : user.stories
			},
			response.data.token
		);
  }
  // __________________________________________________________________________

	/** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
	static async loginViaStoredCredentials(token, username) {
		try {
			const response = await axios({
				url    : `${BASE_URL}/users/${username}`,
				method : 'GET',
				params : { token }
			});

			let { user } = response.data;
			return new User(
				{
					username   : user.username,
					name       : user.name,
					createdAt  : user.createdAt,
					favorites  : user.favorites,
					ownStories : user.stories
				},
				token
			);
		} catch (err) {
			console.error('loginViaStoredCredentials failed', err);
			return null;
		}
	}
}
