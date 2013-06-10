# proper:bytes

Simple and delightful traffic monitoring for your webserver!

## Goals

* Easy to setup, maintain and develop
* Secure
* Fun

## Components

proper:bytes (p:b) consists of a smallish Ruby daemon for data collection and a not-so-smallish JavaScript client. The daemon exports a static JSON dataset for consumption by the client, no web accessible server component is required.

## Dataflow

<img src="docs/dataflow.png" alt="dataflow diagram" width="788" height="374">

## Installation

* [FreeBSD](docs/installation-freebsd.md)

## Development

    npm install -g yo grunt-cli bower
    bower install
    grunt server
