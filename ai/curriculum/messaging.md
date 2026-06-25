# Messaging / queues — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** a job that should run async, or decoupling work.

You know RabbitMQ already — start there, then learn how Kafka's model differs. (Your email-automation
work is the natural first async feature.)

## Core — learn deeply (RabbitMQ)

- Exchanges, queues, bindings, routing keys; ack/nack; dead-letter queues; consumer concurrency.
- Wire it in with Spring AMQP.

## Learn the difference (Kafka)

- The log/partition/consumer-group model, and how a replayable LOG differs from a deletable QUEUE.
- When to choose Kafka (event streaming, replay, high throughput) vs RabbitMQ (task queues, routing).
- Wire it in with Spring Kafka.

## Patterns to understand

- Async processing, event-driven design, the outbox pattern, idempotent consumers, backpressure.

## Awareness only

- Kafka Streams, schema registry.

## On AWS

- SQS (queue) and SNS (pub/sub) are the managed equivalents — see aws.md.
