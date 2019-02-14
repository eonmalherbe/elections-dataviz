export const imports = {
  'src/Box.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-box" */ 'src/Box.mdx'),
  'src/barchart.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-barchart" */ 'src/barchart.mdx'),
}
