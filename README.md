# Kodla Animasyon Kit

Claude Code ile görsel veya video üretim modeli kullanmadan kısa animasyonlar yapmak için küçük bir başlangıç kiti. Siz sahneyi anlatırsınız, Claude tek bir `film.html` yazar. Her kareyi HTML Canvas kodu çizer, tarayıcı kare kare render eder, ffmpeg bunları MP4'e çevirir. Çizim ve render bilgisayarınızda çalışır.

İlk sonuç kusursuz olmayabilir. Bu kitin asıl işi, iyi olanı koruyup hatalı saniyeyi düzeltmeyi kolaylaştırmak. Konuşma isterseniz kendi kaydınızı veya kullanma hakkınız olan bir TTS sesini ayrıca ekleyebilirsiniz.

## 3 adımda başlayın

### 1. Repoyu Claude Code'a verin

Claude Code'u açın, bu sayfanın adresini yapıştırıp şunu yazın:

```text
https://github.com/UgurKeskekci/kodla-animasyon-kit bu sistemi kur
```

Claude repoyu indirir, kurulumu yapar ve 3 saniyelik bir deneme render'ı alır. Sonra sizden ilk sahne için bir hikaye ister. Kurulum bitince Claude Code'u kit klasöründe açın (`cd kodla-animasyon-kit` ve `claude`); skill `/kodla-film` adıyla hazırdır.

### 2. Küçük bir sahneyle deneyin

İlk denemede 30 saniyelik tek sahne isteyin. Birkaç kısa hikaye ya da video fikri verip hepsini ürettirebilirsiniz:

```text
/kodla-film 30 saniyelik tek sahne: yağmurlu sahilde çay içen yazılımcı.
Yatay olsun, her şey kodla çizilsin. Önce sessiz taslak çıkarın.
```

Claude taslağı çizer, kendi karelerine bakar, bağımsız izleyiciye izletir ve bulunan hataları düzeltir. Siz de düzeltme isterken üç şeyi söyleyin: **hangi saniye, ne yanlış, ne korunacak.**

```text
4,2. saniyede çay bardağı elin içinden geçiyor. Bardağı parmaklara oturtun.
Karakter, renkler ve yağmur aynı kalsın.
```

### 3. Referans verin, iyi çıktıyı kaydedin

Beğendiğiniz bir videoyu referans verip "şu tarz, aynı ışık ve tempo" diyebilirsiniz. Claude referanstan ışığı, kadrajı ve temposunu çıkarır, kopyalamaz. Sonuç iyi olunca "bu iyi oldu, kaydet" deyin: Claude o sonucu iyi yapan kuralı `CLAUDE.md` içindeki "Kendi kurallarım" bölümüne yazar ve sonraki her sahnede uygular. Sistem yapa yapa sizin tarzınıza oturur.

Çıktıda gerçek kişiler görünmesin; kurgusal karakter çizin. Referans dosyasını açık bir repoya eklemeyin.

## Claude için kurulum

Kullanıcı "bu sistemi kur" dediğinde sırayla:

1. Repoyu klonla (`git clone <repo adresi>`), klasöre gir.
2. Node.js 18+, npm, ffmpeg ve Google Chrome/Chromium var mı bak. Eksik olanı kullanıcıya söyle; macOS'ta Homebrew varsa ffmpeg'i `kur.sh` kurar. Chrome farklı yerdeyse `CHROME_PATH` ortam değişkenini ayarla.
3. `sh kur.sh` çalıştır (npm bağımlılığı, gerekirse ffmpeg).
4. `npm run ornek` ile 3 saniyelik deneme al, `renders/deneme.mp4` oluştuğunu doğrula.
5. Kullanıcıya Claude Code'u bu klasörde açmasını söyle ve ilk sahne için bir hikaye iste.

## Elle kurulum

Gerekenler: **Claude Code, Node.js 18+, npm, ffmpeg ve Google Chrome veya Chromium**. Ses zarfı aracı için ayrıca Python 3 gerekir, Python paketi kurulmaz. Claude Code hesabınız ve bağımsız izleyicinin CLI hesabı size aittir.

```bash
git clone https://github.com/UgurKeskekci/kodla-animasyon-kit
cd kodla-animasyon-kit
sh kur.sh
```

Puppeteer Core 24.43.1 sürümü Node 18 desteği için sabittir, ayrı bir tarayıcı indirmez. Geliştirme ortamı macOS'tur. Windows'ta Node/Python komutlarını terminalden, `.sh` dosyalarını Git Bash ile çalıştırabilirsiniz; Windows ve Linux'ta bu kit ayrıca denenmedi.

## Çalışan örnek ve render

[`ornekler/slime-canli/`](ornekler/slime-canli/) içinde 20 saniyelik, dikey ve sessiz örnek var. `film.html` dosyasını tarayıcıda açıp tıklayın; ok tuşlarıyla kare kare bakın.

```bash
npm run ornek
# 3 saniye, renders/deneme.mp4

node araclar/render.mjs ornekler/slime-canli/film.html --cikti renders/slime.mp4
# Tam 20 saniye

node araclar/render.mjs calisma/slime/film.html --bas 3 --sure 3 --cikti renders/duzeltme.mp4
# Yalnız düzeltilen aralık
```

Render 24 kare/sn üretir. Süre en yakın kareye yuvarlanır, başlangıç 1/24 saniyenin katı olmalıdır. Mevcut çıktının üstüne yazmaz; her tur yeni ad verin. Klasördeki MP4'ler ve `renders/` git'e girmez.

## Bağımsız izleyici

Videoyu yapan model bazen kendi çizim hatasını kaçırıyor. Ayrı bir Gemini oturumuna yalnız videoyu ve [izleyici istemini](araclar/izleyici-istemi.md) verin. Kod geçmişini vermeyin. Sesli izleyip saniyeli hata listesi çıkarsın, Claude bu listeyi düzeltsin.

Oturum açılmış kendi Gemini CLI'ınızla:

```bash
sh araclar/izlet.sh renders/slime.mp4 > renders/izleyici.md
# Antigravity CLI kullanıyorsanız:
IZLEYICI_CLI=agy sh araclar/izlet.sh renders/slime.mp4 > renders/izleyici-agy.md
```

Betik yeni bir CLI oturumu başlatıp yerel video yolunu verir. CLI/model sürümünün video ve ses okuma desteği gerekir; yalnız yol vermek her sürümde yeterli olmayabilir. Raporun ilk satırlarında erişim doğrulamasına bakın. Destek yoksa videoyu Gemini'nin medya destekli sohbetine ekleyip aynı istemi yapıştırın. GPT ile de bağımsız kare denetimi yapabilirsiniz; yalnız kare gören bir oturumdan ses senkronu yorumu istemeyin. [Gemini CLI dosya araçları](https://geminicli.com/docs/tools/file-system/) sürüme göre değişebilir.

Videoyu izleyici hizmetine siz göndermiş olursunuz. Sonuçtaki her öneriyi uygulamak yerine gerçek hatayı karede doğrulayın. İyi çalışan karakteri, renkleri ve zamanlamayı koruyun. Sessiz örnekte ses denetimi yapılamaz.

## Sık karşılaşılan hatalar

| Sorun | Nasıl düzeltilir |
| --- | --- |
| Titreme, takılma | 12 çizimi 24 kareye kopyalamayın. Her kareyi `kare / 24` zamanından yeniden çizin. Rastgele dokuyu sabit tohumla üretin. Bilerek durağan planda aynı kare normaldir. |
| Sakal, saç veya kolun taşması | Başın ve gövdenin yerel koordinatında çizin. Kol uzunluğunu, dirseği, nesneye temasını ve çizim sırasını kontrol edin. Sorunun olduğu saniyeyi düzeltin. |
| Ağız ses gelmeden açılıyor | Bu denemelerde Whisper kelime zamanları 0,4-0,6 sn erken geldi. Ağzı kelime zamanından değil, kullanılan konuşma sesinin kare başına şiddetinden sürün. |
| Efekt konuşmayı örtüyor | Konuşma anında efektleri kısın. Slime yoğurma durduğunda yoğurma sesi de dursun. |

### Ses zarfı

Önce konuşma kaydını PCM WAV'a çevirin, ardından kare başına 0-1 ağız açıklığı üretin:

```bash
ffmpeg -i calisma/konusma.m4a -ac 1 -ar 48000 -c:a pcm_s16le calisma/konusma.wav
python3 araclar/ses-zarfi.py calisma/konusma.wav calisma/agiz.json
```

JSON'daki `values` dizisini HTML içine gömün. Ağız açıklığı `values[Math.floor((t - sesBaslangici) * fps)] ?? 0` olur. Her konuşmacı için yalnız kendi konuşma kanalını ölçün, müzikli son miksi kullanmayın. Sesi değiştirirseniz zarfı yeniden çıkarın. Zarf sessizliği kapatır; sesin hangi harf olduğunu tahmin etmez.

Son ses bandını filmle aynı zaman çizelgesinde hazırlayın (ilk konuşma geç başlıyorsa başında sessizlik olsun):

```bash
node araclar/render.mjs calisma/slime/film.html --ses calisma/mix.wav --cikti renders/sesli.mp4
```

`--bas` kullanıldığında ses de aynı saniyeden kesilir. Kısa ses, görüntü sonuna kadar sessizlikle tamamlanır. Ses verilmezse çıktı sessizdir; HTML içindeki tarayıcı sesleri otomatik kaydedilmez.

## Ekstra: cinecode ile de deneyebilirsiniz

[cinecode](https://github.com/sarpstar/cinecode), Sarp Yıldız'ın ([@sarpstar](https://github.com/sarpstar)) MIT lisanslı, daha kapsamlı ayrı kitidir. Videoda onu da kullandık. Claude Code'a "cinecode skill'ini https://github.com/sarpstar/cinecode adresinden kur" yazabilirsiniz. Güncel gereksinimleri kendi README'sinde kontrol edin. Emeği için Sarp'a teşekkürler.

Bu repo cinecode kitini dağıtmaz. Yalnız slime örneği cinecode tabanlı filmden sadeleştirildi; dosyanın başında atfı, yanında [MIT lisans metni](ornekler/slime-canli/LICENSE-cinecode) var.

## Dosyalar

```text
CLAUDE.md                          Claude'un okuduğu kurallar, "Kendi kurallarım"
.claude/skills/kodla-film/SKILL.md   Claude'un izleyeceği akış
araclar/render.mjs                 Canvas karelerini MP4'e çevirir
araclar/izlet.sh                   Bağımsız izleyici CLI örneği
araclar/izleyici-istemi.md          Saniyeli hata listesi istemi
araclar/ses-zarfi.py               WAV'dan ağız açıklığı JSON'u
ornekler/slime-canli/              Tek dosyalık sessiz film
kur.sh                            Kurulum
```

Kod [MIT](LICENSE). Uğur Keşkekçi, 2026.
