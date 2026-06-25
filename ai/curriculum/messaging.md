# Messaging / queues — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** a job that should run async, or decoupling work. **Target:** RabbitMQ 4.x via Spring AMQP; Kafka via Spring Kafka.

**Why this matters:** Messaging is how you decouple work and make the slow parts async — and it's where "it worked on my machine" turns into lost messages and double-charged customers in production. You already know RabbitMQ from Node, so the broker concepts are mostly free.

Move fast on the broker model you already know; spend the depth on the Spring AMQP / Spring Kafka wiring, JVM consumer concurrency, and the delivery-guarantee pitfalls interviewers love.

## Depth tiers

### Core — learn deeply
- **Spring AMQP wiring (RabbitMQ):** `RabbitTemplate` to publish, `@RabbitListener` to consume; exchanges/queues/bindings declared as beans or via `RabbitAdmin`.
- **Acks & delivery guarantees:** manual vs auto ack, `nack`/`requeue`, and **publisher confirms** + returns — the only way a publish is actually durable.
- **JVM consumer concurrency:** `concurrency` / `maxConcurrency` on the listener container, prefetch (`basicQos`), and why threads-per-consumer is a real tuning knob (unlike a single Node event loop).
- **Dead-letter queues** for poison messages, and **idempotent consumers** for at-least-once delivery.
- **RabbitMQ vs Kafka — the model decision:** a replayable, retained **LOG** (Kafka) vs a deletable **QUEUE** (RabbitMQ). Know which you'd pick and why.

### Working knowledge
- **Spring Kafka:** `KafkaTemplate`, `@KafkaListener`, consumer-group + partition assignment, offset commit (auto vs manual), the log/partition/consumer-group model.
- The **outbox pattern** — atomic DB write + event publish without a distributed transaction.
- AWS managed equivalents: **SQS** (queue) and **SNS** (pub/sub fan-out), often paired SNS→SQS. See `aws.md`.

### Awareness only
- Kafka Streams, schema registry (Avro/Protobuf), exactly-once semantics, backpressure tuning.

### Skip — and why
- Hand-rolling retry/backoff — Spring's retry + DLQ recovery and Resilience4j cover it. ActiveMQ/JMS — RabbitMQ and Kafka are the live targets. Don't build a queue on a DB table when a broker is right there.

## Node → Java delta

The broker concepts are identical; these are the genuinely new parts.

- **No raw `amqplib` — a listener container manages threads for you.** Spring spins up a pool of consumer threads (`concurrency`), each pulling `prefetch` messages. You tune a real thread pool, not callbacks on one loop.
- **Acks are explicit and matter more.** Set `AcknowledgeMode.MANUAL` and you own ack/nack/requeue; get it wrong and you lose messages on crash or loop a poison message forever.
- **Publishing isn't fire-and-forget if you want durability.** Enable **publisher confirms** so a failed publish surfaces — there's no implicit "it'll retry" like some Node clients pretend.
- **Serialization is a configured converter.** Use a `Jackson2JsonMessageConverter` (Jackson 3 on Boot 4) — not `JSON.stringify` on the wire by default.
- **Consumer concurrency is yours to size.** More threads = more parallelism but also more reordering and more DB connection pressure. There's no free single-threaded ordering guarantee.

## Learning objectives

After this you can:
- Publish with confirms and consume with manual ack via Spring AMQP, and explain what a crash mid-processing does to the message.
- Configure a dead-letter exchange/queue and route poison messages to it after N retries.
- Make a consumer idempotent and explain why at-least-once delivery forces it.
- Tune listener `concurrency` + prefetch and reason about the throughput-vs-ordering tradeoff.
- Decide RabbitMQ vs Kafka for a given workload and defend it (replay/retention vs routing/per-message ack).

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Move email automation onto a queue: publish on signup, consume with `@RabbitListener`, manual ack. (Natural first async feature.)
- Add publisher confirms and prove a publish failure is detected, not silently dropped.
- Add a DLQ + retry policy; force a poison message and watch it land in the dead-letter queue.
- Make the consumer idempotent (dedupe key in Postgres/Redis) and re-deliver the same message to prove no double-processing.
- Implement the outbox pattern: write the row + outbox event in one transaction, relay it to the broker.
- Spin up a second consumer instance (or raise `concurrency`) and observe ordering break across partitions/queues.

## Common pitfalls

- **Lost messages on crash** — auto-ack acknowledges before processing; use manual ack, and publisher confirms on the producer side.
- **Duplicate processing** — at-least-once means messages *will* redeliver; non-idempotent consumers double-charge. Dedupe on a stable key.
- **Poison messages with no DLQ** — a message that always fails requeues forever and stalls the queue. Route to a DLQ after a retry limit.
- **Assuming global ordering** — order holds only per Kafka partition / per single RabbitMQ consumer. Add consumers or partitions and ordering is gone.
- **Testing against an in-memory fake** — use Testcontainers for a real RabbitMQ/Kafka broker; mocks hide ack and redelivery bugs.

## Canonical resource

- RabbitMQ tutorials (official): https://www.rabbitmq.com/tutorials

## Modern (2026)

- **RabbitMQ 4.x** is current; quorum queues are the default durable choice over classic mirrored queues. Spring AMQP / Spring Kafka ship with Spring Boot 4.x and use **Jackson 3** for message conversion (verify against current docs — knowledge ~early 2026).
- Reach for **Resilience4j** (not Hystrix) if you need circuit breaking around a flaky downstream a consumer calls.
