# To implement the expiration service timer we can use following ways

1. Use setTimeout to set time for expiration. Downside of this way is timer is stored in memory if service restarts, all timers are lost
2. Rely on NATS delivery. i.e. don't ack the message then nats will redeliver the message every 5 seconds until the expiration timer ends.
   But the downside of this approach is we are already relying on NATS delivery when a message is not able to be processed by a service. Hence it will become confusing to differentiate between failure and expiration timer.
3. Use Message Broker. It is a great solution as broker will send expiration complete message only after timer is finished here we can directly send message from order and there will be no need of expiration service itself. But downside for this approach is nats streaming server does not support this.
4. Use redis and BULL js. We will use this approach. Bull js will process expiration and store the data in redis server.
