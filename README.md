# JSFractal

JSFractal is a browser-based fractal explorer.

## Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
npm run preview
```

The production build is written to `dist/`.

## Cloudflare Pages

Use these build settings:

- Build command: `npm run build`
- Build output directory: `dist`

The `wrangler.toml` file also sets `pages_build_output_dir = "./dist"` for Wrangler-based Pages deploys.

Historical version: http://2tap.com/jsfractal

Project notes: http://2tap.com/2008/12/18/jsfractal-javascript-fractal-explorer/
