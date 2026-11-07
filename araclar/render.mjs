#!/usr/bin/env node
// Sabit kare zamanı + Canvas PNG -> ffmpeg. Harici görsel veya ağ isteği yok.
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';

const help = 'node araclar/render.mjs film.html [--sure 3] [--bas 0] [--cikti renders/film.mp4] [--ses mix.wav]';
const args = process.argv.slice(2);
if (args.includes('--help')) { console.log(help); process.exit(0); }
let browser, ff, complete = false, output;
try {
  const input = args.shift();
  if (!input || input.startsWith('--')) throw new Error(help);
  const options = {};
  while (args.length) {
    const key = args.shift(), value = args.shift();
    if (!['--sure', '--bas', '--cikti', '--ses'].includes(key) || !value || value.startsWith('--')) throw new Error(help);
    if (key in options) throw new Error(`Tekrarlanan seçenek: ${key}`);
    options[key] = value;
  }
  const start = Number(options['--bas'] ?? 0);
  const duration = options['--sure'] === undefined ? null : Number(options['--sure']);
  if (!Number.isFinite(start) || start < 0 || (duration !== null && (!Number.isFinite(duration) || duration <= 0))) throw new Error('Süre pozitif, başlangıç sıfır veya pozitif olmalı.');
  const file = resolve(input);
  output = resolve(options['--cikti'] ?? 'renders/film.mp4');
  if (!existsSync(file)) throw new Error('film.html bulunamadı.');
  if (!output.endsWith('.mp4') || existsSync(output)) throw new Error('Çıktı .mp4 olmalı ve henüz bulunmamalı. Yeni bir dosya adı seçin.');
  const sound = options['--ses'] ? resolve(options['--ses']) : null;
  if (sound && !existsSync(sound)) throw new Error('Ses dosyası bulunamadı.');
  const check = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (check.error || check.status !== 0) throw new Error('ffmpeg bulunamadı.');

  const candidates = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'],
    win32: [join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'), join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe')],
  }[process.platform] ?? [];
  const executablePath = process.env.CHROME_PATH || candidates.find(existsSync);
  if (!executablePath || !existsSync(executablePath)) throw new Error('Chrome bulunamadı. Chrome/Chromium kurun veya CHROME_PATH değişkenini ayarlayın.');
  browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars', '--mute-audio'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (/^https?:/.test(request.url())) { errors.push('Film dış ağ kaynağı istiyor; tek dosya kullanın.'); void request.abort(); }
    else void request.continue();
  });
  // Çizim saati her karede mutlak zamana ayarlanır. Tarih de sabit bir başlangıca bağlıdır.
  await page.evaluateOnNewDocument(() => {
    let ms = 0;
    const NativeDate = Date;
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [1704067200000 + ms])); }
      static now() { return 1704067200000 + ms; }
    };
    Object.defineProperty(performance, 'now', { value: () => ms });
    window.__setFrameClock = value => { ms = value; };
  });
  const url = pathToFileURL(file); url.searchParams.set('capture', '1');
  await page.goto(url.href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.READY && typeof window.renderFrame === 'function', { timeout: 10000 });
  const meta = await page.evaluate(() => window.READY);
  const { width, height, fps, frames } = meta;
  if (fps !== 24 || ![width, height, frames].every(n => Number.isSafeInteger(n) && n > 0) || width % 2 || height % 2) throw new Error('READY: çift en/boy, pozitif kare sayısı ve fps: 24 gerekli.');
  if (Math.abs(start * fps - Math.round(start * fps)) > 1e-6) throw new Error('Başlangıç 1/24 saniyenin katı olmalı.');
  const first = Math.round(start * fps);
  const count = duration === null ? frames - first : Math.round(duration * fps);
  if (count <= 0 || first + count > frames) throw new Error('İstenen aralık filmin süresi dışında.');
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(errors.join('\n'));
  mkdirSync(dirname(output), { recursive: true });
  ff = spawn('ffmpeg', ['-v', 'error', '-n', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
    ...(sound ? ['-ss', String(start), '-i', sound, '-map', '0:v:0', '-map', '1:a:0', '-af', 'apad', '-c:a', 'aac', '-b:a', '192k'] : []),
    '-t', String(count / fps), '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: ['pipe', 'ignore', 'pipe'] });
  let encoderError = '';
  ff.stderr.on('data', data => { encoderError = (encoderError + data).slice(-4000); });
  // Hata dinleyicileri ilk kareden önce bağlanır; EPIPE/erken çıkış sessizce başarı sayılmaz.
  const closed = new Promise((res, rej) => { ff.once('error', rej); ff.once('close', code => res(code)); });
  closed.catch(() => {});
  let pipeError;
  ff.stdin.on('error', e => { pipeError = e; });
  const began = Date.now();
  for (let i = 0; i < count; i++) {
    if (pipeError || ff.exitCode !== null) throw new Error(encoderError || pipeError?.message || 'ffmpeg erken kapandı.');
    const png = await page.evaluate(frame => {
      window.__setFrameClock(frame * 1000 / 24);
      window.renderFrame(frame);
      const canvas = document.querySelector('canvas');
      if (!canvas) throw new Error('Canvas bulunamadı.');
      return canvas.toDataURL('image/png').split(',')[1];
    }, first + i);
    if (errors.length) throw new Error(errors.join('\n'));
    if (!ff.stdin.write(Buffer.from(png, 'base64'))) await once(ff.stdin, 'drain');
    if ((i + 1) % 24 === 0) console.log(`${i + 1}/${count} kare`);
  }
  ff.stdin.end();
  const code = await closed;
  if (code !== 0 || pipeError) throw new Error(encoderError || 'ffmpeg render hatası.');
  complete = true;
  console.log(`${count} kare, ${(count / fps).toFixed(3)} sn, ${width}x${height}, 24 kare/sn. Render: ${((Date.now() - began) / 1000).toFixed(1)} sn.`);
  console.log(options['--cikti'] ?? 'renders/film.mp4');
} catch (e) {
  console.error(e.message); process.exitCode = 1;
} finally {
  if (ff && !complete) { ff.stdin.destroy(); ff.kill(); if (output) rmSync(output, { force: true }); }
  await browser?.close();
}
