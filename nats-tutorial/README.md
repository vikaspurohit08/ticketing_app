# Port forward command for temporary test

kubectl port-forward <nats-pod name> 4222:4222 -- for client
kubectl port-forward <nats-pod name> 8222:8222 -- for monitoring
url - localhost:8222/streaming --> for monitoring
for detailed channel data --> http://localhost:8222/streaming/channelsz?subs=1
