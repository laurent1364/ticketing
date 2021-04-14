import {Publisher, Subjects, ExpirationCompleteEvent} from "@lftickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    // readonly is final in Java
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

