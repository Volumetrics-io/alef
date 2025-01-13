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
