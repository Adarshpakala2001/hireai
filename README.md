# HireAI – AI-Powered HR & Recruitment Management System

Full-stack recruitment platform with Admin/Recruiter and Candidate portals.

## Planned stack
- Backend: Python, Django, Django REST Framework
- Frontend: React.js
- Database: PostgreSQL (SQLite for initial local development if preferred)
- AI: LLM API for JD briefing, JD generation, and resume/JD analysis
- Auth: JWT or secure session authentication

## Repository structure
```text
hireai/
├── backend/
├── frontend/
├── docs/
├── .env.example
└── README.md
```

## Build order
1. Foundation and environment
2. Authentication + role-based access
3. Job Description management
4. Candidate profiles + resume upload
5. Job applications
6. AI JD briefing/generation
7. Resume parsing + JD match analysis
8. Admin/candidate dashboards
9. Security hardening + testing
10. Deployment
