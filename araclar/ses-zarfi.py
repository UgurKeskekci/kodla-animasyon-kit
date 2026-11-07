#!/usr/bin/env python3
"""PCM WAV'dan 24 kare/sn RMS zarfı. Yalnız Python standart kütüphanesi."""
import argparse
import json
import math
import wave
from pathlib import Path


def envelope(path):
    with wave.open(str(path), 'rb') as wav:
        width, rate, count = wav.getsampwidth(), wav.getframerate(), wav.getnframes()
        if wav.getcomptype() != 'NONE' or width not in (1, 2, 3, 4):
            raise ValueError('8/16/24/32 bit PCM WAV gerekli. ffmpeg ile pcm_s16le biçimine çevirin.')
        levels = []
        for frame in range(math.ceil(count * 24 / rate)):
            begin, end = frame * rate // 24, min(count, (frame + 1) * rate // 24)
            data = wav.readframes(end - begin)
            energy, n = 0.0, 0
            # Kanalların enerjisini ayrı hesapla: ters fazlı stereo sessiz sayılmaz.
            for i in range(0, len(data), width):
                value = (data[i] - 128) / 128 if width == 1 else int.from_bytes(data[i:i + width], 'little', signed=True) / (1 << (width * 8 - 1))
                energy += value * value
                n += 1
            levels.append(math.sqrt(energy / n) if n else 0.0)
    peak = max(levels, default=0)
    # Sessizlik kapısı mutlak seviyede uygulanır; hafif oda sesi ağzı açmaz.
    values = [round(min(1.0, x / max(peak, 0.05)), 4) if x >= 0.01 else 0.0 for x in levels]
    return {'fps': 24, 'duration': count / rate, 'values': values}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('wav', type=Path)
    parser.add_argument('json', type=Path)
    args = parser.parse_args()
    try:
        result = envelope(args.wav)
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, ensure_ascii=False) + '\n', encoding='utf-8')
        print(f"{len(result['values'])} kare, 24 kare/sn -> {args.json}")
    except (OSError, ValueError, wave.Error) as error:
        parser.exit(1, f'Hata: {error}\n')


if __name__ == '__main__':
    main()
