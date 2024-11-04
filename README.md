more ui components here https://components.willpinha.link/
# Quick sass
Why Astro? [This video](https://www.youtube.com/watch?v=kssIEqSJeMI) sums it up well.

Here is a list of things added and configured for you:
* tailwind
* site map
* auth-js
To set this up for your new sass quick we need to change a few things.
do a search in the code base for `//FIXME:` or go down this list:

* `astro.config.mjs`
    - site map URL
        * other site map config like page filters (if needed)
    - SSR adapter
        * default is set to node server but you can swap to pre configured cloudflare
* `.env`
    - AUTH_SECRET should be regenerated 

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).