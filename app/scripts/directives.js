'use strict';

/* Directives */

angular.module('probytes.directives', [])
  .directive('navbar', function() {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      // link: function() { console.log('navigation link') },
    };
  });
