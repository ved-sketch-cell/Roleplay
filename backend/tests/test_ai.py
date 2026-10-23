import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from pydantic import SecretStr

from app import ai
from app.models import Profile


@pytest.mark.parametrize(
    "arguments",
    [
        {"limit": 1, "min_score": 0, "interests": ["design"]},
        {"limit": 1, "min_score": 0, "interests": ["private inferred trait"]},
        {"limit": 1, "min_score": 0, "interests": None, "user_id": "someone-else"},
        {"limit": 999, "min_score": 0, "interests": None},
    ],
)
async def test_provider_call_is_bounded_and_uses_only_declared_interests(monkeypatch, arguments):
    settings = SimpleNamespace(
        openai_api_key=SecretStr("test-only-provider-key"), openai_model="test-model", ai_timeout_seconds=10
    )
    response = SimpleNamespace(
        output=[SimpleNamespace(type="function_call", name="recommend_users", arguments=json.dumps(arguments))]
    )
    create = AsyncMock(return_value=response)
    provider = SimpleNamespace(responses=SimpleNamespace(create=create))

    class Client:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return provider

        async def __aexit__(self, *args):
            pass

    monkeypatch.setattr(ai, "get_settings", lambda: settings)
    monkeypatch.setattr(ai, "AsyncOpenAI", Client)
    if arguments == {"limit": 1, "min_score": 0, "interests": ["design"]}:
        result = await ai.interpret_request("Find someone with my interests", Profile(interests=["design"]))
        assert result.limit == 1
    else:
        with pytest.raises(HTTPException) as error:
            await ai.interpret_request("Find someone with my interests", Profile(interests=["design"]))
        assert error.value.status_code == 502
    request = create.call_args.kwargs
    assert request["store"] is False
    assert request["parallel_tool_calls"] is False
    assert request["tools"][0]["strict"] is True
    assert json.loads(request["input"])["preferences"] == {
        "allowed_interests": ["design"],
        "default_limit": 10,
        "default_min_score": 0,
    }
    assert "email" not in request["input"]


async def test_unconfigured_ai_does_not_make_a_provider_call(monkeypatch):
    monkeypatch.setattr(ai, "get_settings", lambda: SimpleNamespace(openai_api_key=None, openai_model=""))
    with pytest.raises(HTTPException) as error:
        await ai.interpret_request("Find people", Profile(interests=["design"]))
    assert error.value.status_code == 503
