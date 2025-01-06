What's a HOC?

A "higher order component" is a function which wraps a React component and augments it, returning a new component definition with additional behavior. Conventionally HOCs are named starting `with...`.

It's not a popular pattern anymore, but there are still useful instances.

The Typescript support for HOCs is very messy looking and difficult to reason about. I recommend avoiding changes to these if possible. They use a lot of explicit `any` because correct typing would be a whole mess.
