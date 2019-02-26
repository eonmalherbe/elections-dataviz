export const imports = {
  'src/components/BarChart/barchart.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-bar-chart-barchart" */ 'src/components/BarChart/barchart.mdx'),
  'src/components/Map/map.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-map-map" */ 'src/components/Map/map.mdx'),
}
