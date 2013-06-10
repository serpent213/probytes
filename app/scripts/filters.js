'use strict';

/* Filters */

angular.module('probytes.filters', [])
  .factory('Prefix', function() {
    var pfx = {
      binaryPrefixFactory: function(value) {
        if (Array.isArray(value)) {
          value = Math.max.apply(null, value.map(function(d) { return Math.abs(d); }));
        } else {
          value = Math.abs(value);
        }

        var unit    = Math.min(8, Math.floor(Math.log(value) / Math.log(2) / 10)),
            prefix  = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][unit],
            divisor = Math.pow(2, unit * 10);

        return function(r) {
          return [r / divisor, prefix];
        };
      },
      binaryPrefix: function(value) {
        return pfx.binaryPrefixFactory(value)(value);
      },
      decimalPrefixFactory: function(value) {
        if (Array.isArray(value)) {
          value = Math.max.apply(null, value.map(function(d) { return Math.abs(d); }));
        } else {
          value = Math.abs(value);
        }

        var unit    = Math.min(8, Math.floor(Math.log(value) / Math.log(10) / 3 + 0.001)), // add something to hide rounding errors
            prefix  = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'][unit],
            divisor = Math.pow(10, unit * 3);

        return function(r) {
          return [r / divisor, prefix];
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
