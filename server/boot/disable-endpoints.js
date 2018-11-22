'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  var endpoint_disabler = require('loopback-disable-endpoints');
  // endpoint_disabler.enableReadOnly(server.models.Product);
  // endpoint_disabler.disableRelatedModels(server.models.Product);
};
