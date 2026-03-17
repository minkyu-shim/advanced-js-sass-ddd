// Observers and Payloads
export type Observer<T> = (event: T) => void

export type StudentEnrolled = Readonly<{type: "StudentEnrolled", studentId: string, courseCode: string, enrollmentId: string}>

export type EnrollmentCancelled = Readonly<{type: "EnrollmentCancelled", studentId: string, enrollmentId: string, courseCode: string}>

export type CourseCapacityReached = Readonly<{type: "CourseCapacityReached", courseCode: string, courseLimit: number, enrolledCount: number}>

export type CourseFull = Readonly<{type: "CourseFull", courseCode: string, courseLimit: number}>

export type DomainEvents = StudentEnrolled | EnrollmentCancelled | CourseCapacityReached | CourseFull

// Event emitter Interface
export interface IEventEmitter {
  subscribe<T>(eventType: string, handler: Observer<T>): void
  unsubscribe<T>(eventType: string, handler: Observer<T>): void
  emit<T>(eventType: string, payload: T): void
}

export class EventEmitter implements IEventEmitter {
  private handlers: Map<string, Function[]> = new Map()

  subscribe<T>(eventType: string, handler: Observer<T>): void {
    if (!this.handlers.has(eventType)) {this.handlers.set(eventType, [])}
    this.handlers.get(eventType)!.push(handler)
  }

  unsubscribe<T>(eventType: string, handler: Observer<T>): void {
    const eventHandlers = this.handlers.get(eventType)
    if (eventHandlers) {
      this.handlers.set(eventType, eventHandlers.filter((existingHandler) => existingHandler !== handler))
      if (this.handlers.get(eventType)?.length === 0) {this.handlers.delete(eventType)}
    }
  }

  emit<T>(eventType: string, payload: T): void {
    const eventHandlers = this.handlers.get(eventType)
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(payload))
    }
  }
}