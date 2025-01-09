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
