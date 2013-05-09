#!/usr/bin/env ruby19
#
# Simple 'tail -f' example.
# Usage example:
#   tail.rb /var/log/messages

# require 'rubygems'
require 'eventmachine'
require 'eventmachine-tail'
require 'json'
require 'pg'

class Traffic
  attr_reader :config

  def initialize
    @host_traffic = {}
    @config = eval(File.open('traffic.conf.rb').read)
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
  end

  def increment_host(hostname, bytes)
    @host_traffic[hostname] ||= {:requests => 0, :bytes => 0}
    @host_traffic[hostname][:requests] += 1
    @host_traffic[hostname][:bytes] += bytes
  end

  def update
    puts "update"
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
    result = @db.exec('SELECT * FROM traffic')
    puts '[' + result.map {|r| r.to_json}.join(',') + ']'
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
      traffic.update
    end
  end
end # def main

exit(main(ARGV))
