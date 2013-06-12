'use strict';

angular.module('probytes', ['probytes.directives', 'probytes.services', 'probytes.controllers'])
  .constant('PROBYTES_VERSION', '0.3.0')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/yearly/:year', {
        templateUrl: 'views/yearly.html',
        controller: 'YearlyCtrl'
      })
      .when('/monthly/:year/:month', {
        templateUrl: 'views/monthly.html',
        controller: 'MonthlyCtrl'
      })
      .when('/host/:hostname', {
        templateUrl: 'views/host.html',
        controller: 'HostCtrl'
      })
      .otherwise({
        templateUrl: 'views/monthly.html',
        controller: 'MonthlyCtrl'
      });
  })
  .run(function($rootScope, $window) {
    $rootScope.windowWidth = $window.outerWidth;
    angular.element($window).bind('resize', function() {
      $rootScope.windowWidth = $window.outerWidth;
      $rootScope.$apply('windowWidth');
    });
  });
