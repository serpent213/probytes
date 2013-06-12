# proper:bytes FreeBSD installation

1. Create a PostgreSQL database
2. Make sure MRI-Ruby 1.9 (or compatible), PgSQL client and Bundler are installed, e.g.:

        echo 'RUBY_DEFAULT_VERSION=1.9' >> /etc/make.conf
        cd /usr/ports/sysutils/rubygem-bundler
        make install clean
        cd /usr/ports/databases/postgresql91-client
        make install clean

3. Execute as root:

        mkdir -p /usr/local/lib
        cd /usr/local/lib
        fetch http://pbdist.teralink.net/probytes-0.3.0.tar.bz2
        [ `sha256 -q probytes-0.3.0.tar.bz2` = e7c4aa2698ad5627fb6b4ceb02b5bc0d848a852403994f2b4ee624273bec488b ] || echo checksum mismatch
        tar xjf probytes-0.3.0.tar.bz2
        rm probytes-0.3.0.tar.bz2
        chown -R www:www probytes
        cd probytes
        (cd daemon && bundle install)
        cp daemon/probytesd /usr/local/sbin
        cp daemon/probytesd.conf.rb.sample /usr/local/etc/probytesd.conf.rb
        $EDITOR /usr/local/etc/probytesd.conf.rb
        cp daemon/rc-scripts/freebsd/probytesd /usr/local/etc/rc.d
        cp -r dist/* $FRONTEND_DIR
        echo 'probytesd_enable="YES"' >> /etc/rc.conf

4. Insert into your `/usr/local/etc/nginx/nginx.conf`:

        log_format traffic '$host $request_length $bytes_sent';
        access_log /var/log/nginx-traffic.log traffic;

5. Append to your `/etc/newsyslog.conf`:

        /var/log/nginx-traffic.log              644  3     1024 *     JC    /var/run/nginx.pid

6. Execute:

        /usr/local/etc/rc.d/nginx reload
        /usr/local/etc/rc.d/probytesd start

7. Open the client in the browser, depending on the target directory you set in `probytesd.conf.rb`.
