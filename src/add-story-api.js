var _ = require('lodash');

var Constants = require('./constants');

module.exports = function(userId, title, videoLink, duration) {
  return fetch(Constants.server + 'user/addLiveStory/' + userId, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      storyType: 'MULTIMEDIA',
      videoDuration: duration,
      imagesActions: [],
      images: [],
      videoLink: videoLink,
      categories: [],
      creatorType: 'user',
    })
  })
  .then((response) => {
    console.log('add api: '+ JSON.stringify(response));
    return {
      result: response
    }
  })
  .catch((error) => {
    return {
      error
    }
  });
}
