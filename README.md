# Genesis SES school 6.0 — Test task

Short description
- Small service to subscribe users for GitHub repo release notifications.
- Uses Fastify and Prisma (Postgres).

# How it works

1. **Subscription**: Users can subscribe to GitHub repository release notifications by providing their email and repository details. The service validates the input and checks for duplicates before saving the subscription. It also verifies that the specified GitHub repository exists and returns an error to the user if it does not

2. **Activation**: After subscribing, users receive an activation email containing a unique token. The token has a TTL of 5 minutes. After this period, the token expires and the user must request a new activation email. Users must confirm their subscription by clicking the activation link provided in the email.

3. **Unsubscription**: Users can unsubscribe from notifications using a unique token provided in the every email after its activation. 

4. **Notification**: Once subscribed, users receive notifications whenever a new release is published in the specified GitHub repository.
The scanner fetches all unique repository names from the database, ordered by the last check date. These repositories are then split into groups of N items (where N is defined by an environment variable) to enable controlled parallel processing without overwhelming the GitHub API.

For each subscription, we maintain a last_seen_tag, which represents the last time when release version was checked.

If a GitHub API rate limit error occurs (e.g., "too many requests"), all processing is temporarily paused. After the defined cooldown period, scanning resumes starting from the oldest subscription.

If a repository is found to be deleted or no longer available, all related user subscriptions are automatically removed.

When a new release is detected, the system sends notifications to all subscribed users via email. Email delivery is also processed in batches of N items to ensure stability and prevent overload.

If an error occurs during notification sending, it will be retried on the next scanner run.

5. **Endpoints**: The service provides RESTful endpoints for subscribing, activating, unsubscribing, and listing user subscriptions.


# Prerequisites
- Node.js 18+ / 20+
- pnpm
- Docker & Docker Compose (optional)
- Postgres (local or via Docker)

Environment
Create a `.env` from `.env EXAMPLE` at project root;

# Initial setup
1. Install deps
  `npm install`

2. Generate prisma client `npx prisma generate`

3. Run init migration `npx prisma migrate dev --name init`

Run locally
- in your env file you should have correct DATABASE_URL
- `npm run dev`

Docker
- To run files in docker
- Make sure you have changed `DATABASE_URL` for your docker database in `.env` file
- `docker compose up -d --build`

Testing
- Run unit tests Vitest:
  `npm test`

Useful endpoints (examples)
- POST /subscribe:
  - Parameters:
    - `email` (string, required): The email address of the user subscribing.
    - `repo` (string, required): The GitHub repository in the format `owner/repo`.
  - 200 on success, 409 if subscription exist, 400 for invalid input format and 404 if repo doesnt exist.

- GET /unsubscribe/{token}:
  - 200 on success, 404 if token not found

- GET /confirm/{token}:
  - 200 on success, 400 if token is invalid, 404 if token not found

- GET /subscription?email=${email}
  - 200 - list of subscriptions returned, 400 if email is required or invalid