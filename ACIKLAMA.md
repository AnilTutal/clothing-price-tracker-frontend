# 📖 Proje Açıklama ve Mimari Rehberi (Ekip İçin)

Bu doküman, **Kıyafet Fiyat Karşılaştırma (Cimri benzeri)** projemizde hangi klasörün ne işe yaradığını, neden bu teknolojileri seçtiğimizi ve bundan sonraki aşamalarda (Backend, Veritabanı, Araçlar) neler kullanacağımızı ekipteki herkesin kolayca anlaması için hazırlanmıştır.

---

## 1. Neden Bu Teknolojileri Seçtik?

### ⚡ Neden Vite Kullandık? (`vite.config.ts`)
- Eskiden React projeleri `create-react-app` ile kuruluyordu ancak React ekibi onu resmi olarak emekliye ayırdı çünkü çok yavaş çalışıyordu ve yüzlerce gereksiz paket indiriyordu.
- **Vite**, yeni nesil bir derleme aracıdır. `npm run dev` yazdığımızda projeyi **1 saniyede** açar ve kodda bir harf değiştirdiğimizde tarayıcıya anında yansıtır.
- İçeride yazdığımız kodda hiçbir fark yoktur; **%100 standart React** kodu yazıyoruz.
- Ayrıca `vite.config.ts` içine `open: true` ayarı eklendiği için `npm run dev` yazdığımızda tarayıcı (Chrome) otomatik olarak açılır.

### 🔷 Neden `.tsx` (TypeScript) Kullandık?
- Düz JavaScript (`.jsx`) yerine TypeScript (`.tsx`) kullanıyoruz.
- **Sebebi:** Ekipçe çalışırken bir kıyafet verisinin içinde hangi özelliklerin (`id`, `name`, `brand`, `price`, `offers` vb.) bulunduğunu kod editörünün bize otomatik tamamlama ile göstermesini sağlar.
- Birimiz yanlışlıkla sayı olması gereken fiyata metin atamaya çalışırsa veya bir değişkenin adını yanlış yazarsa, tarayıcıda hata almayı beklemeden daha kodu yazarken bizi uyarır.

### 🎨 Neden `.scss` (SASS) Kullandık?
- Düz `.css` yerine `.scss` kullanıyoruz.
- **Sebebi:** CSS kodlarını iç içe (nested) çok daha düzenli yazmamızı sağlar. Örneğin `.navbar` sınıfının içindeki `.navbar__link` sınıfını tek bir blok altında toplayabiliriz.
- Ayrıca sitemizin ana renklerini (`$primary-color`, `$bg-color` vb.) `src/styles/_variables.scss` dosyasında tanımladık. Yarın sitemizin ana rengini değiştirmek istersek 20 dosyayı tek tek gezmek yerine sadece tek bir satırı değiştirmemiz yetecek.

### 🌍 Neden `i18n` (Çoklu Dil) Yapısı Kurduk?
- Sayfaların içine doğrudan `<h1>Kıyafetler</h1>` gibi sabit yazılar gömmek (hardcode yapmak) büyük projelerde karmaşaya yol açar.
- Kurumsal projelerdeki (Metronic vb.) gibi `src/i18n/messages/` altında **`tr.json`** ve **`en.json`** dosyaları oluşturduk.
- Tüm metinleri `"NAV.HOME": "Ana Sayfa"` şeklinde anahtarlarla çağırıyoruz. Bu sayede kodumuz çok temiz kalıyor ve üst menüdeki **TR / EN** butonlarıyla tüm site anında Türkçe ve İngilizce arasında geçiş yapabiliyor.

### 🐳 Neden Docker Ekledik? (`Dockerfile` & `docker-compose.yml`)
- Ekipçe çalışırken en büyük sorun *"Benim bilgisayarımda çalışıyordu, sende neden çalışmadı?"* sorunudur.
- Şu an sadece arayüz (Frontend) yazarken `package-lock.json` dosyası paket sürümlerimizi eşit tuttuğu için **kimsenin bilgisayarına Docker kurmasına gerek yoktur** (`npm run dev` yeterlidir).
- Ancak ileride projeye **Backend (API)** ve **Veritabanı (PostgreSQL)** eklediğimizde veya projeyi sunucuya yüklediğimizde, herkesin bilgisayarına tek tek kurulum yapmak yerine Docker ile tek komutla (`docker compose up`) tüm sistemi çalıştırabileceğiz.

---

## 2. Klasör ve Dosya Düzeni (Nerede Ne Var?)

Projemizin tüm kaynak kodları **`src/`** klasörünün içindedir:

- 📁 **`src/pages/` (Sayfalarımız):**
  Sitemizdeki her ana sayfanın kendi klasörü, kendi `.tsx` dosyası ve kendi `.scss` tasarım dosyası vardır:
  - `Home/` (`Home.tsx` & `Home.scss`) 👉 Ana Sayfa
  - `Products/` (`Products.tsx` & `Products.scss`) 👉 Kıyafetlerin listelendiği ve filtrelendiği sayfa
  - `Compare/` (`Compare.tsx` & `Compare.scss`) 👉 Seçilen kıyafetlerin fiyat/özellik karşılaştırma sayfası
  - `ProductDetail/` (`ProductDetail.tsx` & `ProductDetail.scss`) 👉 Tek bir kıyafetin mağazalardaki fiyatlarının ve fiyat grafiğinin göründüğü detay sayfası

- 📁 **`src/routes/` (Sayfa Yönlendirmeleri):**
  - `AppRoutes.tsx` 👉 Hangi URL adresine (`/`, `/products`, `/compare`, `/product/:id`) girildiğinde hangi sayfanın ekrana geleceğini belirler. Yeni bir sayfa açtığımızda buraya yeni bir `<Route>` satırı ekleriz.

- 📁 **`src/components/` (Ortak Bileşenler):**
  - Birden fazla sayfada tekrar tekrar kullanacağımız parçalar (Üst Menü `Navbar`, Alt Bilgi `Footer`, Ürün Kartı `ProductCard`, Arama Çubuğu `SearchBar` vb.) burada yer alır.

- 📁 **`src/i18n/` (Dil Dosyaları):**
  - `messages/tr.json` 👉 Türkçe metinlerin bulunduğu dosya.
  - `messages/en.json` 👉 İngilizce metinlerin bulunduğu dosya.
  - `I18nProvider.tsx` 👉 Sayfalarda `const { t } = useI18n();` diyerek `t('ANAHTAR_ADI')` şeklinde metinleri çekmemizi sağlayan yapı.

- 📁 **`src/styles/` (Genel Tasarım Ayarları):**
  - `_variables.scss` 👉 Ortak renk ve boyut değişkenleri.
  - `global.scss` 👉 Tüm site için geçerli sıfırlama (margin/padding reset) ve yazı tipi ayarları.

- 📁 **`src/types/` (Veri Tipleri):**
  - `index.ts` 👉 Kıyafet (`ClothingItem`) ve mağaza fiyat teklifi (`ClothingOffer`) gibi TypeScript arayüzlerinin (`interface`) tanımlandığı yer.

- 📁 **`src/services/` (API İstekleri):**
  - `api.ts` 👉 Backend hazır olduğunda veritabanından ürünleri ve fiyatları çekeceğimiz fonksiyonların yazılacağı yer.

---

## 3. Git Branch (Dal) Çalışma Düzenimiz

Kodlarımızın birbirine girmemesi ve ana projemizin (`main`) bozulmaması için hepimizin adına özel **4 ayrı branch (dal)** önceden hazır olarak açılmıştır:

- **`main`** 👉 Her zaman çalışan, temiz ana dalımız (Burada doğrudan kod yazmıyoruz).
- **`anil`** 👉 Anıl'ın çalışma dalı
- **`sena`** 👉 Sena'nın çalışma dalı
- **`irem`** 👉 İrem'in çalışma dalı
- **`berkay`** 👉 Berkay'ın çalışma dalı

### Herkes Kendi Bilgisayarında Nasıl Çalışacak?
1. Projeyi bilgisayarınıza çektikten sonra **VS Code'un sol en alt köşesindeki** dal ismine (`main`) tıklayıp kendi isminizi (`anil`, `sena`, `irem` veya `berkay`) seçin. *(Veya terminalde `git checkout kendi_isminiz` yazın).*
2. Kendi dalınızda kodunuzu yazıp kaydettikten sonra GitHub'a göndermek için:
   ```bash
   git add .
   git commit -m "Yaptığınız değişikliğin kısa açıklaması"
   git push origin kendi_isminiz
   ```
3. İşiniz bittiğinde GitHub üzerinden kendi dalınızı `main` dalı ile birleştirin (**Pull Request -> Merge**).
4. `main` dalına yeni bir özellik eklendiğinde kendi dalınızı güncellemek için:
   ```bash
   git pull origin main
   ```

---

#### 📂 Kurulan Backend (API) Klasör Düzeni (`Clothing-price-tracker-api`)
Başlangıç için masaüstünde ayrı bir klasör olarak C# (.NET Web API) iskeleti de hazır kurulmuştur:

```text
Clothing-price-tracker-api/
├── ClothingPriceTrackerApi.sln          <-- Visual Studio 2022 ile çift tıklayıp açacağımız ana dosya
└── ClothingPriceTracker.Api/
    ├── Controllers/
    │   └── ProductsController.cs        <-- Test amaçlı "Merhaba" döndüren örnek endpoint (/api/products)
    ├── Models/                          <-- Kıyafet, Mağaza, Fiyat sınıflarını koyacağımız klasör
    ├── Services/                        <-- İş mantığı ve fiyat karşılaştırma servisleri klasörü
    ├── Data/                            <-- İleride PostgreSQL (DbContext) bağlantısını koyacağımız klasör
    ├── Program.cs                       <-- Otomatik Swagger açan ayar + CORS izni
    └── ClothingPriceTracker.Api.csproj  <-- Proje ve paket (Swashbuckle) dosyası
```
> **Not:** API projesi tamamen ayrı bir klasörde olduğu için, API'yi çalıştırmadan da Frontend (`Clothing-price-tracker-frontend`) üzerinde `npm run dev` ile bağımsız olarak çalışabilirsiniz. API'yi çalıştırmak istediğinizde `ClothingPriceTrackerApi.sln` dosyasını Visual Studio 2022'de açıp **Play** tuşuna basmanız (veya terminalde `dotnet run --project ClothingPriceTracker.Api` yazmanız) yeterlidir; tarayıcıda otomatik olarak `/swagger` ekranı açılacaktır.

### 📦 3. Frontend İçin Kuracağımız Yardımcı Paketler
1. **`axios` (`src/services/api.ts` için):**
   - React'ten C# / Java API'ye istek atarken standart `fetch` yerine kullanacağız. API adresini (`http://localhost:5000/api`) tek bir yerde tanımlayıp her sayfadan kolayca çağıracağız.
2. **`lucide-react` veya `react-icons` (İkon Kütüphanesi):**
   - Arama büyüteci, filtre ikonu, favorilere ekle (kalp), mağazaya git oku gibi ikonları tek tek resim olarak indirmek yerine `<Search />`, `<Heart />` şeklinde bileşen olarak kullanmamızı sağlar.
3. **`recharts` (Fiyat Geçmişi Grafiği):**
   - Cimri'nin en dikkat çekici özelliği ürün detay sayfasındaki **"Son 30 Günlük Fiyat Değişim Grafiği"**dir. `recharts` paketiyle React'te bu çizgi grafiği 10 satır kodla çok şık bir şekilde çizebiliriz.

### 🤖 4. Mağazalardan Fiyat Çekme (Veri Kaynağı / Web Scraping)
- **1. Adım (Başlangıç - Seed Data):** Arayüzü ve API'yi geliştirirken mağazalardan gerçek zamanlı veri çekmeyi beklememek için veritabanına hazır örnek kıyafet ve fiyat verileri (Seed Data) ekleyeceğiz.
- **2. Adım (Fiyat Botu / Scraper):** Sistem tamamlandığında mağazalardaki (Zara, Pull&Bear, Trendyol vb.) güncel fiyatları çekmek için **Python (Playwright / BeautifulSoup)** veya **C# (HtmlAgilityPack / PuppeteerSharp)** ile küçük bir bot yazıp veritabanındaki fiyatları otomatik güncelleyeceğiz.

---

## 4. API Nedir, Neden Kuruyoruz ve Nasıl Çalışır? (Detaylı Rehber)

### 🍽️ 1. Neden API'ye İhtiyacımız Var? (React Tek Başına Yetmez mi?)
Sitemizi bir restoran gibi düşünebiliriz:
- **React (Frontend):** Restoranın **müşteri salonu ve menüsüdür**. Çok şıktır ama mutfağa girip yemek pişiremez.
- **PostgreSQL (Veritabanı):** Restoranın **kilitli erzak deposudur**. Tüm kıyafetler, mağazalar ve fiyatlar burada durur.
- **C# Web API (Backend):** Müşteri ile mutfak/depo arasındaki **garsondur**.

**Peki neden React doğrudan PostgreSQL veritabanına bağlanamaz?**
1. **Güvenlik (En Önemli Sebep):** React kodları kullanıcının tarayıcısında (Chrome'da) çalışır. Siteye giren herhangi biri klavyeden `F12` tuşuna basıp yazılan tüm React kodlarını görebilir. Veritabanı şifresini React'in içine yazarsak, siteye giren herkes şifreyi görür ve bütün tabloları silebilir! API ise sunucuda (arka planda) kapalı çalışır; kimse API'nin içindeki şifreleri göremez.
2. **Ağır İşlemler ve Kurallar:** Örneğin binlerce kıyafet arasından *"En ucuz 10 Zara montu bul, son 30 gündeki fiyat indirim oranını hesapla"* işlemini kullanıcının telefonuna/tarayıcısına yaptırırsak site donar. Bu hesaplamayı C# API saniyenin binde birinde yapıp React'e sadece hazır sonucu (JSON listesini) gönderir.
3. **Fiyat Çekme Botu (Scraper):** Tarayıcıdaki React, güvenlik kısıtlamaları nedeniyle Trendyol veya Zara'nın sitesinden doğrudan fiyat çekemez. Ancak arka planda çalışan C# API'miz istediği siteden fiyatları çekip veritabanına kaydedebilir.

---

### 🧪 2. Swagger Nedir? Ne İşe Yarar?
Normalde bir API yazdığımızda onun ekranı, butonu veya rengi yoktur; sadece arka planda çalışan görünmez bir programdır.
- C# ile *"Kıyafetleri getiren bir kod (`ProductsController`)"* yazdığımızda, **daha React sayfasını yapmadan bu kodun doğru çalışıp çalışmadığını nasıl deneyeceğiz?**
- İşte **Swagger**, yazdığımız görünmez C# API uçlarını (endpoint'lerini) otomatik olarak okur ve bize tarayıcıda **hazır, butonlu bir test sayfası** üretir!
- Swagger sayfasına girip `GET /api/Products` kutusuna tıklayarak **"Try it out -> Execute"** butonuna bastığımızda API'nin ne cevap döndürdüğünü anında görebiliriz.
- Ayrıca ekipte React sayfasını yapan arkadaşımız *"Ürünleri çekmek için hangi adrese istek atacağım?"* diye sormak zorunda kalmaz; Swagger ekranını açıp tüm adresleri oradan görür ve test eder.

---

### 🔍 3. API'nin Kontak Anahtarı: `Program.cs` Satır Satır Ne Yapıyor?
`Program.cs` dosyası, C# API ilk çalıştığında okunan ana başlatıcı dosyadır:

#### A) Hazırlık Kısmı (Servisleri Ekleme)
```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();          // 1. "Projede Controller'lar (ProductsController gibi) olacak, bunları tanı" der.
builder.Services.AddEndpointsApiExplorer(); // 2. API'deki tüm adresleri (/api/products vb.) keşfetmesini sağlar.
builder.Services.AddSwaggerGen();           // 3. Keşfedilen bu adreslerden Swagger test sayfasını üretir.
```

#### B) CORS İzni (React ile API'nin Konuşabilmesi İçin)
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});
// React (localhost:5173) ile C# API farklı portlarda çalıştığı için, API'nin React'ten gelen isteklere izin vermesini sağlar.
```

#### C) Swagger Ekranını Aktif Etme
```csharp
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.RoutePrefix = "swagger"; // Tarayıcıda adresin sonuna /swagger yazılınca bu ekran açılsın der.
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Clothing Price Tracker API v1");
});
```

#### D) Otomatik Tarayıcı Açma Kodu
Normalde projeyi çalıştırdığımızda tarayıcıyı elimizle açıp adresi yazmamız gerekir. Aşağıdaki kod ise **API başlar başlamaz varsayılan tarayıcıyı (Chrome) otomatik açıp `/swagger` sayfasına yönlendirir**:
```csharp
app.Lifetime.ApplicationStarted.Register(() =>
{
    var baseUrl = app.Urls.FirstOrDefault(); // Çalıştığı adresi bul (örn: http://localhost:5120)
    if (string.IsNullOrWhiteSpace(baseUrl)) return;

    var swaggerUrl = baseUrl.TrimEnd('/') + "/swagger"; // Sonuna /swagger ekle
    try { Process.Start(new ProcessStartInfo(swaggerUrl) { UseShellExecute = true }); } // Otomatik Chrome'da aç!
    catch { }
});
```

#### E) Çalıştırma Kısmı
```csharp
app.UseCors("AllowFrontend"); // React'ten gelen isteklere izin politikasını devreye sokar.
app.UseHttpsRedirection();    // Güvenli bağlantıya yönlendirir.
app.MapControllers();         // Gelen istekleri ilgili Controller'a (örn: ProductsController) bağlar.
app.Run();                    // Ve garsonu (API'yi) nöbete başlatır!
```

---

### 🖥️ 4. API Projesi GitHub Deposu ve Visual Studio 2022 Kullanımı

API projemiz **`.NET 8.0` (`net8.0`)** sürümüne sabitlenmiş (tüm Visual Studio 2022 sürümleriyle %100 uyumlu olması için) ve ayrı bir GitHub deposuna yüklenmiştir:
- **Backend (API) GitHub Linki:** `https://github.com/AnilTutal/clothing-price-tracker-api`
- Tıpkı Frontend projesinde olduğu gibi API deposunda da **`main`**, **`anil`**, **`sena`**, **`irem`** ve **`berkay`** branch'leri hazır açılmıştır. *(İleride kullanılmayan branch olursa GitHub'daki `branches` sekmesinden tek tıkla silinebilir).*

#### Visual Studio 2022'de API Nasıl Çalıştırılır?
1. `Clothing-price-tracker-api` klasöründeki **`ClothingPriceTrackerApi.sln`** dosyasına çift tıklayarak Visual Studio 2022'de açın.
2. Üst menünün ortasındaki yeşil **`https` (Play)** tuşuna (veya klavyeden **`F5`** tuşuna) basın.
3. Proje derlenecek ve otomatik olarak Chrome'da **`/swagger`** test ekranı açılacaktır. Durdurmak için üstteki **kırmızı kare (Stop)** butonuna basabilirsiniz.

#### Visual Studio 2022'de Git ve Branch İşlemleri Nasıl Yapılır?
- **Dal (Branch) Değiştirme:** Visual Studio 2022 penceresinin **en sağ alt köşesindeki** dal ismine (`main` / `anil`) tıklayarak açılan listeden kendi isminizi (`anil`, `sena`, `irem`, `berkay`) seçebilirsiniz.
- **Kod Gönderme (Commit & Push):**
  - Üst menüden **`Git` -> `Git Değişiklikleri` (Git Changes)** seçeneğine tıklayın.
  - Bu pencereyi başlığından sürükleyip sağ taraftaki **Çözüm Gezgini / Özellikler** panelinin yanına veya altına sabitleyebilirsiniz.
  - Yaptığınız değişiklik için kutuya kısa bir açıklama yazıp **"Tümünü İşle" (Commit All)** butonuna, ardından hemen yanındaki **Yukarı Ok (`↑` Push / Gönder)** butonuna basarak kodunuzu hiç terminal komutu yazmadan GitHub'a gönderebilirsiniz.




## 4. Gelecek Aşamalar İçin Mimari Öneriler (Backend, Veritabanı ve Araçlar)

İskeletimiz hazır. Bundan sonraki aşamalarda işimizi en çok kolaylaştıracak ve projeyi profesyonel seviyeye taşıyacak önerilerimiz şunlardır:

### 🗄️ 1. Veritabanı: **PostgreSQL + pgAdmin 4**
- **Neden PostgreSQL?**
  - Kıyafetler, markalar, kategoriler, mağazalar (Zara, Bershka, Trendyol, H&M vb.) ve fiyat geçmişi birbiriyle ilişkili tablolardır; PostgreSQL bu ilişkisel yapıyı çok hızlı yönetir.
  - Kıyafetlerin özellikleri kategoriye göre değişir (ayakkabıda numara `42`, tişörtte beden `S/M/L`, kumaş `%100 Pamuk`). PostgreSQL'in **`JSONB`** özelliği sayesinde her kategori için ayrı tablo açmak yerine bu esnek özellikleri tek bir sütunda tutabiliriz.
- **Neden pgAdmin 4?**
  - Veritabanındaki tabloları görsel olarak görmek, veri eklemek ve SQL sorgularını kolayca test etmek için **pgAdmin 4** kullanacağız.

### ⚙️ 2. Backend (API): **C# (.NET Web API)** *(veya Java Spring Boot)*
- **Önerimiz C# (.NET Web API + Entity Framework Core):**
  - Kurulumu çok hızlıdır ve **Swagger** (API test ekranı) hazır kurulu gelir.
  - **Entity Framework Core (EF Core)** sayesinde C# ile yazdığımız sınıflardan PostgreSQL tablolarını otomatik olarak oluşturabiliriz (Migration).
  - **Swagger** sayesinde Backend'i yazan arkadaşımız bir uç (endpoint) yazdığında, Frontend yazan arkadaşımız tarayıcıdan o adresi görüp anında test edebilir.
  - *(Alternatif: Eğer ekip üyeleri okul derslerinden dolayı Java'ya daha hakimse **Java Spring Boot** da kullanılabilir.)*
