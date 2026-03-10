# Project Plan

Two people working in parallel. Person A owns the domain layer, Person B owns the infrastructure and wiring. They converge at the CLI.

---

## Minkyu — Domain Layer

### Phase 1: Branded Types (`src/domain/types.ts`)

1. Define `Brand<K, T>` base type
2. Create all 6 branded types with smart constructors:
   - `StudentId`, `CourseCode`, `Email`, `Credits`, `Semester`, `EnrollmentId`
3. Each constructor returns `Type | Error` — validate format, cast, or return error

### Phase 2: Entities

1. `Course` (`src/domain/course.ts`) — simplest, no dependencies on other entities
2. `Student` (`src/domain/student.ts`) — tracks `enrolledCredits`, needs `Credits` type
3. `Enrollment` (`src/domain/enrollment.ts`) — references `StudentId` and `CourseCode`, has `active | cancelled` status

Each entity enforces its own invariants in the constructor.

---

## Armand — Infrastructure & Wiring

### Phase 3: Event Emitter (`src/infrastructure/event-emitter.ts`)

1. Define the `IEventEmitter` interface
2. Implement the class with `subscribe`, `unsubscribe`, `emit`
3. Define the 4 event payload types: `StudentEnrolled`, `EnrollmentCancelled`, `CourseCapacityReached`, `CourseFull`

> Note: Phase 3 can start independently without waiting for Person A.

### Phase 4: Enrollment Service (`src/domain/enrollment-service.ts`)

> Depends on Phase 1, 2, and 3 being done first.

1. Enforce the 4 business rules (capacity, credit limit, uniqueness, branded types)
2. Emit the correct events at the right moments
3. Handle the 80% capacity threshold for `CourseCapacityReached`

---

## Both — CLI (`index.ts`)

### Phase 5: CLI

> Depends on all phases above.

1. Set up test data (students, courses)
2. Run through each of the 5 scenarios in order
3. Log event outputs clearly

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Successful enrollment | `StudentEnrolled` emitted |
| 2 | Course reaches 80% capacity | `CourseCapacityReached` emitted |
| 3 | Course becomes full | `CourseFull` emitted |
| 4 | Student exceeds 18 credits | Enrollment fails, no event |
| 5 | Cancel an enrollment | `EnrollmentCancelled` emitted |

---

## Testing Strategy

Test each phase as you finish it — don't wait until the end.

- Phase 1: test smart constructors with valid and invalid inputs
- Phase 2: test entity construction with bad data
- Phase 3: test subscribe/emit/unsubscribe in isolation
- Phase 4: test each business rule failure case
- Phase 5: verify all 5 CLI scenarios print the right output
