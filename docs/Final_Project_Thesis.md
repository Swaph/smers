# Final Project Thesis

## Title

Smart Maternal Emergency Response System (SMERS): Design, Implementation, and Evaluation of a Real-Time Maternal Emergency Dispatch Prototype

## Abstract

This thesis presents the design and implementation of the Smart Maternal Emergency Response System (SMERS), a full-stack prototype intended to improve coordination for maternal emergency transport in resource-constrained settings. The system integrates emergency intake, triage-aware incident management, responder assignment, geospatial operations monitoring, and administrative reporting.

The implementation uses a React frontend, a Node.js/Express backend, and PostgreSQL for persistent data management. A simulation workflow was used to generate incident load and evaluate operational behavior. Results demonstrate that centralized incident visibility and automated assignment logic can support consistent dispatch operations and improve workflow traceability. The thesis concludes with system limitations and a roadmap toward production readiness.

## Chapter 1: Introduction

### 1.1 Background

Maternal emergency response requires coordinated action across multiple actors under severe time constraints. In many settings, coordination is constrained by fragmented communication and insufficient live operational visibility.

### 1.2 Problem Statement

Existing emergency response workflows are vulnerable to delayed assignment, weak prioritization consistency, and limited post-incident analytics. These constraints reduce responsiveness and hinder evidence-driven system improvement.

### 1.3 Aim

To develop and evaluate a prototype platform that centralizes maternal emergency dispatch operations and supports measurable performance improvements in simulation scenarios.

### 1.4 Objectives

1. build a full-stack maternal emergency dispatch platform;
2. implement incident lifecycle management and responder assignment;
3. provide map-based visibility of operations;
4. support reporting and user administration;
5. evaluate dispatch workflow performance under simulation.

### 1.5 Significance

The study contributes both practical and academic value by demonstrating a replicable software architecture for emergency coordination and by producing evaluable operational metrics relevant to maternal health logistics.

## Chapter 2: Literature and Conceptual Basis

### 2.1 Emergency Response Coordination

Prior coordination models show that reducing communication delays and improving allocation visibility are key to response quality. Digital operations dashboards have been used in other emergency domains to support decision-making and accountability.

### 2.2 Relevance to Maternal Emergencies

Maternal cases often involve rapid clinical deterioration, making transport and handoff speed critical. Software-supported dispatch can help reduce avoidable coordination latency.

### 2.3 Conceptual Framework

The framework underlying SMERS is event-to-resolution orchestration:

1. incident intake;
2. triage and queueing;
3. responder assignment;
4. transit tracking;
5. closure and reporting.

## Chapter 3: System Analysis and Design

### 3.1 Requirements Analysis

Functional requirements include incident creation, queue management, responder retrieval, assignment handling, mission history, payment logs, and user administration.

Non-functional requirements include reliability, maintainability, basic security hygiene, and reproducibility for demonstration and evaluation.

### 3.2 Architecture

1. Presentation layer: React dashboards for dispatcher and administrator workflows.
2. Application layer: Express REST API for incident, responder, report, and user operations.
3. Data layer: PostgreSQL-backed persistence via parameterized queries.

### 3.3 Data Model

Primary entities:

1. incidents;
2. responders;
3. users;
4. payment_logs.

Relationships are centered around incident assignment and closure workflows, with optional linkage to payment records.

### 3.4 Process Flow

1. incident is created and marked pending;
2. nearest available responder is selected and assigned;
3. status transitions through dispatched and transport phases;
4. mission closes and is recorded for reporting.

## Chapter 4: Implementation

### 4.1 Backend Implementation

The backend includes:

1. input validation for key payloads;
2. normalized status and role checks;
3. ID validation and robust error responses;
4. health endpoints for platform and database checks.

### 4.2 Frontend Implementation

The frontend provides:

1. role-based route navigation;
2. live emergency queue and dispatch controls;
3. geospatial dashboard with responder and incident markers;
4. administrative views for analytics, payments, and user management.

### 4.3 Configuration and DevOps Readiness

1. environment template files for backend and frontend;
2. configurable API URL for environment portability;
3. repository documentation structured for review and publication.

## Chapter 5: Testing and Evaluation

### 5.1 Test Strategy

The evaluation emphasized functional and workflow validation through simulation runs:

1. incident creation and queue propagation;
2. dispatch assignment behavior under concurrent pending events;
3. status progression and mission closure;
4. user management CRUD behavior;
5. dashboard and report consistency checks.

### 5.2 Observed Outcomes

1. centralized dashboards improved operator visibility into active incidents;
2. nearest-available assignment offered a practical baseline allocation strategy;
3. mission history and payment views supported basic auditability;
4. input validation reduced avoidable API misuse.

### 5.3 Discussion

The prototype demonstrates clear workflow gains relative to unstructured coordination. However, optimization quality depends on data fidelity, and future versions should incorporate stronger security controls and operational integrations.

## Chapter 6: Conclusion and Recommendations

### 6.1 Conclusion

SMERS successfully demonstrates the feasibility of a software-centered maternal emergency dispatch workflow. The implemented MVP integrates key operational functions and produces useful telemetry for performance review in simulated settings.

### 6.2 Recommendations

1. implement secure authentication and RBAC for production contexts;
2. add audit logging and policy-grade data governance controls;
3. integrate external intake channels (USSD, SMS, WhatsApp);
4. evaluate advanced assignment algorithms beyond nearest-distance heuristics;
5. conduct field-informed pilots with ethical and regulatory oversight.

## Limitations

1. simulation context only; no live clinical deployment;
2. no production identity and secrets management stack;
3. limited automated test coverage in the current repository;
4. no direct integration with emergency call infrastructure yet.

## References (Indicative)

1. World Health Organization reports on maternal mortality and emergency obstetric care.
2. Regional public health policy documentation on referral transport systems.
3. Peer-reviewed studies on emergency dispatch optimization and digital health operations.
4. Official technical documentation for React, Express, PostgreSQL, and Leaflet.

## Appendices

### Appendix A: Repository and Setup

See [README](../README.md) for setup, architecture summary, and API references.

### Appendix B: API Endpoint Summary

1. GET /api/health
2. GET /api/test-db
3. GET /api/responders
4. GET /api/requests
5. POST /api/requests
6. PUT /api/requests/:id/assign
7. GET /api/reports/completed
8. GET /api/payments
9. GET /api/users
10. POST /api/users
11. PUT /api/users/:id
12. DELETE /api/users/:id
