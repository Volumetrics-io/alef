# Public access token authorization

This is the simplest method of connecting a new device, but is limited to read-only access. It is scoped to the user's account and generates a valid user session for the device.

## Process

First, the user must create a token. You can only create one default token right now, by `PUT /publicAccessTokens/default`. If an existing token is there, it will be returned. If it is expired, it will be regenerated. Tokens last 1 day (don't worry, the device will be able to refresh its session longer than 1 day).

Once the token is created, it is returned by the endpoint. This token then must be transferred to the new device (via QR code, etc).

The new device must then make a request to `GET /publicAccessTokens/<token>/redeem`. If successful the response will include the session cookie and refresh cookie. The session cookie name is `alef-session` and the refresh token is in `alef-refresh`.

To make authenticated requests from here, provide the session cookie to the `alef-session` cookie header for requests. Production session tokens last 1 day before they must be refreshed.

To refresh your token (i.e. get a new one in the `alef-session` cookie), POST your refresh token (again, in `alef-refresh` request cookie) to the `/auth/refresh` endpoint (no body required). This will respond with new session and refresh token cookies. Rinse and repeat each day (or whenever you get a 401 error).
