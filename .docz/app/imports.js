export const imports = {
  'src/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-index" */ 'src/index.mdx'),
  'src/components/quickresults.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-quickresults" */ 'src/components/quickresults.mdx'),
  'src/components/race-for-seats.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-race-for-seats" */ 'src/components/race-for-seats.mdx'),
  'src/components/race-for-votes.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-race-for-votes" */ 'src/components/race-for-votes.mdx'),
  'src/components/spoilt.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-spoilt" */ 'src/components/spoilt.mdx'),
  'src/components/turnout.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-turnout" */ 'src/components/turnout.mdx'),
}
