# Canlı Slime

20 saniye, 1080x1920, 24 kare/sn. Tek karakter mor slime yoğurur; hediyeler gelince
su döker, kameraya bakar ve sim ekler. Yorumlar ve izleyici sayıları kurgusaldır.
Bu sürüm **sessizdir**. Ağzın hareketi asıl yapımda kullanılan sesin şiddetinden çıkarılmış
sayısal zarfı gösterir; ses dosyaları dağıtılmaz.

İsteğin okunabilir hali:

```text
Canlı yayın izleme arayüzünde tek karakter slime yapsın. Dikey olsun.
Su ekle hediyesi gelince su döksün, adımı söyle gelince kameraya baksın,
sim ekle gelince sim serpsin. Karakteri ve bütün arayüzü kodla çizin.
```

Asıl yapım kaydında istek 16:58, ilk taslak 17:08, son hal 17:30:
ilk taslak **10 dakika**, düzeltmelerle son hal **32 dakika**. Bunlar bu HTML'in
render süresi değildir. O yapımdaki 20 saniyelik render yaklaşık 80 saniye sürmüştü;
bu sade sürümün hızı bilgisayarınıza göre değişir.

`film.html` dosyasını tarayıcıda açın. Tıklayınca oynar, ok tuşları bir kare ilerletir.
Repo kökünden MP4 almak için:

```bash
node araclar/render.mjs ornekler/slime-canli/film.html --cikti renders/slime.mp4
```

## Ses nasıl hazırlanmıştı

Konuşmalar macOS'un Yelda sistem sesiyle TTS olarak üretildi. Kendi bilgisayarınızda
bu ses kuruluysa, örneğin ilk repliği şöyle oluşturabilirsiniz:

```bash
mkdir -p calisma/ses
say -v Yelda -o calisma/ses/s1.aiff 'Su geldi, döküyorum!'
ffmpeg -i calisma/ses/s1.aiff -ac 1 -ar 48000 -c:a pcm_s16le calisma/ses/s1.wav
python3 araclar/ses-zarfi.py calisma/ses/s1.wav calisma/ses/s1.json
```

| Başlangıç | Replik |
| --- | --- |
| 3,25 sn | Su geldi, döküyorum! |
| 9,50 sn | Selam, Elif. Hoş geldin! |
| 11,75 sn | Sim geldi, üç kutu! |
| 15,90 sn | Yaren, su koruma için teşekkürler! |

Yeni sesin süresi ve şiddeti farklı olabilir. Her repliğin yeni JSON `values` dizisini
HTML'deki `AGIZ` listesinde ilgili başlangıca yazın; gerekirse konuşma balonu aralığını
`SOZ` içinde ayarlayın. Kendi miksinizde replikleri tablodaki saniyelere yerleştirin ve
`--ses calisma/mix.wav` ile render edin. Yeni kaydı eski zarfla eşlemeyin.
Asıl yapımın efekt ve ortam kayıtları da dahil edilmedi. İsterseniz kendi kayıtlarınızı ekleyin.

## Kaynak ve lisans

Örnek, video yapımında oluşturulmuş cinecode tabanlı Canlı Slime filminin sadeleştirilmiş
halidir. Sahne, hareketler ve ölçülmüş ağız zarfları korundu. Genel motorun kullanılmayan
yardımcıları, ses yükleyicileri ve dış fontlar çıkarıldı; sistem fontu ve küçük bir önizleme
eklendi. Referans görsel ve videolar dahil edilmedi.

[cinecode](https://github.com/sarpstar/cinecode), Sarp Yıldız ([@sarpstar](https://github.com/sarpstar)), MIT.
Atıf HTML'in başında, tam lisans [LICENSE-cinecode](LICENSE-cinecode) dosyasında.
