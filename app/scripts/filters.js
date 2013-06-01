'use strict';

/* Filters */

angular.module('probytes.filters', [])
  .factory('Prefix', function() {
    var pfx = {
      binaryPrefixFactory: function(value) {
        var units = [
          {prefix: '', divisor: 1},
          {prefix: 'Ki', divisor: Math.pow(2, 10)},
          {prefix: 'Mi', divisor: Math.pow(2, 20)},
          {prefix: 'Gi', divisor: Math.pow(2, 30)},
          {prefix: 'Ti', divisor: Math.pow(2, 40)},
          {prefix: 'Pi', divisor: Math.pow(2, 50)},
          {prefix: 'Ei', divisor: Math.pow(2, 60)},
          {prefix: 'Zi', divisor: Math.pow(2, 70)},
          {prefix: 'Yi', divisor: Math.pow(2, 80)},
        ];

        if (Array.isArray(value)) {
          value = Math.max.apply(null, value.map(function(d) { return Math.abs(d) }));
        } else {
          value = Math.abs(value);
        }

        var unit = units[Math.min(8, Math.floor(Math.log(value) / Math.log(2) / 10))];

        return function(r) {
          return [r / unit.divisor, unit.prefix];
        };
      },
      binaryPrefix: function(value) {
        return pfx.binaryPrefixFactory(value)(value);
      },
      decimalPrefixFactory: function(value) {
        var units = [
          {prefix: '', divisor: 1},
          {prefix: 'k', divisor: Math.pow(10, 3)},
          {prefix: 'M', divisor: Math.pow(10, 6)},
          {prefix: 'G', divisor: Math.pow(10, 9)},
          {prefix: 'T', divisor: Math.pow(10, 12)},
          {prefix: 'P', divisor: Math.pow(10, 15)},
          {prefix: 'E', divisor: Math.pow(10, 18)},
          {prefix: 'Z', divisor: Math.pow(10, 21)},
          {prefix: 'Y', divisor: Math.pow(10, 24)},
        ];

        if (Array.isArray(value)) {
          value = Math.max.apply(null, value.map(function(d) { return Math.abs(d) }));
        } else {
          value = Math.abs(value);
        }

        var unit = units[Math.min(8, Math.floor(Math.log(value) / Math.log(10) / 3 + 0.001))];

        return function(r) {
          return [r / unit.divisor, unit.prefix];
        };
      },
      decimalPrefix: function(value) {
        return pfx.decimalPrefixFactory(value)(value);
      },
    };

    return pfx;
  })
  .filter('binaryPrefix', function(Prefix, $filter) {
    return function(r, precision) {
      if (r === undefined) { return ''; }
      var p = Prefix.binaryPrefix(r);
      return $filter('number')(p[0], precision) + ' ' + p[1];
    };
  })
  .filter('decimalPrefix', function(Prefix, $filter) {
    return function(r, precision) {
      if (r === undefined) { return ''; }
      var p = Prefix.decimalPrefix(r);
      return $filter('number')(p[0], precision) + ' ' + p[1];
    };
  })
  .filter('monthName', function() {
    return function(n) {
      if (n === undefined) { return ''; }
      return ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][n - 1];
    };
  });
