// eg.
// diff --git a/0.4.0/bundles/cjs/pkg.js b/0.5.0/bundles/cjs/pkg.js
// index 1e25691..a185847 100644
const HEADER_LINES = 2;

const HUNK = 'hunk';
const UNCHANGED = 'unchanged'
const ADDED = 'added'
const REMOVED = 'removed'
const NEWLINE = 'newline'
const GIT_DIFF_HEADER = 'git-diff-header'
const FROM_TO_FILE_HEADER = 'from-to-file-header'
const EXTENDED_HEADER_LINE = 'extended-header-line'

// combined diff format
// https://git-scm.com/docs/git-diff#_combined_diff_format
function parse(diff) {
    let idx = 0;

    let lines = diff.split('\n')

    let parts = [];

    // Parse git-diff header
    // let gitDiffHeader = lines.splice(HEADER_LINES)

    // diff --git a/0.4.0/bundles/cjs/pkg.js b/0.5.0/bundles/cjs/pkg.js
    function parseGitDiffHeader(lines) {
        let cmd = lines.splice(0, 1)[0]
        parts.push({
            type: GIT_DIFF_HEADER,
            cmd
        })
        
        // peek if extended header lines
        let formats =
`old mode <mode>
new mode <mode>
deleted file mode <mode>
new file mode <mode>
copy from <path>
copy to <path>
rename from <path>
rename to <path>
similarity index <number>
dissimilarity index <number>
index <hash>..<hash> <mode>`.split(`\n`);
        let matchWords = formats.map(format => format.split(' ')[0])

        let i = -1;

        for(let line of lines) {
            i++;

            for(let w of matchWords) {
                if(line.startsWith(w)) {
                    parts.push({
                        type: EXTENDED_HEADER_LINE,
                        line
                    })
                    continue;
                }
            }

            break;
        }

        lines = lines.splice(i)
        return lines;
    }

    lines = parseGitDiffHeader(lines);

    let fromToFileHeader_partial;

    for(let line of lines) {
        // file header
        if(line.startsWith('---')) {
            fromToFileHeader_partial = {
                type: FROM_TO_FILE_HEADER,
                from: null,
                to: null
            }

            fromToFileHeader_partial.from = line.split(' ')[1]
            continue;
        }
        if(line.startsWith('+++')) {
            fromToFileHeader_partial.to = line.split(' ')[1]
            parts.push(fromToFileHeader_partial)
            fromToFileHeader_partial = null;
            continue;
        }

        // hunk
        if(line.startsWith('@@')) {
            let hunkInfo = line.split(/\@\@\s/)[1].trim()
            let [a,b] = hunkInfo.split(' ')
            
            // Each hunk range is of the format l,s where 
            // - l is the starting line number and 
            // - s is the number of lines the change hunk applies to for each respective file. 
            // 
            // In many versions of GNU diff, each range can omit the comma and trailing value s, 
            // in which case s defaults to 1. 
            // 
            // Note that the only really interesting value is the l line number of the first range; all the other values can be computed from the diff.

            function parseHunkLocation(loc) {
                // first char is +/-
                let ab = loc.slice(1).split(',')
                if(ab.length == 1) {
                    ab.push('1')
                }
                return ab.map(s => parseInt(s))
            }

            a = parseHunkLocation(a)
            b = parseHunkLocation(b)

            // console.log(a, b)

            let hunk = {
                type: HUNK,
                a,
                b
            }
            parts.push(hunk)

            continue;
        }

        // unchanged line
        if(line.startsWith(' ')) {
            // let line = line.slice(1)
            parts.push({
                type: UNCHANGED,
                line: line.slice(1),
            })
            continue
        }

        // newline
        if(line.startsWith('~')) {
            parts.push({
                type: NEWLINE
            })
            continue
        }

        // added
        if(line.startsWith('+')) {
            parts.push({
                type: ADDED,
                line: line.slice(1)
            })
            continue
        }

        // removed
        if(line.startsWith('-')) {
            parts.push({
                type: REMOVED,
                line: line.slice(1)
            })
            continue
        }
    }
    
    return parts;
}

module.exports = parse;
