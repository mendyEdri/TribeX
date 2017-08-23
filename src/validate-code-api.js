var _ = require('lodash');

var Constants = require('./constants');

module.exports = function(userId, code) {
  return fetch(Constants.server + 'user/companyAnonymousEmailValidation', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: code,
      email: userId
    })
  })
  .then((response) => {
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
