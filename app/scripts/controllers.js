'use strict';

/* Controllers */

angular.module('probytes.controllers', [])
  .controller('MainCtrl', function($scope, trafficData) {
    $scope.traffic = trafficData.get();
    $scope.traffic.then(function(data) {
      $scope.trafficByMonth = data.byMonth;
    });
  })
  .controller('YearlyCtrl', function($scope, $routeParams, trafficData) {
    $scope.year = $routeParams.year;
    console.log('YearlyCtrl');
  })
  .controller('MonthlyCtrl', function($scope, $routeParams, trafficData) {
    $scope.year = $routeParams.year;
    $scope.month = $routeParams.month;
    console.log('MonthlyCtrl');
  });
