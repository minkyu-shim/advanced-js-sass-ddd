import { EventEmitter } from "./src/infrastructure/event-emitter";
import { createStudentId, createEmail, createCourseCode, createCredits, createSemester } from "./src/domain/types";
import { Enrollment } from "./src/domain/enrollment";
import { EnrollmentService } from "./src/domain/enrollment-service";
import { Student } from "./src/domain/student";
import { Course } from "./src/domain/course";

const emitter = new EventEmitter()
const service = new EnrollmentService(emitter)

// add things to alert by console log
emitter.subscribe("StudentEnrolled", (e) => console.log("Student has been enrolled", e))
emitter.subscribe("CourseCapacityReached", (e) => console.log("Course capaticy", e))
emitter.subscribe("CourseFull", (e) => console.log("Course is full", e))
emitter.subscribe("EnrollmentCancelled", (e) => console.log("Enrollemnt has been canceled", e))

// construct things that will be used in cli scenarios
const studentId01 = createStudentId("STU000001")
const studentEmail01 = createEmail("armand@school.com")
const studentCredit01 = createCredits(1)
if (studentId01 instanceof Error) throw studentId01
if (studentEmail01 instanceof Error) throw studentEmail01
if (studentCredit01 instanceof Error) throw studentCredit01
const student01 = new Student(studentId01, "Armand", studentEmail01, studentCredit01)

const fall2025 = createSemester("Fall2025")
if (fall2025 instanceof Error) throw fall2025



// Scenario 1 - Successful student enrollement
console.log("\n--- Scenario 1: Successful student enrollement ---")

const pythonCourseCode = createCourseCode("PY101")
if (pythonCourseCode instanceof Error) throw pythonCourseCode
const credits3 = createCredits(3)
if (credits3 instanceof Error) throw credits3
const pythonCourse = new Course(pythonCourseCode, "Introduction to Python", credits3, 40, 0)

const enrollmentsPythonCourse: Enrollment[] = []

const scenario1 = service.enroll(student01, pythonCourse, fall2025, enrollmentsPythonCourse)
if(!(scenario1 instanceof Error)) enrollmentsPythonCourse.push(scenario1)

// Scenario 2 - Course reaches 80% capacity
console.log("\n--- Scenario 2: Course reaches 80% capacity ---")

const jsCourseCode = createCourseCode("JS101")
if (jsCourseCode instanceof Error) throw jsCourseCode
const enrollmentsJsCourse: Enrollment[] = []
const jsCourse = new Course(jsCourseCode, "Advanced Web Development", credits3, 5, 3) // it currently start from 3/5 enrollemtents
const scenario2 = service.enroll(student01, jsCourse, fall2025, enrollmentsJsCourse) // should notify that 80% of the capacity reached
if(!(scenario2 instanceof Error)) enrollmentsJsCourse.push(scenario2)

// Scenario 3 - Course becomes full
console.log("\n--- Scenario 3: Course becomes full ---")

const studentId02 = createStudentId("STU000002")
if (studentId02 instanceof Error) throw studentId02
const studentEmail02 = createEmail("minkyu@school.com")
if (studentEmail02 instanceof Error) throw studentEmail02
const student02 = new Student(studentId02, "Minkyu", studentEmail02, studentCredit01)

const scenario3 = service.enroll(student02, jsCourse, fall2025, enrollmentsJsCourse) // should log that the js course is full
if(!(scenario3 instanceof Error)) enrollmentsJsCourse.push(scenario3)

// Scenario 4 - Student exceeds 18 credits
console.log("\n--- Scenario 4: Exceeding Credit Limit ---")

const studentId03 = createStudentId("STU000003") // Starts with 6 credits
if (studentId03 instanceof Error) throw studentId03
const studentEmail03 = createEmail("charles@school.com")
if (studentEmail03 instanceof Error) throw studentEmail03

const credits6 = createCredits(6)
if (credits6 instanceof Error) throw credits6

const student03 = new Student(studentId03, "Hermione", studentEmail03, credits6)

const intensiveCourseCode1 = createCourseCode("INT101") // We make 3 intensive courses
if (intensiveCourseCode1 instanceof Error) throw intensiveCourseCode1
const intensiveCourse1 = new Course(intensiveCourseCode1, "Intensive Physics", credits6, 30, 0)

const intensiveCourseCode2 = createCourseCode("INT102")
if (intensiveCourseCode2 instanceof Error) throw intensiveCourseCode2
const intensiveCourse2 = new Course(intensiveCourseCode2, "Intensive Math", credits6, 30, 0)

const intensiveCourseCode3 = createCourseCode("INT103")
if (intensiveCourseCode3 instanceof Error) throw intensiveCourseCode3
const intensiveCourse3 = new Course(intensiveCourseCode3, "Intensive Chemistry", credits6, 30, 0)

const enrollmentsIntensive: Enrollment[] = []
const s4_enroll1 = service.enroll(student03, intensiveCourse1, fall2025, enrollmentsIntensive) // Enroll to first course (6 + 6 = 12)
if (!(s4_enroll1 instanceof Error)) enrollmentsIntensive.push(s4_enroll1) 
const s4_enroll2 = service.enroll(student03, intensiveCourse2, fall2025, enrollmentsIntensive) // Enroll to seconde course (12 + 6 = 18), limit reached
if (!(s4_enroll2 instanceof Error)) enrollmentsIntensive.push(s4_enroll2) 
const scenario4 = service.enroll(student03, intensiveCourse3, fall2025, enrollmentsIntensive) // Enroll to third course (18 + 6 = 24 !) Limit exceded, error returned 

if (scenario4 instanceof Error) {
  console.log("Scenario 4 correctly rejected enrollment:", scenario4.message)
}

// Scenario 5 - Cancel an enrollment
console.log("\n--- Scenario 5: Cancel an Enrollment ---")

if (!(scenario1 instanceof Error)) {
  const cancelResult = service.cancel(scenario1.id, enrollmentsPythonCourse)
  if (cancelResult instanceof Error) {
    console.error("Failed to cancel:", cancelResult.message)
  } else {
    console.log("Cancellation processed for enrollment ID:", scenario1.id)
  }
}