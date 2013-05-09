# goodlogx configuration file

{
  # FYI
  :server_name => 'teralink.net',

  # expected nginx config:
  #   log_format traffic '$host $request_length $bytes_sent';
  #   access_log /var/log/nginx-traffic.log traffic;
  :logfiles => ['/var/log/nginx-traffic.log'],

  # hostname translation
  # all entries are evaluated in order
  :hostname_mapping => [
    [/^www\.(.*)/, '\1'], # strip www prefix
  ],

  # frontend target directory
  :frontend_dir => '/var/www/teralink.net/stats',

  # createuser -P traffic
  # createdb -E UTF8 -O traffic traffic
  #
  # see http://deveiate.org/code/pg/PG/Connection.html#method-c-new for keys
  :postgresql => {:host => 'db.teralink.net', :dbname => 'traffic', :user => 'traffic', :password => 'dev'},

  # seconds between db update
  # recommended range: 10..3600
  :update_interval => 10,
}
