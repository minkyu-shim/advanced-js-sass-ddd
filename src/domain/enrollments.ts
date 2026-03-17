import { EnrollmentId, StudentId, CourseCode, Semester } from "./types";

export class Enrollment {
  readonly id: EnrollmentId;
  readonly studentId: StudentId;
  readonly courseCode: CourseCode;
  readonly semester: Semester;
  status: "active" | "cancelled";

  constructor(id: EnrollmentId, studentId: StudentId, courseCode: CourseCode, semester: Semester) {
    this.id = id;
    this.studentId = studentId;
    this.courseCode = courseCode;
    this.semester = semester;
    this.status = "active";
  }

  cancel(): void {
    if (this.status === "cancelled") {
      throw new Error(`Enrollment ${this.id} is already cancelled`);
    }
    this.status = "cancelled";
  }
}