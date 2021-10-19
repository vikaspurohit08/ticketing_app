# Concurrency Issue

Let's assume the system is up and running and request is made for creating ticket. Followed by updating the ticket twice. In ideal scenario it will work flawless. But let's say we receive 1000 requests at once in same way. In tickers db the data will be created and updated correctly but in other db where we are sending event(for eg. orders) there is possibility that update gets called before creation of ticket, or second update getting called before first update. This is concurrency issue.

# Solution for concurrency

We will use `optimistic concurrency control`.
To solve this issue we will maintain versioning. So let's assume ticket creation is done tickets end with version 1.
First updation done with version 2. Second updation done with version 3. Then for orders even if second update request comes before first update the version will be checked if it's 2 then updation will be allowed if not then the request will fail. So nats streaming server will get the request back to send it again after some timeout. Till then the first update request may get hit and worked out.

# mongoose-update-if-current package

To have this versioning we can use `mongoose-update-if-current` npm package.
Which by default used (`___v`) of mongodb document for versioning. But we can set favourable name by using
documentSchema.set("versionKey", "our_versioning_name");

# When version will be incremented/included in event?

Increment/including of version number will be only when primary service responsible for a record emits an event to describe create/update/destroy to a record.
