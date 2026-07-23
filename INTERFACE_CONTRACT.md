# Explicit Interface Contract Specification: Nexus SEOS Core & Modules

## Overview
This document specifies the modular boundaries and explicit interface contracts governing `com.nexus.seos` core platform and satellite modules (such as `RBA` Adaptive Homework Subsystem).

## Package Boundaries
1. **Nexus SEOS Core Platform**:
   - `com.nexus.seos.core`: Primary core domain services (e.g., `MasteryService`).
   - `com.nexus.seos.core.contract`: Shared domain contract interfaces exposed for platform extensions and satellite subsystems.
   - `com.nexus.seos.database`: Core JPA entities (`User`, `Course`, `Lesson`, `Concept`, `Quiz`, `QuizAttempt`, `SpacedRepetition`).

2. **RBA Subsystem**:
   - `com.nexus.seos.rba.core`: Adaptive homework services (`HomeworkService`).
   - `com.nexus.seos.rba.database`: RBA specific JPA entities (`Homework`, `HomeworkSubmission`).

## Contract Interfaces
- `CoreMasteryContract`: Shared contract interface for mastery score, velocity, and retention index calculations.
- `HomeworkIntegrationContract`: Integration contract defining adaptive difficulty evaluation algorithms (`determineAdaptiveDifficulty`).

## Anti-Pattern Rules
- **No Package Splitting**: Satellite modules MUST NOT declare root `com.nexus.seos.core` or `com.nexus.seos.database` packages.
- **Contract Driven**: Inter-module communication must proceed exclusively through explicit contract interfaces defined under `com.nexus.seos.core.contract`.
