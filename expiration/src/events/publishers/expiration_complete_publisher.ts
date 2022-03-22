import {
  ExpirationCompletedEvent,
  Publisher,
  Subjects,
} from "@vpticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
