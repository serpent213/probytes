'use strict';

/* Services */

angular.module('probytes.services', [])
  .service('trafficData', function($http, $q) {
    this.get = function() {
      var deferred = $q.defer();
      $http.get('data.json')
        .success(function(data) {
          var transformed = {
            raw:  data.traffic,
            meta: {
              serverName:      data.serverName,
              updateInterval:  data.updateInterval,
              exportTimestamp: data.exportTimestamp
            }
          };

          /*
          rawFromServer: [
            {"hostname":"host1.net","month":5,"year":2013,"requests":515,"bytes":8288738},
            {"hostname":"host2.de","month":5,"year":2013,"requests":1,"bytes":355},
            {"hostname":"host3.com","month":5,"year":2013,"requests":2,"bytes":1038},
            {"hostname":"host4.com","month":5,"year":2013,"requests":3,"bytes":1686},
            {"hostname":"host5.com","month":5,"year":2013,"requests":7,"bytes":7485},
            {"hostname":"host1.net","month":5,"year":2012,"requests":515,"bytes":8288738},
            {"hostname":"host1.net","month":6,"year":2012,"requests":515,"bytes":8288738},
            {"hostname":"host2.de","month":5,"year":2012,"requests":1,"bytes":355},
          ]
          */

          var byYearRaw = _(data.traffic).groupBy('year');

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
          byYear: {
            2012: [
              {"hostname":"host1.net","requests":515,"bytes":8288738},
              {"hostname":"host2.de","requests":1,"bytes":355},
            ],
            2013: [
              {"hostname":"host1.net","requests":515,"bytes":8288738},
              {"hostname":"host2.de","requests":1,"bytes":355},
              {"hostname":"host3.com","requests":2,"bytes":1038},
              {"hostname":"host4.com","requests":3,"bytes":1686},
              {"hostname":"host5.com","requests":7,"bytes":7485},
            ],
          }
          */

          var byMonth = {};
          for (var year in byYearRaw) byMonth[year] = _(byYearRaw[year]).groupBy('month');
          transformed.byMonth = byMonth;

          /*
          byMonth: {
            2012: {
              10: [
                {"hostname":"host1.net","year":2012,"month":10,"requests":515,"bytes":8288738},
                {"hostname":"host2.de","year":2012,"month":10,"requests":1,"bytes":355},
              ],
              11: [
                {"hostname":"host1.net","year":2012,"month":11,"requests":322,"bytes":47476565},
                {"hostname":"host2.de","year":2012,"month":11,"requests":26,"bytes":27273},
              ],
              12: [
                {"hostname":"host1.net","year":2012,"month":12,"requests":515,"bytes":8288738},
                {"hostname":"host2.de","year":2012,"month":12,"requests":1,"bytes":355},
              ],
            },
            2013: {
              1: [
                {"hostname":"host1.net","year":2013,"month":1,"requests":515,"bytes":8288738},
                {"hostname":"host2.de","year":2013,"month":1,"requests":1,"bytes":355},
                {"hostname":"host4.com","year":2013,"month":1,"requests":3,"bytes":1686},
                {"hostname":"host5.com","year":2013,"month":1,"requests":7,"bytes":7485},
              ],
              2: [
                {"hostname":"host1.net","year":2013,"month":2,"requests":515,"bytes":8288738},
                {"hostname":"host2.de","year":2013,"month":2,"requests":1,"bytes":355},
                {"hostname":"host4.com","year":2013,"month":2,"requests":3,"bytes":1686},
                {"hostname":"host5.com","year":2013,"month":2,"requests":7,"bytes":7485},
              ],
            }
          }
          */

          transformed.byHostname = _(data.traffic).groupBy('hostname');
          transformed.hostnames = _(Object.keys(transformed.byHostname).sort()).uniq(true);

          /*
          byHostname: {
            "host1.net": [
              {"hostname":"host1.net","year":2013,"month":1,"requests":515,"bytes":8288738},
              {"hostname":"host1.net","year":2013,"month":2,"requests":515,"bytes":8288738},
            ],
            "host2.de": [
              {"hostname":"host2.de","year":2013,"month":1,"requests":1,"bytes":355},
              {"hostname":"host2.de","year":2013,"month":2,"requests":1,"bytes":355},
            ],
            "host4.com": [
              {"hostname":"host4.com","year":2013,"month":1,"requests":3,"bytes":1686},
              {"hostname":"host4.com","year":2013,"month":2,"requests":3,"bytes":1686},
            ],
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
