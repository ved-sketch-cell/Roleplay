from uuid import UUID

import pytest
from sqlalchemy import select, text

from app.db import SessionLocal
from app.models import Feedback, Profile, RefreshSession, User
from app.recommendations import similarity_score
from app.schemas import RecommendationFilters
from tests.helpers import PASSWORD, account, bearer

PREFERENCES = dict(
    discoverable=True,
    interests=["design", "technology"],
    goals=["learn together"],
    languages=["english"],
    contact_modes=["text"],
    communication_style="casual",
    interaction_preference="one-on-one",
)


async def test_registration_privacy_and_auth_validation(client):
    token, profile = await account(client, "explorer")
    assert profile["discoverable"] is False
    assert "email" not in profile and "password_hash" not in profile
    assert (await client.get("/v1/me/profile")).status_code == 401
    rejected_password = "Oops!"
    response = await client.post(
        "/v1/auth/register",
        json={"email": "bad@example.com", "password": rejected_password, "display_name": "Explorer"},
    )
    assert response.status_code == 422
    assert rejected_password not in response.text
    assert all("input" not in item for item in response.json()["detail"])
    assert (await client.patch("/v1/me/profile", headers=bearer(token), json={"display_name": "  "})).status_code == 422
    assert (await client.patch("/v1/me/profile", headers=bearer(token), json={"user_id": "other"})).status_code == 422
    response = await client.get("/v1/recommendations", headers=bearer(token))
    assert response.status_code == 403


async def test_csrf_origin_and_password_login(client):
    await account(client, "fox")
    body = {"email": "fox@example.com", "password": PASSWORD}
    assert (
        await client.post("/v1/auth/login", json=body, headers={"Origin": "https://attacker.example"})
    ).status_code == 403
    client.headers.pop("X-Roleplay-CSRF")
    assert (await client.post("/v1/auth/login", json=body)).status_code == 403
    client.headers["X-Roleplay-CSRF"] = "1"
    assert (await client.post("/v1/auth/login", json=body | {"password": "wrong"})).status_code == 401
    assert (await client.post("/v1/auth/login", json=body)).status_code == 200


async def test_refresh_rotation_replay_and_immediate_logout(client):
    old_token, _ = await account(client, "orbit")
    old_cookie = client.cookies.get("roleplay_refresh")
    response = await client.post("/v1/auth/refresh")
    assert response.status_code == 200
    fresh_token = response.json()["access_token"]
    assert client.cookies.get("roleplay_refresh") != old_cookie
    assert (await client.get("/v1/me/profile", headers=bearer(old_token))).status_code == 401
    assert (await client.get("/v1/me/profile", headers=bearer(fresh_token))).status_code == 200
    replay = await client.post("/v1/auth/refresh", headers={"Cookie": f"roleplay_refresh={old_cookie}"})
    assert replay.status_code == 401
    assert (await client.get("/v1/me/profile", headers=bearer(fresh_token))).status_code == 401
    login = await client.post("/v1/auth/login", json={"email": "orbit@example.com", "password": PASSWORD})
    token = login.json()["access_token"]
    assert (await client.post("/v1/auth/logout", headers=bearer(token))).status_code == 204
    assert (await client.get("/v1/me/profile", headers=bearer(token))).status_code == 401


async def test_exact_database_ranking_and_query_bounds(client):
    viewer_token, viewer = await account(client, "viewer", **PREFERENCES)
    _, partial = await account(client, "partial", **(PREFERENCES | {"interests": ["design", "science"], "goals": []}))
    _, perfect = await account(client, "perfect", **PREFERENCES)
    response = await client.get("/v1/recommendations?limit=1", headers=bearer(viewer_token))
    assert response.status_code == 200, response.text
    match = response.json()["matches"][0]
    assert match["user_id"] == perfect["user_id"]
    assert match["similarity_score"] == 100
    exact = await client.get("/v1/recommendations?min_score=100", headers=bearer(viewer_token))
    assert [item["user_id"] for item in exact.json()["matches"]] == [perfect["user_id"]]
    assert "email" not in response.text and "password" not in response.text
    assert (await client.get("/v1/recommendations?limit=21", headers=bearer(viewer_token))).status_code == 422
    async with SessionLocal() as db:
        first = await db.get(Profile, UUID(viewer["user_id"]))
        second = await db.get(Profile, UUID(partial["user_id"]))
        expected = round(similarity_score(first, second), 1)
    response = await client.post(
        "/v1/tools/recommend-users", headers=bearer(viewer_token), json={"limit": 20, "min_score": 0, "interests": None}
    )
    scores = {match["user_id"]: match["similarity_score"] for match in response.json()["matches"]}
    assert scores[partial["user_id"]] == expected
    assert (
        await client.post("/v1/tools/recommend-users", headers=bearer(viewer_token), json={"interests": ["undeclared"]})
    ).status_code == 422


async def test_hidden_incompatible_and_self_profiles_are_filtered(client):
    token, me = await account(client, "caller", **PREFERENCES)
    _, visible = await account(client, "visible", **PREFERENCES)
    await account(client, "hidden", **(PREFERENCES | {"discoverable": False}))
    await account(client, "different-language", **(PREFERENCES | {"languages": ["french"]}))
    await account(client, "different-mode", **(PREFERENCES | {"contact_modes": ["audio"]}))
    await account(client, "different-interest", **(PREFERENCES | {"interests": ["gardening"]}))
    response = await client.get("/v1/recommendations", headers=bearer(token))
    assert [match["user_id"] for match in response.json()["matches"]] == [visible["user_id"]]
    assert me["user_id"] not in response.text


async def test_bidirectional_blocks_dismissals_and_opt_out(client):
    first_token, first = await account(client, "first", **PREFERENCES)
    second_token, second = await account(client, "second", **PREFERENCES)
    assert (await client.put(f"/v1/blocks/{first['user_id']}", headers=bearer(second_token))).status_code == 204
    assert (await client.get("/v1/recommendations", headers=bearer(first_token))).json()["matches"] == []
    assert (await client.delete(f"/v1/blocks/{first['user_id']}", headers=bearer(second_token))).status_code == 204
    assert (
        await client.post(
            "/v1/recommendations/feedback",
            headers=bearer(first_token),
            json={"target_id": second["user_id"], "action": "dismiss"},
        )
    ).status_code == 204
    assert (await client.get("/v1/recommendations", headers=bearer(second_token))).json()["matches"] == []
    await client.delete(f"/v1/recommendations/feedback/{second['user_id']}", headers=bearer(first_token))
    await client.patch("/v1/me/profile", headers=bearer(second_token), json={"discoverable": False})
    assert (await client.get("/v1/recommendations", headers=bearer(first_token))).json()["matches"] == []
    assert (
        await client.post(
            "/v1/recommendations/feedback",
            headers=bearer(first_token),
            json={"target_id": second["user_id"], "action": "interested"},
        )
    ).status_code == 404


async def test_export_and_account_deletion_cascade(client):
    token, profile = await account(client, "owner", **PREFERENCES)
    _, other = await account(client, "peer", **PREFERENCES)
    await client.post(
        "/v1/recommendations/feedback",
        headers=bearer(token),
        json={"target_id": other["user_id"], "action": "interested"},
    )
    await client.put(f"/v1/blocks/{other['user_id']}", headers=bearer(token))
    exported = await client.get("/v1/me/export", headers=bearer(token))
    assert exported.json()["account"]["email"] == "owner@example.com"
    assert "token_hash" not in exported.text and "password_hash" not in exported.text
    assert exported.headers["cache-control"] == "no-store"
    assert (
        await client.request("DELETE", "/v1/me", headers=bearer(token), json={"password": "wrong"})
    ).status_code == 403
    assert (
        await client.request("DELETE", "/v1/me", headers=bearer(token), json={"password": PASSWORD})
    ).status_code == 204
    user_id = UUID(profile["user_id"])
    async with SessionLocal() as db:
        assert await db.get(User, user_id) is None
        assert await db.get(Profile, user_id) is None
        assert await db.scalar(select(RefreshSession.id).where(RefreshSession.user_id == user_id)) is None
        assert await db.scalar(select(Feedback.user_id).where(Feedback.user_id == user_id)) is None
    assert (await client.get("/v1/me/profile", headers=bearer(token))).status_code == 401


async def test_ai_tool_authorization_and_consent(client, monkeypatch):
    from app import routes

    token, _ = await account(client, "tool-owner", **PREFERENCES)
    _, peer = await account(client, "tool-peer", **PREFERENCES)
    malicious = await client.post(
        "/v1/tools/recommend-users", headers=bearer(token), json={"user_id": peer["user_id"], "limit": 10}
    )
    assert malicious.status_code == 422
    assert (await client.post("/v1/tools/recommend-users", json={})).status_code == 401
    prompt = {"prompt": "Find one person who likes design"}
    assert (await client.post("/v1/ai/recommendations", headers=bearer(token), json=prompt)).status_code == 403
    seen = []

    async def interpret(value, profile):
        seen.append(profile.user_id)
        return RecommendationFilters(limit=1, interests=["design"])

    monkeypatch.setattr(routes, "interpret_request", interpret)
    response = await client.post(
        "/v1/ai/recommendations", headers=bearer(token), json=prompt | {"share_preferences_with_ai": True}
    )
    assert response.status_code == 200, response.text
    assert response.json()["matches"][0]["user_id"] == peer["user_id"]
    assert len(seen) == 1


async def test_postgres_jaccard_handles_duplicates_and_empty_sets(client):
    async with SessionLocal() as db:
        assert await db.scalar(text("SELECT roleplay_jaccard(ARRAY[]::text[], ARRAY[]::text[])")) == 0
        assert await db.scalar(text("SELECT roleplay_jaccard(ARRAY['a','a'], ARRAY['a'])")) == 1
        assert await db.scalar(text("SELECT roleplay_jaccard(ARRAY['a','b'], ARRAY['b','c'])")) == pytest.approx(1 / 3)


async def test_database_rate_limit_counter(client, monkeypatch):
    from app.config import get_settings
    from app.rate_limit import enforce_limit

    settings = get_settings()
    monkeypatch.setattr(settings, "rate_limits_enabled", True)
    await enforce_limit("test-subject", limit=2)
    await enforce_limit("test-subject", limit=2)
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as error:
        await enforce_limit("test-subject", limit=2)
    assert error.value.status_code == 429
    assert int(error.value.headers["Retry-After"]) > 0
