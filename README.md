# proper:bytes

Easy and delightful traffic monitoring for your webserver!

## Goals

* easy to setup, maintain and develop
* secure
* fun

## Components

proper:bytes (p:b) consists of smallish Ruby daemon for data collection and a not-so-smallish JavaScript client. The daemon exports a static JSON dataset for consumption by the client, no web accessible server component is required.

## Development

    npm install -g yo grunt-cli bower
    grunt server
