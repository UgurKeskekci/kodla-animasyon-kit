#!/bin/sh
# Yeni CLI oturumu: üretim sohbetinin geçmişi verilmez.
set -eu
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo 'Kullanım: sh araclar/izlet.sh renders/film.mp4' >&2; exit 1
fi
video=$(cd -- "$(dirname -- "$1")" && pwd)/$(basename -- "$1")
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
prompt=$(cat "$root/araclar/izleyici-istemi.md")
prompt="$prompt

İzlenecek yerel video: $video
Bu dosyayı medya okuma aracınızla ses ve görüntü olarak açın. Kaynak kodu okumayın."
case "${IZLEYICI_CLI:-gemini}" in
  gemini)
    command -v gemini >/dev/null || { echo 'Oturum açılmış Gemini CLI gerekli. Alternatif: IZLEYICI_CLI=agy' >&2; exit 1; }
    exec gemini -p "$prompt"
    ;;
  agy)
    command -v agy >/dev/null || { echo 'Oturum açılmış Antigravity CLI (agy) gerekli.' >&2; exit 1; }
    exec agy --print "$prompt"
    ;;
  *) echo 'IZLEYICI_CLI gemini veya agy olmalı.' >&2; exit 1 ;;
esac
