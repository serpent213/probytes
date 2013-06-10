'use strict';

/* Generic functions */

/* exported cmp */
function cmp(a, b) {
  if (a > b) { return +1; }
  if (a < b) { return -1; }
  return 0;
}
