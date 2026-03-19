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
if (studentId01 instanceof Error) throw studentId01;
if (studentEmail01 instanceof Error) throw studentEmail01
if (studentCredit01 instanceof Error) throw studentCredit01;
const student01 = new Student(studentId01, "Armand", studentEmail01, studentCredit01)

const fall2025 = createSemester("Fall2025")
if (fall2025 instanceof Error) throw fall2025



// Scenario 1 - Successful student enrollement
const pythonCourseCode = createCourseCode("PY101")
if (pythonCourseCode instanceof Error) throw pythonCourseCode
const credits3 = createCredits(3)
if (credits3 instanceof Error) throw credits3
const pythonCourse = new Course(pythonCourseCode, "Introduction to Python", credits3, 40, 0)

const enrollmentsPythonCourse: Enrollment[] = []

const scenario1 = service.enroll(student01, pythonCourse, fall2025, enrollmentsPythonCourse)
if(!(scenario1 instanceof Error)) enrollmentsPythonCourse.push(scenario1)

// Scenario 2 - Course reaches 80% capacity
const jsCourseCode = createCourseCode("JS101")
if (jsCourseCode instanceof Error) throw jsCourseCode
const enrollmentsJsCourse: Enrollment[] = []
const jsCourse = new Course(jsCourseCode, "Advanced Web Development", credits3, 5, 3) // it currently start from 3/5 enrollemtents
const scenario2 = service.enroll(student01, jsCourse, fall2025, enrollmentsJsCourse) // should notify that 80% of the capacity reached
if(!(scenario2 instanceof Error)) enrollmentsJsCourse.push(scenario2)

// Scenario 3 - Course becomes full
const studentId02 = createStudentId("STU000002")
if (studentId02 instanceof Error) throw studentId02
const studentEmail02 = createEmail("minkyu@school.com")
if (studentEmail02 instanceof Error) throw studentEmail02
const student02 = new Student(studentId02, "Minkyu", studentEmail02, studentCredit01)

const scenario3 = service.enroll(student02, jsCourse, fall2025, enrollmentsJsCourse) // should log that the js course is full
if(!(scenario3 instanceof Error)) enrollmentsJsCourse.push(scenario3)