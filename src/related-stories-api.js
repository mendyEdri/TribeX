var _ = require('lodash');
var Constants = require('./constants');

module.exports = function(companyId) {
  return fetch(Constants.server + 'story/getRelatedStoriesByCompanyId', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyId: companyId,
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
