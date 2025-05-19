# Astrobits ([astrobits.dev](https://astrobits.dev))

![astrobits-preview-image](https://patroninc.b-cdn.net/astrobit-component-library.png)

```sh
yarn add astrobits
```

## About

I wanted a set of retro 16-bit inspired components for the marketing website of Patron and decided it would be best to make an actual component library for it.

All components in this library have styles following the [BEM guidelines](https://getbem.com/naming/) enforced with stylelint. Tailwind v4 is used through the @apply directive. This should be easy for others to contribute to if they so wish.

Colors can be easily customized by overriding the variables in [src/styles/global.css](./src/styles/global.css).

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── index.ts
├── src
│   └── components
|     └── Component
|       ├── Component.astro
|       ├── Component.css
├── tsconfig.json
├── package.json
```

The `index.ts` file is the "entry point" for your package. Export your components in `index.ts` to make them importable from your package.
