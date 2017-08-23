var _ = require('lodash');
var Constants = require('./constants');

module.exports = function(userId, email) {
  return fetch(Constants.server + 'user/validateAnonymousCompany', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userId,
      companyEmail: email
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
