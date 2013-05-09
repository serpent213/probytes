#!/usr/bin/env ruby19

# goodlog traffic monitor

require 'eventmachine'
require 'eventmachine-tail'
require 'haml'
require 'fileutils'
require 'json'
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
                  bytes INTEGER,
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

  def update_stats
    puts "update stats"
    if not @host_traffic.empty?
      time = Time.now
      month, year = time.month, time.year
      @host_traffic.keys.each do |hostname|
        result = @db.exec("UPDATE traffic SET requests = requests + #{@host_traffic[hostname][:requests]}, bytes = bytes + #{@host_traffic[hostname][:bytes]} " +
                          "WHERE hostname = '#{hostname}' AND month = #{month} AND year = #{year}")
        if result.cmd_tuples == 0
          @db.exec("INSERT INTO traffic (hostname, month, year, requests, bytes) VALUES ('#{hostname}', #{month}, #{year}, " +
                   "#{@host_traffic[hostname][:requests]}, #{@host_traffic[hostname][:bytes]})")
        end
      end
      update_frontend_data
      @host_traffic = {}
    end
  end

  def update_frontend_static
    puts "update frontend static"
    index = Haml::Engine.new(File.read('index.haml'))
    File.open(@frontend_dir + 'index.html', 'w') {|f| f.write index.render }
    FileUtils.cp_r('js', @frontend_dir)
    FileUtils.cp_r('css', @frontend_dir)
    FileUtils.cp_r('img', @frontend_dir)
  end

  def update_frontend_data
    puts "update frontend data"
    result = @db.exec('SELECT * FROM traffic')
    File.open(@frontend_dir + 'data.js', 'w') {|f| f.write 'traffic = [' + result.map {|r| r.to_json}.join(',') + ']' }
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
      @traffic.increment_host(hostname, bytes_total)
    end
  end
end

def main(args)
  EM.run do
    traffic = Traffic.new
    traffic.config[:logfiles].each do |path|
      EM::file_tail(path, Reader, traffic)
    end
    EM.add_periodic_timer(traffic.config[:update_interval]) do
      traffic.update_stats
    end
  end
end # def main

exit(main(ARGV))
