#!/usr/bin/env ruby19
#
# Simple 'tail -f' example.
# Usage example:
#   tail.rb /var/log/messages

require "rubygems"
require "eventmachine"
require "eventmachine-tail"

class Traffic
  attr_accessor :host_bytes

  def initialize
    @host_bytes = {}
  end

  def increment_host(hostname, bytes)
    @host_bytes[hostname] ||= 0
    @host_bytes[hostname] += bytes
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
      puts "host_bytes: #{@traffic.host_bytes[hostname]}"
    end
  end
end

def main(args)
  if args.length == 0
    puts "Usage: #{$0} <path> [path2] [...]"
    return 1
  end

  EventMachine.run do
    traffic = Traffic.new
    args.each do |path|
      EventMachine::file_tail(path, Reader, traffic)
    end
  end
end # def main

exit(main(ARGV))
