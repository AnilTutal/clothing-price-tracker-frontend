# 👕 Kıyafet Fiyat Karşılaştırma Platformu

Farklı mağazalardaki kıyafet fiyatlarını karşılaştırmayı sağlayan platformumuzun **React + TypeScript + SCSS** tabanlı arayüz (Frontend) projesi.

> 📌 **Proje mimarisi, klasörlerin ne işe yaradığı, neden bu teknolojilerin seçildiği ve Backend/Veritabanı önerileri için [ACIKLAMA.md](./ACIKLAMA.md) dosyasına göz atın.**

---

## 🚀 Projeyi Bilgisayarınızda Nasıl Çalıştırırsınız?

Projeyi bilgisayarınıza çektikten (`git clone`) sonra çalıştırmak için **iki farklı yöntem** vardır. Şu an sadece arayüz (Frontend) geliştirdiğimiz için **1. Yöntem** herkes için yeterlidir.

### Yöntem 1: Standart Çalıştırma (Önerilen)
Bilgisayarınızda **Node.js** kurulu olması yeterlidir (Docker kurmanıza gerek yoktur). Projedeki `package-lock.json` dosyası sayesinde hepimizin bilgisayarına birebir aynı paket sürümleri inecektir.

```bash
# 1. Kendi isminize ait branch'e (dala) geçin (anil / sena / irem / berkay)
git checkout sena

# 2. Kütüphaneleri yükle (Sadece ilk kurulumda veya yeni paket eklendiğinde)
npm install

# 3. Projeyi başlat (Otomatik olarak varsayılan tarayıcınızda açılır)
npm run dev
```

### Yöntem 2: Docker ile Çalıştırma (Opsiyonel)
Bilgisayarınızda **Docker Desktop** yüklüyse, projeyi izole bir konteyner içinde çalıştırabilirsiniz:

```bash
docker compose up --build
```
