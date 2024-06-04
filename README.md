## Setup

```sh
bun install
bun run dev
```

Head to http://localhost:5173

## How to docker build locally

```
docker build --build-arg DATABASE_URL="" --build-arg NEYNAR_API_KEY="" --build-arg NEYNAR_REDASH_API_KEY="" --build-arg API_KEY_COINGECKO="" --build-arg FONTCONFIG_PATH="/var/task/fonts" -t test .
docker run -d -p 3000:3000 --name test -d test
```

### Using ngrok for local tunneling

If you need to expose your local development server to the internet, you can use ngrok. This is particularly useful for testing webhooks and APIs with external services. To use ngrok with the development server running on port 3000, follow these steps:

1. Download and install ngrok from https://ngrok.com/download.
2. Start your local development server if it's not already running.
3. Open a new terminal and run:
   ```sh
   ngrok http http://localhost:3000
   ```
4. ngrok will provide you with a public URL (e.g., `https://<random-subdomain>.ngrok.io`). Use this URL to access your local server from the internet.

Remember, each time you start ngrok, it will generate a new URL. Ensure that any configurations or external services using this URL are updated accordingly.

### Environment Variables (.env)

The `.env` file is used to store sensitive information such as API keys and database credentials.
To create a `.env` file, create a new file in the root of your project and add the following variables:

```sh
DATABASE_URL="your_postgres_connection_string"
NEYNAR_API_KEY="your_neynar_api_key"
NEYNAR_REDASH_API_KEY="your_neynar_redash_api_key"
API_KEY_COINGECKO="your_coingecko_api_key"
```

The secrets can be attained via the pulumi cli:

```sh
pulumi config --show-secrets --stack dev
```
