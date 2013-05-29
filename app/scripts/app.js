'use strict';

angular.module('probytes', ['probytes.directives', 'probytes.services', 'probytes.controllers'])
  .constant('PROBYTES_VERSION', '0.3.0')
  .config(function ($routeProvider) {
    var localDate = new Date(),
        localYear = localDate.getFullYear(),
        localMonth = localDate.getMonth() + 1;

    $routeProvider
      .when('/yearly/:year', {
        templateUrl: 'views/yearly.html',
        controller: 'YearlyCtrl'
      })
      .when('/monthly/:year/:month', {
        templateUrl: 'views/monthly.html',
        controller: 'MonthlyCtrl'
      })
      .otherwise({
        redirectTo: '/monthly/' + localYear + '/' + localMonth
      });
  })
  .run(function($rootScope, $window) {
    $rootScope.windowWidth = $window.outerWidth;
    angular.element($window).bind('resize', function() {
      $rootScope.windowWidth = $window.outerWidth;
      $rootScope.$apply('windowWidth');
    });
  });
