'use strict';

/* Services */

angular.module('probytes.services', [])
  .service('trafficData', function($http, $q) {
    this.get = function() {
      var deferred = $q.defer();
      $http.get('data.json')
        .success(function(data) {
          var transformed = { raw: data };

          /*
          raw_from_server: [
            {"hostname":"teralink.net","month":5,"year":2013,"requests":515,"bytes":8288738},
            {"hostname":"schlag13.de","month":5,"year":2013,"requests":1,"bytes":355},
            {"hostname":"213streams.com","month":5,"year":2013,"requests":2,"bytes":1038},
            {"hostname":"213things.com","month":5,"year":2013,"requests":3,"bytes":1686},
            {"hostname":"213tec.com","month":5,"year":2013,"requests":7,"bytes":7485},
            {"hostname":"teralink.net","month":5,"year":2012,"requests":515,"bytes":8288738},
            {"hostname":"teralink.net","month":6,"year":2012,"requests":515,"bytes":8288738},
            {"hostname":"schlag13.de","month":5,"year":2012,"requests":1,"bytes":355},
          ]
          */

          var byYearRaw = _(data).groupBy('year');

          var byYear = {};
          for (var year in byYearRaw) {
            byYear[year] = _(_(byYearRaw[year]).reduce(function(memo, monthly) {
              if (!memo.hasOwnProperty(monthly.hostname)) memo[monthly.hostname] = {hostname: monthly.hostname, requests: 0, bytes: 0};
              memo[monthly.hostname]['requests'] += monthly.requests;
              memo[monthly.hostname]['bytes'] += monthly.bytes;
              return memo;
            }, {})).map(_.identity);
          }
          transformed.byYear = byYear;

          /*
          by_year: {
            2012: [
              {"hostname":"teralink.net","requests":515,"bytes":8288738},
              {"hostname":"schlag13.de","requests":1,"bytes":355},
            ],
            2013: [
              {"hostname":"teralink.net","requests":515,"bytes":8288738},
              {"hostname":"schlag13.de","requests":1,"bytes":355},
              {"hostname":"213streams.com","requests":2,"bytes":1038},
              {"hostname":"213things.com","requests":3,"bytes":1686},
              {"hostname":"213tec.com","requests":7,"bytes":7485},
            ],
          }
          */

          var byMonth = {};
          for (var year in byYearRaw) byMonth[year] = _(byYearRaw[year]).groupBy('month');
          transformed.byMonth = byMonth;

          /*
          by_month: {
            2012: {
              10: [
                {"hostname":"teralink.net","year":2012,"month":10,"requests":515,"bytes":8288738},
                {"hostname":"schlag13.de","year":2012,"month":10,"requests":1,"bytes":355},
              ],
              11: [
                {"hostname":"teralink.net","year":2012,"month":11,"requests":322,"bytes":47476565},
                {"hostname":"schlag13.de","year":2012,"month":11,"requests":26,"bytes":27273},
              ],
              12: [
                {"hostname":"teralink.net","year":2012,"month":12,"requests":515,"bytes":8288738},
                {"hostname":"schlag13.de","year":2012,"month":12,"requests":1,"bytes":355},
              ],
            },
            2013: {
              1: [
                {"hostname":"teralink.net","year":2013,"month":1,"requests":515,"bytes":8288738},
                {"hostname":"schlag13.de","year":2013,"month":1,"requests":1,"bytes":355},
                {"hostname":"213things.com","year":2013,"month":1,"requests":3,"bytes":1686},
                {"hostname":"213tec.com","year":2013,"month":1,"requests":7,"bytes":7485},
              ],
              2: [
                {"hostname":"teralink.net","year":2013,"month":2,"requests":515,"bytes":8288738},
                {"hostname":"schlag13.de","year":2013,"month":2,"requests":1,"bytes":355},
                {"hostname":"213things.com","year":2013,"month":2,"requests":3,"bytes":1686},
                {"hostname":"213tec.com","year":2013,"month":2,"requests":7,"bytes":7485},
              ],
            }
          }
          */

          deferred.resolve(transformed);
        })
        .error(function() {
          deferred.reject();
        });
      return deferred.promise;
    };
  });
