# Project Plan

Two people working in parallel. Minkyu owns the domain layer, Armand owns the infrastructure and wiring. They converge at the CLI.

---

## Minkyu — Domain Layer

### Phase 1: Branded Types (`src/domain/types.ts`)

Create a single file that defines all branded types and their smart constructors.

1. **Define the `Brand` utility type**
   - Write `type Brand<K, T> = K & { __brand: T }` — this is the foundation everything else builds on

2. **Create `StudentId`**
   - Type: `Brand<string, "StudentId">`
   - Smart constructor `createStudentId(value: string): StudentId | Error`
   - Valid format: starts with `STU` followed by exactly 6 digits (e.g. `STU123456`)
   - Return `new Error(...)` if format doesn't match, otherwise cast and return

3. **Create `CourseCode`**
   - Type: `Brand<string, "CourseCode">`
   - Smart constructor `createCourseCode(value: string): CourseCode | Error`
   - Valid format: 2–4 uppercase letters followed by exactly 3 digits (e.g. `CS101`, `MATH301`)

4. **Create `Email`**
   - Type: `Brand<string, "Email">`
   - Smart constructor `createEmail(value: string): Email | Error`
   - Valid format: standard email — must contain `@` and a domain with a `.`

5. **Create `Credits`**
   - Type: `Brand<number, "Credits">`
   - Smart constructor `createCredits(value: number): Credits | Error`
   - Valid values: only `1`, `2`, `3`, `4`, or `6` — reject anything else

6. **Create `Semester`**
   - Type: `Brand<string, "Semester">`
   - Smart constructor `createSemester(value: string): Semester | Error`
   - Valid format: `Fall`, `Spring`, or `Summer` followed by a 4-digit year (e.g. `Fall2024`)

7. **Create `EnrollmentId`**
   - Type: `Brand<string, "EnrollmentId">`
   - Smart constructor `createEnrollmentId(value: string): EnrollmentId | Error`
   - Valid format: starts with `ENR` followed by any non-empty string (e.g. `ENR-uuid`)

---

### Phase 2: Entities

Each entity is a class. The constructor should throw (or refuse) if given invalid data. Properties should be `readonly` to make them immutable after creation.

> Depends on Phase 1 being done first.

1. **`Course` (`src/domain/course.ts`)**
   - Properties: `code: CourseCode`, `name: string`, `credits: Credits`, `capacity: number`, `enrolledCount: number`
   - Invariants to enforce:
     - `capacity` must be between 1 and 200
     - `enrolledCount` cannot exceed `capacity`
   - Add a method `isFull(): boolean` — returns true when `enrolledCount >= capacity`
   - Add a method `isNearlyFull(): boolean` — returns true when `enrolledCount / capacity >= 0.8`

2. **`Student` (`src/domain/student.ts`)**
   - Properties: `id: StudentId`, `name: string`, `email: Email`, `enrolledCredits: Credits`
   - Invariants to enforce:
     - `enrolledCredits` cannot exceed 18
   - Add a method `canEnroll(credits: Credits): boolean` — returns true if adding these credits stays at or under 18

3. **`Enrollment` (`src/domain/enrollment.ts`)**
   - Properties: `id: EnrollmentId`, `studentId: StudentId`, `courseCode: CourseCode`, `semester: Semester`, `status: "active" | "cancelled"`
   - Invariants to enforce:
     - `status` starts as `"active"` on creation
     - Only active enrollments can be cancelled
   - Add a method `cancel(): void` — sets status to `"cancelled"`, throws if already cancelled

---

## Armand — Infrastructure & Wiring

### Phase 3: Event Emitter (`src/infrastructure/event-emitter.ts`)

Build the pub/sub system. This phase has no dependency on the domain — start immediately.

1. **Define event payload types**
   - `StudentEnrolled`: `{ studentId: string, courseCode: string, semester: string }`
   - `EnrollmentCancelled`: `{ enrollmentId: string, studentId: string, courseCode: string }`
   - `CourseCapacityReached`: `{ courseCode: string, enrolledCount: number, capacity: number }`
   - `CourseFull`: `{ courseCode: string, capacity: number }`

2. **Define the `IEventEmitter` interface**
   - `subscribe<T>(eventType: string, handler: (event: T) => void): void`
   - `unsubscribe<T>(eventType: string, handler: (event: T) => void): void`
   - `emit<T>(eventType: string, payload: T): void`

3. **Implement the `EventEmitter` class**
   - Internally keep a `Map<string, Function[]>` to store handlers per event type
   - `subscribe`: add the handler to the list for that event type
   - `unsubscribe`: remove the handler from the list (match by reference)
   - `emit`: call every handler registered for that event type, passing the payload

---

### Phase 4: Enrollment Service (`src/domain/enrollment-service.ts`)

Wire domain entities and the event emitter together. This is where the business rules live.

> Depends on Phase 1, 2, and 3 being done first.

1. **Create the `EnrollmentService` class**
   - Constructor takes an `IEventEmitter` instance

2. **Implement `enroll(student, course, semester, enrollments)` method**
   - Check uniqueness: if an active enrollment already exists for this student + course + semester, return an error
   - Check capacity: if `course.isFull()`, return an error
   - Check credit limit: if `!student.canEnroll(course.credits)`, return an error
   - If all checks pass:
     - Create a new `Enrollment`
     - Update `course.enrolledCount` and `student.enrolledCredits`
     - Emit `StudentEnrolled`
     - If `course.isFull()` after enrolling, emit `CourseFull`
     - Else if `course.isNearlyFull()` after enrolling, emit `CourseCapacityReached`

3. **Implement `cancel(enrollment, enrollments)` method**
   - Find the enrollment by id
   - Call `enrollment.cancel()` — this will throw if already cancelled
   - Emit `EnrollmentCancelled`

---

## Both — CLI (`index.ts`)

### Phase 5: CLI

> Depends on all phases above being done.

Set up 5 concrete scenarios using real data. Each scenario should print clearly what happened.

1. **Scenario 1 — Successful enrollment**
   - Create a student and a course with available capacity and credits under 18
   - Enroll the student → expect `StudentEnrolled` to be logged

2. **Scenario 2 — Course reaches 80% capacity**
   - Create a course with small capacity (e.g. 5 seats)
   - Enroll enough students to hit 80% (e.g. 4 out of 5)
   - Expect `CourseCapacityReached` to be logged

3. **Scenario 3 — Course becomes full**
   - Continue from scenario 2 or create a fresh near-full course
   - Enroll the last student to fill it
   - Expect `CourseFull` to be logged

4. **Scenario 4 — Student exceeds 18 credits**
   - Create a student already at 16 credits
   - Try to enroll them in a 3-credit course
   - Expect enrollment to fail and no event to be emitted

5. **Scenario 5 — Cancel an enrollment**
   - Use an existing active enrollment from a previous scenario
   - Call cancel on it
   - Expect `EnrollmentCancelled` to be logged

---

## Testing Strategy

Test each phase as you finish it — don't wait until the end.

- Phase 1: call each smart constructor with valid and invalid values, log the result
- Phase 2: try creating entities with out-of-range values, verify they reject bad data
- Phase 3: subscribe a handler, emit an event, verify it fires; then unsubscribe and verify it doesn't
- Phase 4: test each business rule failure — full course, over-credit, duplicate enrollment
- Phase 5: run `npm run dev` and verify all 5 scenarios print the expected output