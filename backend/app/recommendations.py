from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import Text, and_, case, cast, exists, func, literal, or_, select
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Block, Feedback, Profile, User
from .schemas import RecommendationFilters, Recommendations, UserMatch

WEIGHTS = {"interests": 0.55, "goals": 0.20, "languages": 0.10, "communication": 0.10, "interaction": 0.05}


async def my_profile(db: AsyncSession, user_id: UUID) -> Profile:
    profile = await db.get(Profile, user_id)
    if profile is None:
        raise HTTPException(404, "Profile not found")
    return profile


def jaccard(first: list[str], second: list[str]) -> float:
    """Reference implementation used to verify the PostgreSQL scoring function."""
    a, b = set(first), set(second)
    return len(a & b) / len(a | b) if a or b else 0.0


def similarity_score(first: Profile, second: Profile) -> float:
    parts = [
        (WEIGHTS["interests"], jaccard(first.interests, second.interests)),
        (WEIGHTS["languages"], jaccard(first.languages, second.languages)),
    ]
    if first.goals:
        parts.append((WEIGHTS["goals"], jaccard(first.goals, second.goals)))
    if first.communication_style != "flexible":
        parts.append(
            (WEIGHTS["communication"], float(second.communication_style in {first.communication_style, "flexible"}))
        )
    if first.interaction_preference != "flexible":
        parts.append(
            (WEIGHTS["interaction"], float(second.interaction_preference in {first.interaction_preference, "flexible"}))
        )
    return 100 * sum(weight * value for weight, value in parts) / sum(weight for weight, _ in parts)


def sql_score(viewer: Profile):
    def overlap(column, values):
        return func.roleplay_jaccard(column, cast(values, ARRAY(Text)))

    parts = [
        (WEIGHTS["interests"], overlap(Profile.interests, viewer.interests)),
        (WEIGHTS["languages"], overlap(Profile.languages, viewer.languages)),
    ]
    if viewer.goals:
        parts.append((WEIGHTS["goals"], overlap(Profile.goals, viewer.goals)))
    if viewer.communication_style != "flexible":
        parts.append(
            (
                WEIGHTS["communication"],
                case((Profile.communication_style.in_([viewer.communication_style, "flexible"]), 1.0), else_=0.0),
            )
        )
    if viewer.interaction_preference != "flexible":
        parts.append(
            (
                WEIGHTS["interaction"],
                case((Profile.interaction_preference.in_([viewer.interaction_preference, "flexible"]), 1.0), else_=0.0),
            )
        )
    return 100 * sum((weight * value for weight, value in parts), literal(0.0)) / sum(weight for weight, _ in parts)


def eligible_conditions(viewer: Profile):
    blocked = exists(
        select(Block.user_id).where(
            or_(
                and_(Block.user_id == viewer.user_id, Block.target_id == Profile.user_id),
                and_(Block.target_id == viewer.user_id, Block.user_id == Profile.user_id),
            )
        )
    )
    dismissed = exists(
        select(Feedback.user_id).where(
            Feedback.action == "dismiss",
            or_(
                and_(Feedback.user_id == viewer.user_id, Feedback.target_id == Profile.user_id),
                and_(Feedback.target_id == viewer.user_id, Feedback.user_id == Profile.user_id),
            ),
        )
    )
    return [
        Profile.user_id != viewer.user_id,
        Profile.discoverable.is_(True),
        User.active.is_(True),
        Profile.interests.overlap(viewer.interests),
        Profile.languages.overlap(viewer.languages),
        Profile.contact_modes.overlap(viewer.contact_modes),
        ~blocked,
        ~dismissed,
    ]


def ensure_discovery(viewer: Profile) -> None:
    if not viewer.discoverable:
        raise HTTPException(403, "Opt into discovery in your preferences before finding people")


async def ensure_eligible_target(db: AsyncSession, viewer: Profile, target_id: UUID) -> None:
    ensure_discovery(viewer)
    target = await db.scalar(
        select(Profile.user_id)
        .join(User, User.id == Profile.user_id)
        .where(*eligible_conditions(viewer), Profile.user_id == target_id)
    )
    if target is None:
        raise HTTPException(404, "This connection is no longer available")


async def recommend(db: AsyncSession, user_id: UUID, filters: RecommendationFilters) -> Recommendations:
    viewer = await my_profile(db, user_id)
    ensure_discovery(viewer)
    if not viewer.interests:
        return Recommendations(matches=[], message="Add at least one interest to find people with shared preferences")
    if filters.interests and not set(filters.interests).issubset(viewer.interests):
        raise HTTPException(422, "Recommendation filters must use your declared interests")
    score = sql_score(viewer)
    query = (
        select(Profile, score.label("similarity"))
        .join(User, User.id == Profile.user_id)
        .where(*eligible_conditions(viewer), score >= filters.min_score)
    )
    if filters.interests:
        query = query.where(Profile.interests.overlap(filters.interests))
    # Rank in PostgreSQL before LIMIT, so a later UUID can still be the best match.
    rows = (await db.execute(query.order_by(score.desc(), Profile.user_id.asc()).limit(filters.limit))).all()
    matches = []
    for candidate, value in rows:
        interests = sorted(set(viewer.interests) & set(candidate.interests))
        goals = sorted(set(viewer.goals) & set(candidate.goals))
        languages = sorted(set(viewer.languages) & set(candidate.languages))
        modes = sorted(set(viewer.contact_modes) & set(candidate.contact_modes))
        reasons = ["Shared interests: " + ", ".join(interests[:3]), "Shared language: " + ", ".join(languages)]
        if goals:
            reasons.append("Shared goals: " + ", ".join(goals[:2]))
        if viewer.communication_style != "flexible" and candidate.communication_style in {
            viewer.communication_style,
            "flexible",
        }:
            reasons.append("Compatible declared communication preference")
        matches.append(
            UserMatch(
                user_id=candidate.user_id,
                display_name=candidate.display_name,
                bio=candidate.bio,
                avatar=candidate.avatar,
                similarity_score=round(float(value), 1),
                shared_interests=interests,
                shared_goals=goals,
                shared_languages=languages,
                compatible_contact_modes=modes,
                reasons=reasons,
            )
        )
    return Recommendations(
        matches=matches,
        message=None
        if matches
        else "No eligible matches yet. Try broader filters or check back when more people join.",
    )
