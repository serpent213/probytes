# proper:bytes Ubuntu + Apache installation

1. Create a PostgreSQL database

        createuser --no-superuser --no-createrole --no-createdb --pwprompt traffic
        createdb --encoding=UTF8 --owner=traffic traffic

2. Make sure MRI-Ruby 1.9 (or compatible), PgSQL client and Bundler are installed, e.g.:

        apt-get install ruby1.9.3 bundler libpq-dev

3. Execute as root (logfile for config is `/var/log/apache2/traffic.log`):

        mkdir -p /usr/local/lib
        cd /usr/local/lib
        curl -O http://pbdist.teralink.net/probytes-LATEST.tar.bz2
        curl https://raw.github.com/improper/probytes/master/SHA256SUMS | shasum -c
        tar xjf probytes-LATEST.tar.bz2
        rm probytes-LATEST.tar.bz2
        chown -R www-data:www-data probytes
        cd probytes
        (cd daemon && bundle install)
        cp daemon/probytesd /usr/local/sbin
        cp daemon/probytesd.conf.rb.sample /usr/local/etc/probytesd.conf.rb
        $EDITOR /usr/local/etc/probytesd.conf.rb
        cp daemon/rc-scripts/ubuntu-upstart/probytesd.conf /etc/init
        cp -r dist/* $FRONTEND_DIR

4. Make sure the frontend directory (at least a file named `data.json`) is writable for user www-data and the logfile is readable

5. Create `/etc/apache2/conf.d/probytes`:

        LogFormat "%v %I %O" traffic

6. Insert into each `/etc/apache2/sites-enabled/*`:

        CustomLog ${APACHE_LOG_DIR}/traffic.log traffic

7. Execute:

        service apache2 reload
        start probytesd

8. Open the client in the browser, depending on the target directory you set in `probytesd.conf.rb`.
