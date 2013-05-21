'use strict';

angular.module('probytes', ['probytes.directives', 'probytes.services', 'probytes.controllers'])
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
  });
