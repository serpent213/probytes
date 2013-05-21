'use strict';

/* Controllers */

angular.module('probytes.controllers', [])
  .controller('MainCtrl', function($scope, trafficData) {
    trafficData.get().then(function(data) {
      $scope.traffic = data;
    });
  })
  .controller('YearlyCtrl', function($scope, $routeParams, trafficData) {
    $scope.year = $routeParams.year;
  })
  .controller('MonthlyCtrl', function($scope, $routeParams, trafficData) {
    $scope.year = $routeParams.year;
    $scope.month = $routeParams.month;
  });
