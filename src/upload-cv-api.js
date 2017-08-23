var _ = require('lodash');
var Constants = require('./constants');

module.exports = function(userId, email, positionId) {
  return fetch(Constants.server + 'user/sendCvRequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      userId: userId,
      openPositionId: positionId
    })
  })
  .then((response) => response.json())
    .then((json) => {
      return {
        response: json,
      };
  })
  .catch((error) => {
    return {
      error
    }
  });
}
