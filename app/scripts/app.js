'use strict';

angular.module('probytes', ['probytes.directives', 'probytes.services', 'probytes.controllers'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
