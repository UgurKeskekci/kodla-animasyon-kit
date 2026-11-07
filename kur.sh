#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
command -v node >/dev/null || { echo 'Node.js 18 veya üstünü kurun: https://nodejs.org'; exit 1; }
node -e 'if (Number(process.versions.node.split(".")[0]) < 18) process.exit(1)' || { echo 'Node.js 18 veya üstü gerekli.'; exit 1; }
command -v npm >/dev/null || { echo 'npm bulunamadı. Node.js kurulumunu kontrol edin.'; exit 1; }
if ! command -v ffmpeg >/dev/null; then
  if [ "$(uname -s)" = Darwin ] && command -v brew >/dev/null; then
    brew install ffmpeg
  else
    echo 'Önce ffmpeg kurup yeniden çalıştırın: https://ffmpeg.org/download.html'; exit 1
  fi
fi
npm install
echo 'Hazır. Bu klasörde Claude Code açın: claude'
echo 'Proje skill dosyası zaten .claude/skills/kodla-film/SKILL.md içinde.'
echo 'İlk deneme: npm run ornek (Chrome veya Chromium kurulu olmalı).'
