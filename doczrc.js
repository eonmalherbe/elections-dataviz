import { babel } from "docz-plugin-babel6";
import { css } from "docz-plugin-css";

export default {
  title: "Elections DataViz Docs",
  description: "Elections Data Visualization Docs",
  plugins: [
    babel(),
    css({
      preprocessor: "postcss",
      cssmodules: true
    })
  ],
  public: './public',
  dest: './build/docz',
  base: '/elections-dataviz/docz/'
};