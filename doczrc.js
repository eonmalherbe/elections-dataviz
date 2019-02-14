import { babel } from "docz-plugin-babel6";
import { css } from "docz-plugin-css";

export default {
  title: "Elections DataViz Docs",
  description: "Elections Data Visualization Docs",
  hashRouter: true,
  plugins: [
    babel(),
    css({
      preprocessor: "postcss",
      cssmodules: true
    })
  ]
};