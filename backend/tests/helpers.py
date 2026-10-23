PASSWORD = "Local-only-test-password-123!"


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


async def account(client, slug, **preferences):
    response = await client.post(
        "/v1/auth/register", json={"email": f"{slug}@example.com", "password": PASSWORD, "display_name": slug}
    )
    assert response.status_code == 201, response.text
    token = response.json()["access_token"]
    if preferences:
        response = await client.patch("/v1/me/profile", headers=bearer(token), json=preferences)
        assert response.status_code == 200, response.text
    profile = (await client.get("/v1/me/profile", headers=bearer(token))).json()
    return token, profile
