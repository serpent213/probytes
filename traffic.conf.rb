# goodlogx configuration file

{
  # expected nginx config:
  #   log_format traffic '$host $request_length $bytes_sent';
  #   access_log /var/log/nginx-traffic.log traffic;
  :logfiles => ['/var/log/nginx-traffic.log'],

  # createuser -P traffic
  # createdb -E UTF8 -O traffic traffic
  #
  # see http://deveiate.org/code/pg/PG/Connection.html#method-c-new for keys
  :postgresql => {:host => 'db.teralink.net', :dbname => 'traffic', :user => 'traffic', :password => 'dev'},

  # seconds between db update
  :update_interval => 10,
}
