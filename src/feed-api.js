var _ = require('lodash');

var Constants = require('./constants');

module.exports = function(userId) {
  return fetch(Constants.server + 'story/getUserLiveFeed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userId
    })
  })
  .then((response) => response.json())
  .then((json) => {
    return {
      result: json
    };
  })
  .catch((error) => {
    return {
      error
    }
  });
}
