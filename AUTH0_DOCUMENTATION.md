# Internal Auth0 Implementation Documentation

This document describes the architectural implementation of Auth0 authentication within the platform. The implementation follows the standard OAuth 2.0 and OpenID Connect (OIDC) protocols to ensure secure user identity management and access control.

## Authentication Architecture

The platform utilizes the **Authorization Code Flow** for authenticating users. This process ensures that sensitive credentials never touch the platform's infrastructure directly.

### 1. Initiation
When a user attempts to sign in, the platform redirects the user's browser to the Auth0 Authorization Server. This request includes the `client_id`, the requested `scopes` (openid, profile, email), and a `redirect_uri`.

### 2. Identity Verification
Auth0 handles the primary identity verification (e.g., email/password, social login, or SSO). Upon successful authentication, Auth0 redirects the user back to the platform's specified callback endpoint with a temporary **Authorization Code**.

### 3. Token Exchange
The platform's server receives the authorization code and immediately performs a secure back-channel request to Auth0's token endpoint. During this exchange, the platform provides:
*   The Authorization Code
*   The Client ID
*   The Client Secret (private)
*   The Redirect URI (for verification)

In return, Auth0 provides an **Access Token** and an **ID Token**.

### 4. Profile and Role Retrieval
The platform uses the Access Token to call the Auth0 `/userinfo` endpoint. This retrieves the full user profile, including metadata and custom claims. 

**Role Extraction Logic:**
Roles are retrieved from specific claims within the user profile. The implementation looks for roles in the following order:
1.  Custom namespace claims (e.g., `https://aea.com/roles`)
2.  Standard `roles` claim
3.  Any claim ending with `/roles`
4.  Application metadata (`app_metadata.roles`)

### 5. Session Establishment
Once identity and roles are confirmed, the platform establishes its own independent session:
1.  A **Session JWT** is generated, containing the user's unique identifier, email, nickname, and verified roles.
2.  This JWT is signed using a private server-side secret.
3.  The signed token is stored in a secure, HTTP-only cookie in the user's browser.

---

## Internal Settings and Configuration

The following settings define the integration between the platform and Auth0. These are categorized into public identifiers and private secrets.

### Public Identifiers
*   **Tenant Domain**: `dev-l3cgimaqtit76flm.us.auth0.com`
    *   The base URL for all Auth0 communication.
*   **Client ID**: `KOZ8r6x1r1GmvKSTFMb9Y0sTg3tz1P3a`
    *   The public identifier for the platform within the Auth0 tenant.
*   **Admin Role ID**: `rol_85l7HNkIgBLXRw5B`
    *   The internal Auth0 identifier used to grant administrative privileges.
*   **Standard User Role ID**: `rol_p2JLyXK9UfqFXzCI`
    *   The internal Auth0 identifier used to grant standard AEA access.

### Private Secrets (Environment Variables)
*   **Client Secret**: `AUTH0_CLIENT_SECRET`
    *   A private key used only during the back-channel token exchange. **Never exposed to the client.**
*   **Session Secret**: `LOGIN_JWT_SECRET`
    *   The private key used by the platform to sign its own session tokens.
*   **Cookie Name**: `aea_session`
    *   The identifier for the browser cookie storing the session JWT.
*   **Token Validity (TTL)**: `86400 seconds` (1 day)
    *   The duration for which a session remains valid before requiring re-authentication.

---

## Access Control Levels

The platform interprets the roles retrieved from Auth0 into the following internal access levels:

1.  **Public Access**: No authentication required. Access to basic landing pages and legal information.
2.  **AEA User Access**: Requires the `AEA_User` role or the specific `ROLE_AEA_USER` ID. Grants access to standard graph visualizations and analysis tools.
3.  **Administrator Access**: Requires the `Admin` role or the specific `ROLE_ADMIN` ID. Grants full access to all platform features, including user management, tour creation, and system statistics.
