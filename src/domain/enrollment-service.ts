import { Student } from "./student"
import { Course } from "./course"
import { Enrollment } from "./enrollments"
import { Semester, EnrollmentId, createEnrollmentId, Credits } from "./types"
import { IEventEmitter, StudentEnrolled, CourseFull, CourseCapacityReached, EnrollmentCancelled } from "../infrastructure/event-emitter"

export class EnrollmentService {
  private eventEmitter: IEventEmitter

  constructor(eventEmitter: IEventEmitter) {
    this.eventEmitter = eventEmitter
  }

  enroll(student: Student, course: Course, semester: Semester, enrollments: Enrollment[]): Enrollment | Error {
    const isAlreadyEnrolled = enrollments.some(
      (e) =>
        e.studentId === student.id &&
        e.courseCode === course.code &&
        e.semester === semester &&
        e.status === "active"
    )
    if (isAlreadyEnrolled) {
      return new Error("Student ${student.id} is already actively enrolled in ${course.code} for ${semester}.")
    }

    if (course.isFull()) {
      return new Error("Course ${course.code} is full.");
    }

    if (!student.canEnroll(course.credits)) {
      return new Error("Enrolling in ${course.code} exceeds student ${student.id}'s 18-credit limit.")
    }

    const rawId = `ENR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const enrollmentIdOrError = createEnrollmentId(rawId)
    
    if (enrollmentIdOrError instanceof Error) {
      return enrollmentIdOrError
    }

    const newEnrollment = new Enrollment(enrollmentIdOrError, student.id, course.code, semester)

    course.enrolledCount += 1
    student.enrolledCredits = (student.enrolledCredits + course.credits) as Credits

    this.eventEmitter.emit<StudentEnrolled>("StudentEnrolled", {type: "StudentEnrolled", studentId: student.id, courseCode: course.code, enrollmentId: enrollmentIdOrError,})

    if (course.isFull()) {
      this.eventEmitter.emit<CourseFull>("CourseFull", {type: "CourseFull", courseCode: course.code, courseLimit: course.capacity,})
    } else if (course.isNearlyFull()) {
      this.eventEmitter.emit<CourseCapacityReached>("CourseCapacityReached", {type: "CourseCapacityReached", courseCode: course.code, courseLimit: course.capacity, enrolledCount: course.enrolledCount,})
    }
    return newEnrollment
  }

  cancel(enrollmentId: EnrollmentId, enrollments: Enrollment[]): void | Error {
    const enrollment = enrollments.find((e) => e.id === enrollmentId)
    if (!enrollment) {
      return new Error(`Enrollment with ID ${enrollmentId} not found.`)
    }
    enrollment.cancel()

    this.eventEmitter.emit<EnrollmentCancelled>("EnrollmentCancelled", {type: "EnrollmentCancelled", enrollmentId: enrollment.id, studentId: enrollment.studentId, courseCode: enrollment.courseCode,})
  }
}