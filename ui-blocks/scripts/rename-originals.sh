#!/bin/bash
# Renames the original snippet files (hea1.ts -> Header1.ts, ...) to match the component names.
# Usage: rename-originals.sh <source-dir> [--apply]
cd "$1" || exit 1
APPLY=$2
rn() { # folder base
  for f in "$1"/*.ts; do
    [ -e "$f" ] || continue
    n=$(basename "$f" .ts | grep -o '[0-9]*$')
    new="$1/$2$n.ts"
    [ "$f" = "$new" ] && continue
    echo "$f -> $new"
    [ "$APPLY" = "--apply" ] && mv "$f" "$new"
  done
}
[ -d gallary ] && { echo "gallary/ -> gallery/"; [ "$APPLY" = "--apply" ] && mv gallary gallery; }
rn header Header; rn footer Footer; rn contact Contact; rn cta Cta; rn features Features
rn content Content; rn blog Blog; rn gallery Gallery; rn hero Hero; rn navbar Navbar
rn pricing Pricing; rn statics Statics; rn step Step; rn team Team; rn testimonial Testimonial
