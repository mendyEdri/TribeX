var _ = require('lodash');

var Constants = require('./constants');

module.exports = function(companyId) {
  return fetch(Constants.server + 'positionCompany/getAllOpenPositionsByCompany/' + companyId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
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
