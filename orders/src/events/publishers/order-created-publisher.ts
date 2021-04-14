import {Publisher, Subjects, OrderCreatedEvent} from "@lftickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

