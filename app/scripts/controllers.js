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
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) return;

      var tempDate = new Date($scope.year, $scope.month - 1, 1);
      tempDate.setMonth(tempDate.getMonth() - 1);
      var prevMonth = tempDate.getMonth() + 1,
          prevYear = tempDate.getFullYear();
      tempDate = new Date($scope.year, $scope.month - 1, 1);
      tempDate.setMonth(tempDate.getMonth() + 1);
      var nextMonth = tempDate.getMonth() + 1,
          nextYear = tempDate.getFullYear();

      if ($scope.traffic.byMonth[prevYear][prevMonth]) {
        $scope.prevLink = {
          active: true,
          month: prevMonth,
          year: prevYear,
        };
      }

      if ($scope.traffic.byMonth[nextYear][nextMonth]) {
        $scope.nextLink = {
          active: true,
          month: nextMonth,
          year: nextYear,
        };
      }
    });
  });
