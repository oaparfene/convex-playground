## Docker configuration

```sh
docker compose up
```

Once the backend is running you can use it to generate admin keys for the
dashboard/CLI:

```sh
docker compose exec backend ./generate_admin_key.sh
```

Visit the dashboard at `http://localhost:6791`. The backend listens on
`http://127.0.0.1:3210`. The backend's http actions are available at
`http://127.0.0.1:3211`.

In your Convex project, add your url and admin key to a `.env.local` file (which
should not be committed to source control):

```sh
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='<your admin key>'
```

Now you can run commands in your Convex project, to push code, run queries,
import data, etc. To use these commands, you'll need the latest version of
Convex.

```sh
npm install convex@latest
```

Now you can push code, run queries, import data, etc.

```sh
npx convex dev
npx convex --help  # see all available commands
```