var _ = require('lodash');
var Constants = require('./constants');

module.exports = function(userId) {
  return fetch(Constants.server + 'user/anonymousRegister', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userId,
      password: '0d9b1a55d905d56223ad29fdb1f2faf7'
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
