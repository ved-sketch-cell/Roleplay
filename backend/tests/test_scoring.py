import math

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.models import Profile
from app.recommendations import jaccard, similarity_score
from app.schemas import ProfileUpdate, RecommendationFilters, normalize_tags


def profile(**values):
    defaults = dict(
        interests=["design", "technology"],
        goals=["learn together"],
        languages=["english"],
        contact_modes=["text"],
        communication_style="casual",
        interaction_preference="one-on-one",
    )
    return Profile(**(defaults | values))


@pytest.mark.parametrize(
    "first,second,expected",
    [
        ([], [], 0),
        (["design"], ["design"], 1),
        (["design"], ["science"], 0),
        (["design", "science"], ["design"], 0.5),
        (["design", "design"], ["design"], 1),
    ],
)
def test_set_similarity(first, second, expected):
    assert jaccard(first, second) == expected


def test_perfect_preferences_and_missing_dimensions():
    assert math.isclose(similarity_score(profile(), profile()), 100)
    sparse = profile(goals=[], communication_style="flexible", interaction_preference="flexible")
    assert math.isclose(similarity_score(sparse, sparse), 100)
    assert similarity_score(profile(), profile(goals=[], interests=["design"])) < 100


def test_unicode_case_and_duplicates_are_normalized():
    assert normalize_tags([" Design ", "DESIGN", "Ｔｅｃｈｎｏｌｏｇｙ"]) == ["design", "technology"]
    assert ProfileUpdate(interests=[" AI ", "ai"]).interests == ["ai"]


@pytest.mark.parametrize(
    "arguments",
    [
        {"limit": 0},
        {"limit": 21},
        {"limit": True},
        {"limit": "10"},
        {"min_score": 101},
        {"user_id": "someone-else"},
        {"interests": []},
        {"interests": [" "]},
    ],
)
def test_tool_rejects_unbounded_or_impersonating_arguments(arguments):
    with pytest.raises(ValidationError):
        RecommendationFilters(**arguments)


def test_production_requires_secure_cookie_and_explicit_origins():
    with pytest.raises(ValidationError):
        Settings(
            database_url="postgresql+psycopg://test:test@localhost/roleplay",
            jwt_secret="x" * 40,
            environment="production",
            cookie_secure=False,
        )
    with pytest.raises(ValidationError):
        Settings(
            database_url="postgresql+psycopg://test:test@localhost/roleplay", jwt_secret="x" * 40, cors_origins=["*"]
        )
