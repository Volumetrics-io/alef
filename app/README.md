# Alef App

The web app that users will interact with.

## Interacting with the API

API param, body, and response types are inferred from Hono (the server framework) using the `hcWithType` client factory exported from the API service. This is just some Typescript magic which will give us type checking on API usage without extra work (as long as it doesn't break).

For API typechecking to update, the API needs to be built. That can be done ad-hoc by running `pnpm build` in `/services`, or in watch mode as part of the normal `pnpm dev` task (recommended).

API React integration is powered by `@tanstack/react-query`. No defaults are currently applied to the QueryClient; all configuration happens inside the query functions themselves, which delegate to the typed API client.

The API client is located in the local `./src/services` directory. It also contains some premade React hooks to make interaction easier. It's recommended to add these hooks and coordinate cache usage, rather than do ad-hoc query hooks elsewhere.

All hooks use `useSuspenseQuery`, which means you should wrap usages with `<Suspense>` boundaries as desirable, or loading will propagate upward.

### Some basic documented functionality

While there will probably be much more added as we go, here's some things you can do at time of writing:

`useMe` - Fetches the current user session.
`useAllFurniture({ attributeFilter?: { key: string; value: string; }[] })` - Lists furniture metadata, accepts an optional filter for key=value attributes (filters are AND-ed together).
