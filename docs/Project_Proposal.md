# Project Proposal

## Title

Smart Maternal Emergency Response System (SMERS)

## 1. Introduction

Maternal emergency care pathways in low-resource contexts often suffer from coordination failures that delay transport and treatment. This proposal presents SMERS as a full-stack software intervention for improving the speed, transparency, and consistency of emergency dispatch operations.

## 2. Problem Definition

Emergency response operations for maternal cases are frequently limited by fragmented communication, weak triage standardization, and limited real-time operational visibility. The result is prolonged dispatch time and poor case-level accountability.

## 3. Aim and Objectives

### Aim

To design, implement, and evaluate a software prototype that improves maternal emergency dispatch coordination in resource-constrained settings.

### Specific Objectives

1. Build a web platform supporting dispatcher and administrator workflows.
2. Implement API endpoints for incident intake, responder management, assignment, and reporting.
3. Provide map-based situational awareness of incidents and responder movement.
4. Evaluate workflow performance using simulation-based operational metrics.
5. Document limitations and an evidence-based roadmap toward deployment readiness.

## 4. Research Questions

1. Can a centralized dispatch dashboard reduce operational friction in emergency case handling?
2. How effectively does nearest-available assignment perform under simulated queue pressure?
3. Which operational metrics are most sensitive to improvements in dispatch coordination?

## 5. Methodology

### 5.1 Research Design

The study uses a design-and-build approach with simulation-based evaluation:

1. requirements synthesis from public health operations context;
2. iterative implementation of backend and frontend modules;
3. controlled simulation of emergency events;
4. metric-based analysis of dispatch and completion patterns.

### 5.2 System Development Approach

An incremental agile approach is used:

1. phase 1: core data model and API services;
2. phase 2: dispatcher interface and queue operations;
3. phase 3: live map tracking and responder workflow;
4. phase 4: admin reporting and user management;
5. phase 5: stabilization, documentation, and evaluation.

### 5.3 Technology Stack

1. frontend: React, Material UI, React Router, Leaflet;
2. backend: Node.js, Express;
3. database: PostgreSQL;
4. tooling: npm, Git, GitHub.

## 6. Proposed System Features

1. incident capture with triage score;
2. pending queue and dispatch controls;
3. nearest-responder assignment workflow;
4. map-based monitoring of live operations;
5. completed mission and payment reporting;
6. user administration and profile management.

## 7. Data Requirements

### Core Entities

1. incidents;
2. responders;
3. users;
4. payment logs.

### Key Attributes

1. incident priority, location, timestamp, and status;
2. responder availability and coordinates;
3. role and account status for users;
4. transaction amounts and payment status.

## 8. Evaluation Plan

### Metrics

1. average dispatch latency;
2. queue aging by priority level;
3. responder utilization rate;
4. mission completion ratio;
5. time from alert creation to case closure.

### Procedure

1. run repeated simulation sessions with mixed priority events;
2. capture API and dashboard outcomes;
3. aggregate metrics by scenario;
4. compare against baseline expectations and identify bottlenecks.

## 9. Risk Analysis and Mitigation

1. Data quality risk: enforce input validation and schema constraints.
2. Operational realism risk: use scenario diversity and event load variation.
3. Security risk: document and prioritize hardening roadmap (auth, secrets, RBAC).
4. Scope risk: enforce MVP boundaries and defer non-critical integrations.

## 10. Ethical and Practical Considerations

1. This version is simulation-focused and not approved for clinical deployment.
2. No personally identifying real patient data is required for evaluation runs.
3. Any future field deployment must comply with ethical review and health data governance standards.

## 11. Work Plan and Timeline

1. Weeks 1-2: requirements and conceptual modeling.
2. Weeks 3-5: backend API and database integration.
3. Weeks 6-8: frontend implementation and role workflows.
4. Weeks 9-10: simulation tuning, bug fixing, and usability polish.
5. Weeks 11-12: evaluation, documentation, and final defense package.

## 12. Deliverables

1. source code repository with reproducible setup;
2. API and architecture documentation;
3. concept paper, proposal, and final thesis;
4. evaluation report with metric summaries;
5. presentation-ready demonstration workflow.

## 13. Expected Contribution

The project contributes a practical demonstration of how software engineering can support emergency maternal transport coordination and provides an extensible basis for future research and deployment adaptation.
