import re


def normalize_text(text):
    """
    Convert text into a normalized lowercase format
    for reliable matching.
    """
    if not text:
        return ""

    return re.sub(r"\s+", " ", text.lower()).strip()


def parse_job_skills(job):
    """
    Convert comma-separated job skills into a clean list.
    """
    if not job.skills:
        return []

    return [
        skill.strip()
        for skill in job.skills.split(",")
        if skill.strip()
    ]


def skill_exists_in_resume(skill, resume_text):
    """
    Check whether a skill appears in the resume text.
    """

    normalized_skill = normalize_text(skill)

    if not normalized_skill:
        return False

    pattern = rf"(?<!\w){re.escape(normalized_skill)}(?!\w)"

    return re.search(
        pattern,
        resume_text,
        re.IGNORECASE,
    ) is not None


def calculate_skill_match(job, resume):
    """
    Compare job-required skills against the resume.
    """

    resume_text = normalize_text(resume.parsed_text)

    job_skills = parse_job_skills(job)

    matching_skills = []
    missing_skills = []

    for skill in job_skills:

        if skill_exists_in_resume(
            skill,
            resume_text,
        ):
            matching_skills.append(skill)
        else:
            missing_skills.append(skill)

    total_skills = len(job_skills)

    if total_skills == 0:
        skill_score = 0
    else:
        skill_score = (
            len(matching_skills) / total_skills
        ) * 100

    return {
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "skill_score": round(skill_score, 2),
    }


def calculate_experience_match(job, resume):
    """
    Estimate experience alignment between the job
    and the candidate resume.

    This is intentionally deterministic for v1.
    LLM-based reasoning will be added later.
    """

    job_requirement = normalize_text(
        job.experience_required
    )

    resume_text = normalize_text(
        resume.parsed_text
    )

    if not job_requirement:
        return {
            "experience_score": 100,
            "experience_alignment": "Not specified",
        }

    # Entry-level / fresher positions
    entry_level_keywords = [
        "fresher",
        "0-1",
        "0 to 1",
        "entry level",
        "entry-level",
        "junior",
    ]

    if any(
        keyword in job_requirement
        for keyword in entry_level_keywords
    ):
        experience_keywords = [
            "intern",
            "internship",
            "fresher",
            "graduate",
            "developer",
            "experience",
        ]

        if any(
            keyword in resume_text
            for keyword in experience_keywords
        ):
            return {
                "experience_score": 100,
                "experience_alignment": "Strong alignment",
            }

        return {
            "experience_score": 70,
            "experience_alignment": "Potential alignment",
        }

    # General experience check
    numbers = re.findall(
        r"\d+(?:\.\d+)?",
        job_requirement,
    )

    if numbers:
        required_years = float(numbers[0])

        year_pattern = r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)"

        resume_years = re.findall(
            year_pattern,
            resume_text,
        )

        if resume_years:
            candidate_years = max(
                float(year)
                for year in resume_years
            )

            if candidate_years >= required_years:
                return {
                    "experience_score": 100,
                    "experience_alignment": "Strong alignment",
                }

            if candidate_years >= required_years * 0.5:
                return {
                    "experience_score": 70,
                    "experience_alignment": "Partial alignment",
                }

            return {
                "experience_score": 40,
                "experience_alignment": "Limited alignment",
            }

    return {
        "experience_score": 60,
        "experience_alignment": "Requires further review",
    }


def calculate_match_score(
    skill_score,
    experience_score,
):
    """
    Calculate the weighted overall match score.

    Skills: 70%
    Experience: 30%
    """

    final_score = (
        (skill_score * 0.70)
        + (experience_score * 0.30)
    )

    return round(final_score, 2)

def generate_strengths(
    matching_skills,
    experience_alignment,
):
    """
    Generate deterministic strengths based on
    the matching results.
    """

    strengths = []

    if matching_skills:
        strengths.append(
            f"Strong alignment with required skills: "
            f"{', '.join(matching_skills)}."
        )

    if experience_alignment == "Strong alignment":
        strengths.append(
            "Candidate experience aligns well with "
            "the job requirement."
        )

    elif experience_alignment == "Partial alignment":
        strengths.append(
            "Candidate has some relevant experience "
            "for the position."
        )

    if not strengths:
        strengths.append(
            "Candidate profile contains some relevant "
            "information for this position."
        )

    return strengths


def generate_suggestions(
    missing_skills,
):
    """
    Generate suggestions based on missing skills.
    """

    suggestions = []

    for skill in missing_skills:
        suggestions.append(
            f"Highlight or strengthen {skill} experience "
            f"in the resume."
        )

    if not missing_skills:
        suggestions.append(
            "Resume covers the listed job skills well."
        )

    return suggestions

def build_match_analysis(job, resume):
    """
    Build the complete rule-based match analysis
    for a job and candidate resume.
    """

    skill_result = calculate_skill_match(
        job,
        resume,
    )

    experience_result = calculate_experience_match(
        job,
        resume,
    )

    final_score = calculate_match_score(
        skill_result["skill_score"],
        experience_result["experience_score"],
    )

    strengths = generate_strengths(
        skill_result["matching_skills"],
        experience_result["experience_alignment"],
    )

    suggestions = generate_suggestions(
        skill_result["missing_skills"],
    )

    return {
        "match_score": final_score,
        "matching_skills": skill_result[
            "matching_skills"
        ],
        "missing_skills": skill_result[
            "missing_skills"
        ],
        "experience_alignment": experience_result[
            "experience_alignment"
        ],
        "strengths": strengths,
        "suggestions": suggestions,
        "analysis_method": "RULE_BASED_V1",
    }

from .models import MatchAnalysis


def save_match_analysis(application):
    """
    Generate and save the match analysis for an application.

    If an analysis already exists, update it instead of
    creating a duplicate record.
    """

    if not application.resume:
        raise ValueError(
            "This application does not have a resume."
        )

    analysis = build_match_analysis(
        application.job,
        application.resume,
    )

    match_analysis, created = MatchAnalysis.objects.update_or_create(
        application=application,
        defaults={
            "match_score": analysis["match_score"],
            "matching_skills": analysis["matching_skills"],
            "missing_skills": analysis["missing_skills"],
            "experience_alignment": analysis[
                "experience_alignment"
            ],
            "strengths": analysis["strengths"],
            "suggestions": analysis["suggestions"],
            "analysis_method": analysis["analysis_method"],
        },
    )

    return match_analysis, created