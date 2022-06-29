# Standard OAuth Method:
The standard OAuth method described in the Dropbox docs is as follows:
- When authenticating the app, the user is sent to the dropbox website to verify authentication
- After the app is approved, they are sent back to the app with an authorization code
- The application can exchange this authorization code for an authorization key

# Implementing OAuth:
1. Create a Dropbox [authorization url](https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize) with the `client_id`, `redirect_uri`, and `response_type` of `code` specified as necessary. Dropbox example: `https://www.dropbox.com/oauth2/authorize?client_id=MY_CLIENT_ID&redirect_uri=MY_REDIRECT_URI&response_type=code`
2. When the user completes authentication, they are redirected to your URI (specified in `redirect_uri`) with an `authorization code` within the query string.
3. The application uses its `client_secret` and exchanges the auth code for an access token

# Issue with using simple OAuth:
- The implemenetation of OAuth above requires that the application use its client secret in order to authenticate
- This does not work well for open source, serverless software where the client secret would simply be known

# Extending OAuth using PCKE:
PCKE is an extension of the traditional OAuth architexture that eliminates the need for a client secret

# Implementing PCKE:
1. The app creates a `code_verifier`.
2. The app transforms the `code_verifier` into the `code_challenge` using a `code_challenge_method` (plain or (recommended) S256)
3. App sends `code_challenge` and `code_challenge_method` with the initial original OAuth request.
4. Server responds with `authorization_code`
5. Client sends both `code_verifier` and `authorization_code` to the token endpoint for verification. (Server transforms `code_verifier` using the same challenge method to check if they match)
6. Token endpoint finally issues `access_token` after verification

## Important notes:
* OAuth uses scoped access, so apps can specify the exact minimum permissions they need to function
* Dropbox has three features called the [Chooser](https://www.dropbox.com/developers/chooser), [Saver](https://www.dropbox.com/developers/saver), and [Embedder](https://www.dropbox.com/developers/embedder) that do not require an authentication step, allowing for access without extraneous OAuth permissions.

### Information Derived From: 
* [OAuth Guide](https://developers.dropbox.com/oauth-guide)
* [PCKE: What and Why](https://dropbox.tech/developers/pkce--what-and-why-)
