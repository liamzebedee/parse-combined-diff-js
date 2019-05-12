# parse-diff-js
Browser/Node lib to parse diffs in the unified+[combined](https://git-scm.com/docs/git-diff#_combined_diff_format) diff formats, as produced by git.

Just a microlib, no deps. GPL v3.

## Usage
Get the output of a diff from something like `git --no-pager diff --word-diff=porcelain --no-index 0.4.0/bundles/cjs/pkg.js 0.5.0/bundles/cjs/pkg.js`.

```js
let diff = '...'
parse(diff)

// Returns
[ { type: 'git-diff-header',
    cmd:
     'diff --git a/0.4.0/bundles/cjs/pkg.js b/0.5.0/bundles/cjs/pkg.js' },
  { type: 'extended-header-line',
    line: 'index 1e25691..a185847 100644' },
  { type: 'from-to-file-header',
    from: 'a/0.4.0/bundles/cjs/pkg.js',
    to: 'b/0.5.0/bundles/cjs/pkg.js' },
  { type: 'hunk', a: [ 9, 7 ], b: [ 9, 7 ] },
  { type: 'unchanged', }
  // ...
]
```
