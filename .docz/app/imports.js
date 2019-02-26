export const imports = {
  'src/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-index" */ 'src/index.mdx'),
  'src/components/BarChart/barchart.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-bar-chart-barchart" */ 'src/components/BarChart/barchart.mdx'),
  'src/components/Map/map.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-map-map" */ 'src/components/Map/map.mdx'),
}
