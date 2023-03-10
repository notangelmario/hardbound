# Hardbound

Hardbound is a SolidJS framework built for Deno.

## Notes:
* Very unstable, lots of things might change, use at your risk!
* Hardbound is mostly a client-side framework. There is no server-side rendering (yet?)
* JSX Automatic Runtime doesn't work for the moment, you will need to `import h from "solid-js/h"` in every file

## Features:
* No compilation needed
* Uses SolidJS for performance
* Hot Reloading for better DX

## What's new?
* Code splitting
* Caching
* Better performance

## Getting started

To make a Hardbound project:
```
deno run -A https://deno.land/x/hardbound/init.ts my-project
```

You can also opt in for TypeScript support by passing `-t` or `--typescript`:
```
deno run -A https://deno.land/x/hardbound/init.ts -t my-project
```
