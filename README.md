# Alef

An XR virtual home staging system.

## Setup

Use [Volta](https://volta.sh) to automatically install the correct Node and PNPM versions. Otherwise, see `package.json` for configured version support.

Then, run `pnpm initialize` in the root of the repo to set up environment stuff. You will need access to Bitwarden to get the secret vars. This script will walk through database migrations and creating your local admin user, too.

After that, run `pnpm dev` in the root directory. This will run all services locally, including the public app, the admin panel, and all backend workers.

- Public app: [localhost:4200](http://localhost:4200)
- Admin panel: [localhost:4203](http://localhost:4203)
- Public API: [localhost:4201](http://localhost:4201)
- Admin API: [localhost:4202](http://localhost:4202)

## Architecture

This is a Cloudflare full-stack app which uses Workers for the backend, D1 for SQL, R2 for object storage.

The public app is in `app`.

The admin panel app is in `admin`.

The backend workers are split into a couple services under `services`.

- `db`: A base service which has exclusive access to the SQL database and exports an RPC API for interacting with it depending on user privileges.
- `public-api`: An HTTP API accessible to all users which gives limited access.
- `admin-api`: An HTTP API which requires users to have admin privileges and provides advanced functionality.

## Deployment

Much of this is one-time, but documenting it here for future reference.

### Deploying infrastructure

For various Cloudflare infrastructure like D1 and R2, deployment was automatic when creating the resources with `wrangler` CLI.

For D1, migrations are manually applied using the `migrations:apply:remote` script in `/services`.

### Deploying services

Workers are deployed via wrangler. This can be manually done by cd'ing to their source directories (with `wrangler.toml`) and running `wrangler deploy`.

Applying secrets is done with `wrangler secret put SECRET_NAME`.

A Github Action is provisioned to automatically redeploy services on push to `main`.

### Deploying apps

Apps are hosted on Cloudflare Pages. Initial manual deployment is done by building the app files to `dist` first, then running `cloudflare pages deploy`. Because configuration is embedded into web app built files directly, this initial build required altering `.env` to use production configuration values before deploying.

A Github Action is provisioned to automatically redeploy pages on push to `main`. It configures build-time config env values using Github Actions variables.

## Developing in-headset

It can be kind of cumbersome to open your local dev environment in a headset. There are a few ways to do it, with plusses and minuses.

### Via Chrome devtools port forwarding

Connect your headset via USB, then open chrome://inspect#devices. Configure port forwarding for the following ports: 4200, 4201, 4202. After a little while, your headset should request debugging access. Once confirmed, it should show up on the Chrome tab, with green dots for the forwarded ports. Visit localhost:4200 in the headset. Hopefully things work!

The benefit of this approach is you can inspect your headset browser and see console logs, network traffic, etc. The downside is it's wired.

### Via Cloudflare Tunnels

Cloudflare, our infra provider, supports tunneling via their `cloudflared` CLI.

First, [follow their setup guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/). Create your tunnel with a hostname we own, like `yourname-tunnel.volu.dev`.

Then, configure dev environment variables to use the tunnel instead of localhost:

In `./app/.env`, set `VITE_MAIN_UI_ORIGIN` to `https://<your tunnel host>`.

In `./app/.env`, set `VITE_PUBLIC_API_ORIGIN` to `https://<your tunnel host>/public-api`.

In `./services/src/public-api/.dev.vars`, set `EXTRA_CORS_ORIGINS` to `https://<your tunnel host>`.

In `./services/src/public-api/.dev.vars`, set `UI_ORIGIN` to `https://<your tunnel host>`.

In `./services/src/public-api/.dev.vars`, set `API_ORIGIN` to `https://<your tunnel host>/public-api`.

The `/public-api` path is already configured and supported by the frontend and backend in local development, so this should work after configuration as long as your tunnel is set up and running correctly. Visit your tunnel host in your headset.

Some things to note:

- You may have to clear cookies if you have previously used the device on alef.io in any capacity and your tunnel host is on that domain, too. That's why I recommend using a different root domain like volu.dev.
- To quickly switch between tunnel and not, you can comment out lines in .env or .dev.vars using a # char. You still have to restart the dev script.

Benefit of this approach: wireless headset use. Downside: no debugging, a lot more configuration.
