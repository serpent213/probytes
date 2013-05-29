'use strict';

/* Filters */

angular.module('probytes.filters', [])
  .filter('monthName', function() {
    return function(n) {
      return ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][n - 1];
    };
  });
