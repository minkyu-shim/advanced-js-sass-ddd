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
const studentCredit01 = createCredits(3)
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

const enrollments: Enrollment[] = []

const scenario1 = service.enroll(student01, pythonCourse, fall2025, enrollments)
if(!(scenario1 instanceof Error)) enrollments.push(scenario1)

