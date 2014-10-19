
# Node HTTP and WebSocket Load Balancer (WIP - dev only)

## Installation

```
git clone https://github.com/WooDzu/websocks-balance.git
npm install
```

Make sure Redis server is running on localhost (port 6379 by default)

## Start WebSocket edge servers

```
node index.js 81
node index.js 82
node index.js 83
node index.js 84
```

This will launch 4 node processes.
Each will:
 - host index.html
 - accept WebSocket connections
 - setup Pub/Sub connections to Redis server for internal communication

## Load balancing

### Using HAProxy

```
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    user haproxy
    group haproxy
    daemon
    maxconn 256

defaults
    log        global
    mode       http
    option     httplog
    option     dontlognull
    contimeout 5000
    clitimeout 50000
    srvtimeout 50000

listen node-load-proxy 0.0.0.0:80
    mode http
    stats enable
    stats uri /haproxy?stats
    stats realm Strictly\ Private
    stats auth test:test
    balance roundrobin
    option httpclose
    option forwardfor
    server node81 localhost:81 check
    server node82 localhost:82 check
    server node83 localhost:83 check
    server node84 localhost:84 check
```

Load Balancer will be listening on 0.0.0.0:80
I've found HAProxy to be more reliable than node-http-proxy

Reload the list without restarting the server:
> `sudo service haproxy reload`

Connection stats on:
> http://test:test@localhost:8080/haproxy?stats

### http-proxy

node proxy.js

Load Balancer will be listening on 0.0.0.0:80
Currently it will pick up the list of servers from /lib/servers.js

### TODO

 [ ] Load list of live servers from Redis
 [ ] Dynamicallly update list of the live servers
 [ ] Full HA solution
