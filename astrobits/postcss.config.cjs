/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = {
  plugins: [
    require("postcss-bem-linter")({
      preset: "suit",
      presetOptions: {
        namespace: "astrobit",
      },
    }),
  ],
};
