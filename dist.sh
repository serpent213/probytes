#!/bin/sh

# package proper:bytes distribution

set -e

grunt build

version=`grep version component.json | cut -d '"' -f 4`

cd ..
tar cjf probytes/probytes-$version.tar.bz2 \
  --exclude dist/components \
  --exclude Gemfile.lock \
  probytes/LICENCE.md \
  probytes/README.md \
  probytes/daemon \
  probytes/dist \
  probytes/docs

echo
shasum -a 256 probytes/probytes-$version.tar.bz2
