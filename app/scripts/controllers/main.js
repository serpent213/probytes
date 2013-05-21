'use strict';

angular.module('properbytesApp') // , ['ui.bootstrap'])
  .controller('MainCtrl', function($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
    ];
  })
  .directive('navbar', function() {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      // link: function() { console.log('navigation link') },
    };
  });
