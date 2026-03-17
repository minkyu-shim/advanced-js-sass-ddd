import { CourseCode, Credits } from "./types"

export class Course {
  readonly code: CourseCode;
  readonly name: string;
  readonly credits: Credits;
  readonly capacity: number;
  enrolledCount: number;

  constructor(code: CourseCode, name: string, credits: Credits, capacity: number, enrolledCount: number) {
    if (capacity < 1 || capacity > 200) {
      throw new Error(`capacity must be between 1 and 200, you have ${capacity}`);
    }
    if (enrolledCount > capacity) {
      throw new Error(`enrolledCount cannot exceed capacity (${capacity}), got ${enrolledCount}`);
    }
    this.code = code;
    this.name = name;
    this.credits = credits;
    this.capacity = capacity;
    this.enrolledCount = enrolledCount;
  }

  isFull(): boolean {
    return this.enrolledCount >= this.capacity;
  }

  isNearlyFull(): boolean {
    return this.enrolledCount / this.capacity >= 0.8;
  }
}