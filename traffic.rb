#!/usr/bin/env ruby19

# goodlog traffic monitor

require 'eventmachine'
require 'eventmachine-tail'
require 'haml'
require 'fileutils'
require 'json'
require 'optparse'
require 'pg'

class Traffic
  attr_reader :config

  def initialize
    @host_traffic = {}
    @config = eval(File.read('traffic.conf.rb'))
    @frontend_dir = @config[:frontend_dir]
    @frontend_dir += '/' unless @frontend_dir.match(/\/$/)
    puts "config: #{@config}"
    @db = PG::Connection.open(@config[:postgresql])
    begin
      @db.exec('CREATE TABLE traffic (
                  hostname VARCHAR(200),
                  month INTEGER,
                  year INTEGER,
                  requests INTEGER,
                  bytes BIGINT,
                  PRIMARY KEY (hostname, month, year)
                )')
    rescue PG::Error => e
      # table does exist
    end
    update_frontend_static
    update_frontend_data
  end

  def increment_host(hostname, bytes)
    @host_traffic[hostname] ||= {:requests => 0, :bytes => 0}
    @host_traffic[hostname][:requests] += 1
    @host_traffic[hostname][:bytes] += bytes
  end

  def update_stats(time = Time.now)
    puts "update stats"
    if not @host_traffic.empty?
      # time = Time.now
      month, year = time.month, time.year
      @host_traffic.keys.each do |hostname|
        puts "#{hostname}: #{@host_traffic[hostname][:requests]} reqs / #{@host_traffic[hostname][:bytes]} bytes"
        result = @db.exec_params('UPDATE traffic SET requests = requests + $1::int, bytes = bytes + $2::bigint ' +
                                 'WHERE hostname = $3 AND month = $4::int AND year = $5::int',
                                 [@host_traffic[hostname][:requests], @host_traffic[hostname][:bytes], hostname, month, year])
        if result.cmd_tuples == 0
          @db.exec_params('INSERT INTO traffic (hostname, month, year, requests, bytes) VALUES ($1, $2::int, $3::int, $4::int, $5::bigint)',
                          [hostname, month, year, @host_traffic[hostname][:requests], @host_traffic[hostname][:bytes]])
        end
      end
      update_frontend_data
      @host_traffic = {}
    end
  end

  def update_frontend_static
    puts "update frontend static"
    index = Haml::Engine.new(File.read('index.haml'))
    File.open(@frontend_dir + 'index.html', 'w') {|f| f.write index.render(self) }
    FileUtils.cp_r('js', @frontend_dir)
    FileUtils.cp_r('css', @frontend_dir)
    FileUtils.cp_r('img', @frontend_dir)
  end

  def update_frontend_data
    puts "update frontend data"
    result = @db.exec('SELECT * FROM traffic')
    def string_to_int(r)
      {:hostname => r['hostname'],
       :month    => r['month'].to_i,
       :year     => r['year'].to_i,
       :requests => r['requests'].to_i,
       :bytes    => r['bytes'].to_i}
    end
    File.open(@frontend_dir + 'data.js', 'w') {|f| f.write 'GoodLog = {}; GoodLog.trafficRaw = [' + result.map {|r| string_to_int(r).to_json}.join(',') + ']' }
  end

  def make_up_fake
    hostwords = %w{amet consetetur diam dolor eirmod elitr et invidunt ipsum labore lorem magna nonumy sadipscing sed sit tempor ut}
    tlds = %w{.com .net .org .de}
    product = hostwords.product(tlds)
    hostnames = product.sample(product.size / 2).map(&:join)

    def inject_month(hostnames, month, year)
      fake_time = Time.local(year, month)
      hostnames.each do |hostname|
        increment_host(hostname, (rand()**2.3 * 23 * 2**30).floor)
      end
      update_stats(fake_time)
    end

    time = Time.now
    year = time.year - 2
    (3 + rand(7) .. 12).each {|month| inject_month(hostnames, month, year) }
    year = time.year - 1
    (1 .. 12).each {|month| inject_month(hostnames, month, year) }
    if time.month > 1
      year = time.year
      (1 .. time.month - 1).each {|month| inject_month(hostnames, month, year) }
    end
  end
end

class Reader < EventMachine::FileTail
  def initialize(path, startpos=-1, traffic)
    super(path, startpos)
    puts "Tailing #{path}"
    @buffer = BufferedTokenizer.new
    @traffic = traffic
  end

  def receive_data(data)
    @buffer.extract(data).each do |line|
      puts "#{path}: #{line}"
      m = line.match(/(?<hostname>\S+) (?<request_bytes>\d+) (?<response_bytes>\d+)/)
      hostname = m['hostname']
      bytes_total = m['request_bytes'].to_i + m['response_bytes'].to_i
      puts "host: #{m["hostname"]} bytes: #{bytes_total}"
      @traffic.config[:hostname_mapping].each do |mapping|
        hostname.gsub!(mapping[0], mapping[1])
      end
      puts "host after mapping: #{hostname}"
      @traffic.increment_host(hostname, bytes_total)
    end
  end
end

def run
  EM.run do
    traffic = Traffic.new
    traffic.config[:logfiles].each do |path|
      EM::file_tail(path, Reader, traffic)
    end
    EM.add_periodic_timer(traffic.config[:update_interval]) do
      traffic.update_stats
    end
  end
end

options = {}

opt_parser = OptionParser.new do |opt|
  opt.banner = "Usage: traffic.rb COMMAND [OPTIONS]"
  opt.separator  ""
  opt.separator  "Commands"
  opt.separator  "     start: start monitor"
  opt.separator  "     stop: stop monitor"
  opt.separator  "     restart: restart monitor"
  opt.separator  "     fake: fill DB with fake data"
  opt.separator  ""
  opt.separator  "Options"

  # opt.on("-e", "--environment ENVIRONMENT", "which environment you want server run") do |environment|
  #   options[:environment] = environment
  # end

  opt.on("-d", "--daemon", "run as daemon") do
    options[:daemon] = true
  end

  opt.on("-h", "--help", "help") do
    puts opt_parser
  end
end

opt_parser.parse!

case ARGV[0]
when 'start'
  exit(run)
when 'stop'
  puts 'stop'
when 'restart'
  puts 'restart'
when 'fake'
  traffic = Traffic.new
  traffic.make_up_fake
else
  puts opt_parser
end
