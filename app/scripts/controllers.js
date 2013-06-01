'use strict';

/* Controllers */

angular.module('probytes.controllers', ['probytes.datetime'])
  .controller('MainCtrl', function($scope, trafficData) {
    trafficData.get().then(function(data) {
      $scope.traffic = data;
      document.title += ' [' + data.meta.serverName + ']';
    });
  })
  .controller('YearlyCtrl', function($scope, $routeParams, trafficData, DateHelper) {
    $scope.year = +$routeParams.year;
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) return;

      // data scope

      $scope.yearlyTraffic = $scope.traffic.byYear[$scope.year];

      // prev/next links

      var prevYear = $scope.year - 1,
          nextYear = $scope.year + 1;

      if ($scope.traffic.byYear[prevYear]) {
        $scope.prevLink = {
          active: true,
          year: prevYear,
        };
      }

      if ($scope.traffic.byYear[nextYear]) {
        $scope.nextLink = {
          active: true,
          year: nextYear,
        };
      }

      // totals

      $scope.yearlySeconds = DateHelper.elapsedSecondsInYear($scope.year);
    });
  })
  .controller('MonthlyCtrl', function($scope, $routeParams, trafficData, DateHelper) {
    $scope.year = +$routeParams.year;
    $scope.month = +$routeParams.month;
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) return;

      // data scope

      $scope.monthlyTraffic = $scope.traffic.byMonth[$scope.year][$scope.month];

      // prev/next links

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

      // totals

      $scope.monthlySeconds = DateHelper.elapsedSecondsInMonth($scope.year, $scope.month);
    });
  })
  .controller('HostCtrl', function($scope, $routeParams, $filter, trafficData) {
    $scope.hostname = $routeParams.hostname;
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) return;

      // data scope

      $scope.hostTraffic = _($scope.traffic.byHostname[$scope.hostname]).map(function(d) {
        return _(_(d).clone()).extend({datetext: $filter('monthName')(d.month) + ' ' + d.year});
      });

      // prev/next links

      var hostIndex = $scope.traffic.hostnames.indexOf($scope.hostname);

      if (hostIndex > 0) {
        $scope.prevLink = {
          active: true,
          hostname: $scope.traffic.hostnames[hostIndex - 1],
        };
      }

      if (hostIndex < $scope.traffic.hostnames.length - 1) {
        $scope.nextLink = {
          active: true,
          hostname: $scope.traffic.hostnames[hostIndex + 1],
        };
      }

      // totals

      function cmp(a, b) {
        if (a > b) return +1;
        if (a < b) return -1;
        return 0;
      }

      var earliestRecord = $scope.hostTraffic.
            sort(function(a, b) { return cmp(a.year, b.year) || cmp(a.month, b.month); })[0],
          hostStartDate = new Date(earliestRecord.year, earliestRecord.month - 1, 1);

      $scope.hostSeconds = (new Date() - hostStartDate) / 1000;
    });
  });
