#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor"
RUNTIME="$VENDOR/reveal-runtime"
STAGING="$VENDOR/.setup-runtime"
TMP="$VENDOR/.setup-tmp"

REVEAL_VERSION="${REVEAL_VERSION:-6.0.1}"
CHALKBOARD_VERSION="${CHALKBOARD_VERSION:-4.6.0}"

cleanup_error() {
  rm -rf "$STAGING" "$TMP"
}

trap cleanup_error ERR INT TERM

download() {
  local url="$1"
  local destination="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$destination"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$destination" "$url"
  else
    echo "setup-reveal-local.sh requires curl or wget." >&2
    return 1
  fi
}

download_first() {
  local destination="$1"
  shift

  local url
  for url in "$@"; do
    if download "$url" "$destination"; then
      return 0
    fi
  done

  echo "Could not download any candidate for $destination." >&2
  return 1
}

extract_stripped() {
  local archive="$1"
  local destination="$2"

  rm -rf "$destination"
  mkdir -p "$destination"
  tar -xzf "$archive" --strip-components=1 -C "$destination"
}

copy_optional() {
  local source="$1"
  local destination="$2"

  if [ -f "$source" ]; then
    mkdir -p "$(dirname "$destination")"
    cp "$source" "$destination"
    return 0
  fi

  return 1
}

stage_reveal() {
  local source="$1"

  mkdir -p "$STAGING/dist"
  cp "$source/dist/reveal.css" "$STAGING/dist/reveal.css"
  cp "$source/dist/reveal.js" "$STAGING/dist/reveal.js"

  copy_optional "$source/plugin/math/math.js" "$STAGING/plugin/math/math.js" ||
    copy_optional "$source/dist/plugin/math.js" "$STAGING/plugin/math/math.js" ||
    true

  copy_optional "$source/plugin/notes/notes.js" "$STAGING/plugin/notes/notes.js" ||
    copy_optional "$source/dist/plugin/notes.js" "$STAGING/plugin/notes/notes.js" ||
    true
}

stage_chalkboard() {
  local source="$1/chalkboard"
  local target="$STAGING/plugin/chalkboard"

  if [ ! -d "$source" ]; then
    echo "Skipping chalkboard: $source does not exist." >&2
    return 0
  fi

  mkdir -p "$target"
  cp -R "$source/." "$target/"

  copy_optional "$target/plugin.js" "$target/chalkboard.js" || true
  copy_optional "$target/style.css" "$target/chalkboard.css" || true
}

rm -rf "$STAGING" "$TMP"
mkdir -p "$STAGING" "$TMP"

reveal_archive="$TMP/reveal-$REVEAL_VERSION.tar.gz"
plugins_archive="$TMP/reveal-plugins-$CHALKBOARD_VERSION.tar.gz"
reveal_source="$TMP/reveal"
plugins_source="$TMP/reveal-plugins"

download_first "$reveal_archive" \
  "https://github.com/hakimel/reveal.js/archive/refs/tags/$REVEAL_VERSION.tar.gz" \
  "https://github.com/hakimel/reveal.js/archive/refs/tags/v$REVEAL_VERSION.tar.gz"
extract_stripped "$reveal_archive" "$reveal_source"
stage_reveal "$reveal_source"

download_first "$plugins_archive" \
  "https://github.com/rajgoel/reveal.js-plugins/archive/refs/tags/$CHALKBOARD_VERSION.tar.gz" \
  "https://github.com/rajgoel/reveal.js-plugins/archive/refs/tags/v$CHALKBOARD_VERSION.tar.gz"
extract_stripped "$plugins_archive" "$plugins_source"
stage_chalkboard "$plugins_source"

rm -rf "$RUNTIME"
mv "$STAGING" "$RUNTIME"
rm -rf "$TMP"
trap - ERR INT TERM

echo "Reveal runtime staged in vendor/reveal-runtime"
