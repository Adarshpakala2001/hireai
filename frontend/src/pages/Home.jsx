import {
  ArrowRight,
  Brain,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Recruitment Platform
          </div>

          <h1>
            Hire smarter.
            <br />
            <span>Build better teams.</span>
          </h1>

          <p className="hero-description">
            HireAI helps recruiters and candidates streamline the hiring
            process with intelligent job descriptions, resume analysis,
            candidate matching, and recruitment workflows.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Get Started
              <ArrowRight size={18} />
            </Link>

            <a href="#features" className="secondary-button">
              Explore Features
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Resume Analysis</span>
            </div>

            <div>
              <strong>ATS</strong>
              <span>Smart Matching</span>
            </div>

            <div>
              <strong>API</strong>
              <span>Modern Architecture</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="ai-card">
            <div className="ai-card-header">
              <div className="ai-icon">
                <Brain size={24} />
              </div>

              <div>
                <strong>HireAI Analysis</strong>
                <span>Resume ↔ Job Match</span>
              </div>
            </div>

            <div className="match-score">
              <div className="score-circle">
                <span>87%</span>
              </div>

              <div>
                <strong>Strong Match</strong>
                <p>Skills align with the job requirements.</p>
              </div>
            </div>

            <div className="skill-list">
              <span>Python</span>
              <span>Django</span>
              <span>REST API</span>
              <span>SQL</span>
              <span>Git</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="section-heading">
          <span>FEATURES</span>
          <h2>Everything you need for modern recruitment</h2>
          <p>
            A unified platform for managing jobs, candidates, resumes, and
            AI-assisted recruitment workflows.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon={<FileSearch size={24} />}
            title="Resume Analysis"
            description="Extract and analyze resume content to understand candidate skills and experience."
          />

          <FeatureCard
            icon={<Brain size={24} />}
            title="AI Job Descriptions"
            description="Generate structured and professional job descriptions using AI assistance."
          />

          <FeatureCard
            icon={<BarChart3 size={24} />}
            title="Smart Matching"
            description="Compare candidate resumes with job requirements and surface relevant matches."
          />

          <FeatureCard
            icon={<Users size={24} />}
            title="Candidate Management"
            description="Manage candidate profiles, applications, resumes, and recruitment activity."
          />

          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Secure Authentication"
            description="JWT-based authentication with separate candidate and recruiter access."
          />

          <FeatureCard
            icon={<Sparkles size={24} />}
            title="AI-Assisted Workflows"
            description="Use AI as decision support while keeping recruitment decisions under human control."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section workflow-section">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>A simple recruitment workflow</h2>
        </div>

        <div className="workflow-grid">
          <WorkflowStep
            number="01"
            title="Create a Job"
            description="Recruiters create and manage structured job requirements."
          />

          <WorkflowStep
            number="02"
            title="Upload Resume"
            description="Candidates create profiles and upload PDF or DOCX resumes."
          />

          <WorkflowStep
            number="03"
            title="Analyze & Match"
            description="HireAI extracts resume information and compares it with job requirements."
          />

          <WorkflowStep
            number="04"
            title="Manage Applications"
            description="Recruiters review applications and candidates through one platform."
          />
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="section technology-section">
        <div className="section-heading">
          <span>TECHNOLOGY</span>
          <h2>Built with a modern engineering stack</h2>
        </div>

        <div className="tech-list">
          <span>Python</span>
          <span>Django</span>
          <span>Django REST Framework</span>
          <span>React</span>
          <span>PostgreSQL</span>
          <span>JWT</span>
          <span>AI / LLM APIs</span>
          <span>Git & GitHub</span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div>
          <span>START WITH HIREAI</span>
          <h2>Build a smarter recruitment workflow.</h2>
          <p>
            Explore the platform as a candidate or recruiter.
          </p>
        </div>

        <Link to="/register" className="primary-button">
          Create Account
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <article className="workflow-step">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export default Home;