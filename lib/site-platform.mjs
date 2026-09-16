// These constants are supplied only by the separate GitHub Pages build.
// The server-backed site keeps its existing root URLs and APIs.
export const STATIC_SITE =
  typeof __STATIC_SITE__ !== 'undefined' && __STATIC_SITE__;
export const SITE_BASE =
  typeof __SITE_BASE__ !== 'undefined' ? __SITE_BASE__ : '/';

/** @param {string} path */
export function publicPath(path) {
  return SITE_BASE + path.replace(/^\//, '');
}

/** @param {string | undefined} srcSet */
export function publicSrcSet(srcSet) {
  return srcSet
    ?.split(',')
    .map((entry) => publicPath(entry.trim()))
    .join(', ');
}
