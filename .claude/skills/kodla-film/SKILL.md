---
name: kodla-film
description: Görsel veya video üretim modeli kullanmadan, HTML Canvas ile tek dosyalık kısa animasyon film oluşturur ya da saniyesi belirtilen hataları düzeltir. Sabit 24 kare/sn render, ses zarfıyla ağız senkronu ve bağımsız izleyici döngüsü kullanır.
---

# Kodla film

Görüntünün tamamını kodla çiz. Görsel/video üretim modeline başvurma. Başlangıç örneği
`ornekler/slime-canli/film.html`, araçlar `araclar/` altında. Komutları repo kökünde çalıştır.
Çalışmayı `calisma/<ad>/` içine yaz, kaynak örneğin üstüne yazma.

## Akış

0. **Kuralları oku.** Repo kökündeki `CLAUDE.md` içindeki "Kendi kurallarım" bölümünü oku; oradaki
   kurallar bu dosyadaki genel tercihlerden önce gelir.
1. **Kısa soru turu.** Eksikse konu, süre, yatay/dikey oran, çizim tarzı ve ses isteğini birlikte sor.
   Verilmiş bilgiyi tekrar sorma. Başlangıç için 30 saniyelik tek sahne öner.
   Referans verildiyse kadraj, hareket ve tempo çıkar; gerçek kişileri çıktıya taşıma.
2. **Tek dosya.** Saniyeli kısa planı göster, `film.html` yaz. Karakter, oda, nesne ve arayüz
   aynı dosyada olsun. Sesi kullanıcının kendi kaydından veya kullanma hakkı olan TTS'ten al.
   Kaynağı ve lisansı bilinmeyen medya kullanma. Metinde Türkçe, siz dili, şapkasız yazım kullan;
   uzun tire kullanma. Başka kitin kodundan yararlanırsan atfını ve lisansını koru.
3. **Taslak render.** Önce ilk 3 saniye ve riskli hareketin 2-3 saniyesi:

   ```bash
   node araclar/render.mjs calisma/<ad>/film.html --sure 3 --cikti renders/taslak-1.mp4
   ```

   Doğruysa bütün taslağı render et. Ses varsa son miksin yolunu `--ses` ile ver.
4. **Kendi karelerini denetle.** Başlangıç, hareketin ortası ve sonundan kareler çıkarıp
   gerçekten görüntüle. Örnek: `ffmpeg -ss 4.2 -i renders/taslak.mp4 -frames:v 1 renders/kare.png`.
   Yazı taşması, kol/gövde birleşimi, saç/sakal sınırı, el-nesne teması, gölge ve çizim sırasına bak.
   Aynı kareyi önce ve sonra karşılaştır. Yalnız kodu okuyup "güzel oldu" deme.
5. **Bağımsız izleyici.** Kod yazma sohbetinden ayrı bir Gemini oturumuna videoyu sesli izlet:

   ```bash
   sh araclar/izlet.sh renders/taslak.mp4 > renders/izleyici.md
   ```

   `araclar/izleyici-istemi.md` saniye/hata/düzeltme/korunacak şey ister. Kullanıcının kurulu,
   oturum açılmış CLI'ını kullan. Medya erişimi yoksa izlemiş sayma; destekli sohbette kullanıcıya
   aynı istem ve videoyu ver. GPT yalnız kareleri görebiliyorsa görsel denetimle sınırla.
6. **Hedefli düzelt.** Her notu üç parçaya ayır: **hangi saniye, ne yanlış, ne korunacak**.
   Önce hatayı karede doğrula. Tüm filmi yeniden tasarlama. İyi çalışan karakteri, paleti ve
   hareketleri koru; etkilenen aralığı yeni isimle render edip karşılaştır. Yanlış izleyici
   önerisini gerekçesiyle ele. Ses değiştiyse zarfı da yenile.
7. **Final.** Tam süreyi ve varsa sesi render et, çıktı süresi/kare sayısını `ffprobe` ile
   doğrula. Düzeltmelerin geçtiğini karelerden kontrol et. Çıktı yolunu, süreyi ve kalan
   kusurları bildir. Yapılmamış bir izlemeyi veya ölçülmemiş süre/kalite puanını yazma.
8. **İyi sonucu kaydet.** Kullanıcı sonucu beğenip kaydetmeni isterse, o sonucu iyi yapan kuralı
   `CLAUDE.md` içindeki "Kendi kurallarım" bölümüne tek satır ekle: ne yapıldı, hangi çalışmada,
   neden işe yaradı. Referans videodan çıkan ışık, tempo, kadraj tercihleri de buraya yazılır.
   Kullanıcı onaylamadan kural ekleme; var olan kuralı silme.

## Film sözleşmesi

- `window.READY`: fontlar ve gereken veriler hazır olunca çözülen Promise.
  Sonucu `{width, height, fps: 24, frames}`. En ve boy pozitif çift tamsayı.
- `window.renderFrame(kare)`: ilk canvas'a o kareyi tamamen çizer. Zaman **`kare / 24`**.
  Önce canvas durumunu ve görüntüyü sıfırla. Aynı kareyi farklı sırada çağırınca aynı sonuç gelsin.
- Her saniye **24 ayrı çizim**. 12 çizim üretip kare çoğaltma, zamanı 12'ye yuvarlama.
  Bilerek durağan planda aynı görüntü olabilir. Sabit tohumlu, kareden türeyen rastgelelik kullan;
  her çağrıda ilerleyen global rastgele sayı dizisi kullanma.
- Render sırasında `Date.now()`, gerçek geçen süre veya `requestAnimationFrame` çizimi yönetmesin.
  Araç saati kareye göre ayarlar; sahne doğrudan kare indeksinden hesaplanır. Önizleme döngüsünü
  `capture=1` sorgusunda kapat. CSS animasyonu, zamanlayıcı veya önceki kareye bağlı fizik kullanma.
- Ağdan font/görsel/kütüphane çekme. Canvas çizimi ve sistem fontlarıyla tek HTML içinde kal.
  HTML tarayıcıda da açılabilsin. Render aracı dış ağ isteklerini reddeder.
- Konuşma ağzını Whisper kelime zamanına bağlama. Bu denemelerde 0,4-0,6 sn erken geldi.
  `python3 araclar/ses-zarfi.py konusma.wav agiz.json` ile **yalnız konuşma** şiddetini çıkar.
  `fps` ve `values` verisini HTML'e göm; `values[Math.floor((t - baslangic) * fps)] ?? 0`
  ile ağız açıklığını al. Sessizlikte ağız kapalı olsun. Ses ve görüntüde aynı başlangıcı kullan.
- Ses bandı film başlangıcından itibaren zamanlanmış ayrı dosyadır. Render aracı yalnız
  `--ses` ile verilen dosyayı ekler, tarayıcının sesini kaydetmez.
- Katman sırası ve yerel koordinat kullan: gövde, kol, el ve tutulan nesne birbirine bağlı olsun.
  Sakalı başın alanında kırp; nesneyi tutan elin bilekle bağını kritik karelerde kontrol et.
