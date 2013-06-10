# proper:bytes FreeBSD installation

1. Create a PostgreSQL database
2. Execute as root:

    mkdir -p /usr/local/lib
    cd /usr/local/lib
    git clone https://github.com/improper/probytes.git
    chown -R www:www probytes
    cd probytes
    cp daemon/probytesd /usr/local/sbin
    cp daemon/probytesd.conf.rb /usr/local/etc
    $EDITOR /usr/local/etc/probytesd.conf.rb
    cp daemon/rc-scripts/freebsd/probytesd /usr/local/etc/rc.d
    echo 'probytesd_enable="YES"' >> /etc/rc.conf

3. Insert into your `/usr/local/etc/nginx/nginx.conf`:

    log_format traffic '$host $request_length $bytes_sent';
    access_log /var/log/nginx-traffic.log traffic;

4. Append to your `/etc/newsyslog.conf`:

    /var/log/nginx-traffic.log              644  3     1024 *     JC    /var/run/nginx.pid

5. Execute:

    /usr/local/etc/rc.d/nginx reload
    /usr/local/etc/rc.d/probytesd start

6. Open the client in the browser, depending on the target directory you set in `probytesd.conf.rb`.
