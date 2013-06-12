'use strict';

/* Controllers */

/* global cmp */
angular.module('probytes.controllers', ['probytes.datetime'])
  .controller('MainCtrl', function($scope, $location, trafficData) {
    trafficData.get().then(function(data) {
      $scope.traffic = data;
      document.title += ' [' + data.meta.serverName + ']';
      if ($scope.traffic.raw.length === 0) { $location.path('/nodata'); }
    }, function() { // promise rejected
      $location.path('/nodata');
    });
  })
  .controller('NoDataCtrl', function($scope, $location) {
    $scope.$watch('traffic', function() {
      if (!$scope.traffic) { return; }
      if ($scope.traffic.raw.length > 0) { $location.path('/'); }
    });
  })
  .controller('YearlyCtrl', function($scope, $routeParams, DateHelper) {
    $scope.year = +$routeParams.year;
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) { return; }

      // data scope

      $scope.yearlyTraffic = _($scope.traffic.byYear[$scope.year]).
        sortBy(function(d) { return -d.bytes; });

      // prev/next links

      var prevYear = $scope.year - 1,
          nextYear = $scope.year + 1;

      if ($scope.traffic.byYear[prevYear]) {
        $scope.prevLink = {year: prevYear};
      }

      if ($scope.traffic.byYear[nextYear]) {
        $scope.nextLink = {year: nextYear};
      }

      // totals

      $scope.yearlySeconds = DateHelper.elapsedSecondsInYear($scope.year);
    });
  })
  .controller('MonthlyCtrl', function($scope, $routeParams, DateHelper) {
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) { return; }

      if ($routeParams.year && $routeParams.month) {
        $scope.year  = +$routeParams.year;
        $scope.month = +$routeParams.month;
      } else {
        // default route
        var latestMonth = $scope.traffic.raw.sort(function (a, b) { return cmp(b.year, a.year) || cmp(b.month, a.month); })[0];
        $scope.year  = latestMonth.year;
        $scope.month = latestMonth.month;
      }

      // data scope

      $scope.monthlyTraffic = _($scope.traffic.byMonth[$scope.year][$scope.month]).
        sortBy(function(d) { return -d.bytes; });

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
        $scope.prevLink = {month: prevMonth, year: prevYear};
      }

      if ($scope.traffic.byMonth[nextYear][nextMonth]) {
        $scope.nextLink = {month: nextMonth, year: nextYear};
      }

      // totals

      $scope.monthlySeconds = DateHelper.elapsedSecondsInMonth($scope.year, $scope.month);
    });
  })
  .controller('HostCtrl', function($scope, $routeParams, $filter) {
    $scope.hostname = $routeParams.hostname;
    $scope.$watch('traffic', function() {
      $scope.prevLink = null;
      $scope.nextLink = null;
      if (!$scope.traffic) { return; }

      // data scope

      $scope.hostTraffic = _($scope.traffic.byHostname[$scope.hostname]).map(function(d) {
          return _(_(d).clone()).extend({datetext: $filter('monthName')(d.month) + ' ' + d.year});
        }).
        sort(function(a, b) { return cmp(b.year, a.year) || cmp(b.month, a.month); }); // sort descending

      // prev/next links

      var hostIndex = $scope.traffic.hostnames.indexOf($scope.hostname);

      if (hostIndex > 0) {
        $scope.prevLink = {hostname: $scope.traffic.hostnames[hostIndex - 1]};
      }

      if (hostIndex < $scope.traffic.hostnames.length - 1) {
        $scope.nextLink = {hostname: $scope.traffic.hostnames[hostIndex + 1]};
      }

      // totals

      var earliestRecord = $scope.hostTraffic[$scope.hostTraffic.length - 1],
          hostStartDate = new Date(earliestRecord.year, earliestRecord.month - 1, 1);

      $scope.hostSeconds = (new Date() - hostStartDate) / 1000;
    });
  });
