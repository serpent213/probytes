'use strict';

/* Date and time travel helpers
 * NOTE: month is always in [1..12]
 */

angular.module('probytes.datetime', [])
  .factory('DateHelper', function() {
    var dh = {
      secondsInMonth: function(year, month) {
        return (Date.UTC(year, month, 1) - Date.UTC(year, month - 1, 1)) / 1000;
      },
      elapsedSecondsInMonth: function(year, month) {
        var localDate = new Date();
        // running/future month?
        if (year > localDate.getFullYear() || (year === localDate.getFullYear() && month >= localDate.getMonth() + 1)) {
          return Math.max(0, Math.ceil((localDate - new Date(year, month - 1, 1)) / 1000));
        } else {
          return dh.secondsInMonth(year, month);
        }
      },
      secondsInYear: function(year) {
        return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 1000;
      },
      elapsedSecondsInYear: function(year) {
        var localDate = new Date();
        // running/future year?
        if (year >= localDate.getFullYear()) {
          return Math.max(0, Math.ceil((localDate - new Date(year, 0, 1)) / 1000));
        } else {
          return dh.secondsInYear(year);
        }
      }
    };

    return dh;
  });
