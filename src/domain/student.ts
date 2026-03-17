import { StudentId, Email, Credits } from "./types";

export class Student {
  readonly id: StudentId;
  readonly name: string;
  readonly email: Email;
  enrolledCredits: Credits;

  constructor(id: StudentId, name: string, email: Email, enrolledCredits: Credits) {
    if (enrolledCredits > 18) {
      throw new Error(`enrolledCredits more than 18 not allowed, you have ${enrolledCredits}`);
    }
    this.id = id;
    this.name = name;
    this.email = email;
    this.enrolledCredits = enrolledCredits;
  }

  canEnroll(credits: Credits): boolean {
    return this.enrolledCredits + credits <= 18;
  }
}