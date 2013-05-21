'use strict';

angular.module('properbytesApp') // , ['ui.bootstrap'])
  .controller('MainCtrl', function($scope, $http) {
    $http.get('data.json').success(function(data) {
      $scope.traffic = data;
      console.log('loaded ' + $scope.traffic.length + ' records');
    });
  })
  .directive('navbar', function() {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      // link: function() { console.log('navigation link') },
    };
  });
