# proper:bytes FreeBSD + nginx installation

1. Create a PostgreSQL database

        createuser --no-superuser --no-createrole --no-createdb --pwprompt traffic
        createdb --encoding=UTF8 --owner=traffic traffic

2. Make sure MRI-Ruby 1.9 (or compatible), PgSQL client and Bundler are installed, e.g.:

        echo 'RUBY_DEFAULT_VERSION=1.9' >> /etc/make.conf
        cd /usr/ports/sysutils/rubygem-bundler
        make install clean
        cd /usr/ports/databases/postgresql91-client
        make install clean

3. Execute as root:

        mkdir -p /usr/local/lib
        cd /usr/local/lib
        fetch http://pbdist.teralink.net/probytes-LATEST.tar.bz2
        fetch https://raw.github.com/improper/probytes/master/SHA256SUMS
        shasum -c SHA256SUMS
        tar xjf probytes-LATEST.tar.bz2
        rm probytes-LATEST.tar.bz2 SHA256SUMS
        chown -R www:www probytes
        cd probytes
        (cd daemon && bundle install)
        cp daemon/probytesd /usr/local/sbin
        cp daemon/probytesd.conf.rb.sample /usr/local/etc/probytesd.conf.rb
        $EDITOR /usr/local/etc/probytesd.conf.rb
        cp daemon/rc-scripts/freebsd/probytesd /usr/local/etc/rc.d
        cp -r dist/* $FRONTEND_DIR
        echo 'probytesd_enable="YES"' >> /etc/rc.conf

4. Make sure the frontend directory (at least a file named `data.json`) is writable for user www

5. Insert into your `/usr/local/etc/nginx/nginx.conf`:

        log_format traffic '$host $request_length $bytes_sent';
        access_log /var/log/nginx-traffic.log traffic;

6. Append to your `/etc/newsyslog.conf`:

        /var/log/nginx-traffic.log              644  3     1024 *     JC    /var/run/nginx.pid

7. Execute:

        /usr/local/etc/rc.d/nginx reload
        /usr/local/etc/rc.d/probytesd start

8. Open the client in the browser, depending on the target directory you set in `probytesd.conf.rb`.
