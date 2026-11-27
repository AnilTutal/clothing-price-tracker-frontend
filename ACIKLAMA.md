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
Masaüstünde ayrı bir klasör olarak C# (.NET 8 Web API) projemiz ve ortak mağaza veri çekme (Scraper) mimarimiz kurulmuştur:

```text
Clothing-price-tracker-api/
├── ClothingPriceTrackerApi.sln                  <-- Visual Studio 2022 ile çift tıklayıp açacağımız ana dosya
└── ClothingPriceTracker.Api/
    ├── Controllers/
    │   └── ProductsController.cs                <-- Ürün arama ve linkten ürün çekme uçları (/api/products, /api/products/scrape)
    ├── Models/
    │   └── ClothingItem.cs                      <-- Kıyafet (ClothingItem) ve Mağaza Teklifi (ClothingOffer) modelleri
    ├── Services/
    │   ├── Abstractions/
    │   │   └── IStoreScraper.cs                 <-- Tüm mağaza scraper'larının uyduğu ortak arayüz (Interface)
    │   ├── Scrapers/
    │   │   ├── MaviStoreScraper.cs              <-- Mavi canlı ürün çekme adaptörü
    │   │   └── BershkaStoreScraper.cs           <-- Bershka ürün çekme ve URL çözümleyici adaptörü
    │   └── ProductScraperManager.cs             <-- Tüm mağazaları tek merkezden yöneten ve birleştiren yönetici servis
    ├── Data/                                    <-- İleride PostgreSQL (DbContext) bağlantısını koyacağımız klasör
    ├── Program.cs                               <-- Servis kayıtları (DI), otomatik Swagger açan ayar + CORS izni
    └── ClothingPriceTracker.Api.csproj          <-- Proje ve paket (Swashbuckle) dosyası
```
> **Not:** API projesi tamamen ayrı bir klasörde olduğu için, API'yi çalıştırmadan da Frontend (`Clothing-price-tracker-frontend`) üzerinde `npm run dev` ile bağımsız olarak çalışabilirsiniz. API'yi çalıştırmak istediğinizde `ClothingPriceTrackerApi.sln` dosyasını Visual Studio 2022'de açıp **Play** tuşuna basmanız (veya terminalde `dotnet run --project ClothingPriceTracker.Api` yazmanız) yeterlidir; tarayıcıda otomatik olarak `/swagger` ekranı açılacaktır.

---

### 🌐 3.5. Kurulan Ortak Mağaza Veri Çekme (Scraper) Mimarisi ve Axios Bağlantısı

Projemizde mağazalardan (Mavi, Bershka ve ileride eklenecek Zara, Koton vb.) ürün bilgilerini çekmek ve React arayüzünde göstermek için **kurumsal ve genişletilebilir bir mimari** kurulmuştur:

#### A) Neden Doğrudan React İçinden Siteleri Çekemiyoruz?
1. **CORS Güvenlik Engeli:** Tarayıcılar (Chrome), senin sitenin (`localhost:5173`) başka bir sitenin (`mavi.com` veya `bershka.com`) kaynak kodunu doğrudan JavaScript ile okumasına izin vermez.
2. **Bot Korumaları ve SPA Yapısı:**
   - **Mavi (`mavi.com`):** Angular tabanlı bir Single Page Application (SPA) kullanır ve önünde **Cloudflare** vardır. Düz HTML çekildiğinde sayfa boş gelir. Bu yüzden `MaviStoreScraper` sınıfımız Mavi'nin kendi arka plan ürün servisine (`p1-api.mavi.com`) uygun başlıklarla (`Origin`, `Referer`, `User-Agent`) bağlanarak ürünün adını, indirimli/indirimsiz fiyatını, fotoğraf galerisini ve stoktaki bedenlerini doğrudan temiz JSON olarak çeker.
   - **Bershka (`bershka.com`):** Önünde **Akamai Bot Manager** koruması bulunur. `BershkaStoreScraper` sınıfımız önce canlı meta verilerini okumayı dener, Akamai engeli devreye girdiğinde ise Bershka ürün linkini (`/tr/...-c0p162285412.html`) ve katalog verisini çözümleyerek ürünü kesintisiz şekilde döner.

#### B) Neden "Ortak Scraper" Mimarisi (`IStoreScraper` + `ProductScraperManager`) Kurduk?
Her marka için `ProductsController` içine `if (marka == "mavi") ... else if (marka == "bershka")` yazmak yerine **Strategy & Aggregator Pattern** kullandık:
1. **`IStoreScraper.cs` (Ortak Sözleşme):** Tüm mağaza servislerinin uyması gereken kuralları belirler (`StoreName`, `CanHandle(urlOrCode)`, `GetProductByUrlOrCodeAsync`, `SearchProductsAsync`). Hangi mağaza olursa olsun hepsi sonunda aynı ortak `ClothingItem` modelini döndürür.
2. **`MaviStoreScraper.cs` ve `BershkaStoreScraper.cs` (Mağaza Adaptörleri):** Her mağazanın kendine özgü veri çekme mantığı kendi sınıfında izole edilmiştir.
3. **`ProductScraperManager.cs` (Ortak Yönetici):**
   - Kullanıcı arayüzden bir ürün linki yapıştırdığında (`/api/products/scrape?url=...`), `CanHandle` metoduyla linkin Mavi'ye mi yoksa Bershka'ya mı ait olduğunu **otomatik algılar** ve ilgili servisi çalıştırır.
   - Kullanıcı kategori araması yaptığında (`/api/products?q=jean&store=all`), `Task.WhenAll` ile tüm mağazaları **aynı anda (paralel)** sorgular ve sonuçları (`1 Mavi, 1 Bershka` şeklinde dengeli olarak) tek listede birleştirir.
   - **Yeni Marka Eklemek Çok Kolay:** Yarın projeye `Koton` veya `Zara` eklemek istediğimizde mevcut hiçbir kodu bozmadan sadece `KotonStoreScraper : IStoreScraper` sınıfı açıp `Program.cs` içine 1 satır eklememiz yeterlidir!

#### C) Frontend Tarafında Neden `fetch` Yerine `Axios` (`src/services/api.ts`) Kullandık?
React'ten C# API'ye istek atarken standart `fetch` yerine **`axios`** kütüphanesine geçtik ve `src/services/api.ts` dosyasını şu şekilde yapılandırdık:
1. **Merkezi `apiClient` (`axios.create`):**
   - API adresi (`http://localhost:5152/api`), zaman aşımı süresi (`timeout: 15000`) ve JSON başlıkları tek bir yerde tanımlandı. Sayfalarda uzun URL birleştirmeleri yerine sadece `/products` veya `/products/scrape` çağrılır.
2. **Merkezi Hata Yakalayıcı (`Response Interceptor`):**
   - Standart `fetch` kullanırken sunucu `404` veya `400` döndüğünde her fonksiyonda tek tek `if (!response.ok)` kontrolü yapmak gerekiyordu.
   - `apiClient.interceptors.response.use(...)` sayesinde C# API'den dönen `{ message: "Bu link veya kod için ürün bulunamadı." }` gibi hata mesajları tek merkezden yakalanıp otomatik olarak `Error` nesnesine çevrilir.
3. **Temiz Parametre Gönderimi (`params`):**
   - `new URLSearchParams` veya `encodeURIComponent` karmaşası yerine `params: { q: query, store, pageSize }` şeklinde doğrudan nesne gönderilir; Axios boş (`undefined`) parametreleri URL'den otomatik temizler.
4. **Çoklu Dil (`i18n`) Entegrasyonu:**
   - Ürün listeleme (`Products.tsx`) ve ürün detay (`ProductDetail.tsx`) sayfalarındaki tüm metinler Metronic formatında (`PAGE.PRODUCTS.*`, `PAGE.PRODUCT_DETAIL.*`) `tr.json` ve `en.json` dosyalarından `t('...')` ile çekilir.

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


## 5. Son Yapılan Geliştirmeler (Güncelleme Notları)

### 🛍️ 5.1 Bershka Gerçek Fotoğraf ve Fiyat Düzeltmesi
- **Sorun:** Bershka ürünlerinde yanlış fotoğraf ve fiyat görünüyordu. Bershka'nın güvenlik duvarı (Akamai) normal tarayıcı isteklerine gerçek ürün sayfası yerine bir doğrulama sayfası gösteriyordu. Biz de şablon görsel ve şablon fiyat kullanıyorduk.
- **Çözüm:** `BershkaStoreScraper.cs`, ürün sayfasını sosyal medya önizleme botu kimliğiyle çeker (`curl.exe -A "WhatsApp/2.23.20.0"`). Sayfadaki resmi Schema.org (`application/ld+json`) verisinden **gerçek fotoğrafı (`static.bershka.net`), gerçek TL fiyatını, adı ve rengi** okur.
- Varsayılan 7 katalog ürünü de gerçek fotoğraf ve fiyatlarla güncellendi.
- Çekilen ürünler bellekte önbelleğe alınır; aynı ürün tekrar istenince anında gelir.

### 📈 5.2 Ürün Sayısı Artırıldı
- **Neden 8 ürün vardı?** Frontend API'ye `pageSize=8` gönderiyordu ve API bu sayıyı mağazalara bölüyordu (Mavi 4, Bershka 4).
- `Products.tsx` içindeki `PAGE_SIZE` sabiti **24** yapıldı. İstenirse oradan değiştirilebilir.
- Bershka canlı ürün listesinden (sitemap) tamamlanan ürünler artık **paralel** çekilir, böylece sayfa yavaşlamaz.
- Sitemap eşleşmesinde URL'deki Türkçe karakter kodları (`%C4%B1` vb.) çözüldü; "tişört" gibi aramalar artık eşleşiyor.

### 🏠 5.3 Ana Sayfa Tasarımı (`Home.tsx` / `Home.scss`)
- Hero alanı, kategori kartları, API'den gelen **öne çıkan ürünler**, desteklenen mağazalar, "Nasıl Çalışır?" adımları ve alt çağrı bandı eklendi.
- Tüm yazılar `PAGE.HOME.*` anahtarlarıyla `tr.json` ve `en.json` içindedir.

### ⚖️ 5.4 Karşılaştırma Sayfası (`Compare.tsx` / `Compare.scss`)
- En fazla **3 ürün** yan yana karşılaştırılır (fiyat, mağaza, kategori, renk, kalıp, materyal, bedenler).
- En ucuz ürün yeşil renkle ve "En ucuz" rozetiyle işaretlenir.
- Ürünler kategori listesinden seçilir veya link/kod yapıştırılarak eklenir.
- Yazılar `PAGE.COMPARE.*` anahtarlarındadır.

### 🗄️ 5.5 Fiyat Geçmişi (SQLite + EF Core) ve Grafik
- **Veritabanı:** Başlangıç için **SQLite** seçildi; kurulum gerektirmez, veriler API klasöründeki `pricetracker.db` dosyasında tutulur. İleride PostgreSQL'e geçmek için `Program.cs` içinde `UseSqlite` yerine `UseNpgsql` yazmak yeterlidir (pgAdmin o zaman kullanılır). SQLite dosyasını görmek için *DB Browser for SQLite* kullanılabilir.
- **API tarafı:**
  - `Models/PriceRecord.cs` → fiyat kaydı tablosu
  - `Data/AppDbContext.cs` → veritabanı bağlantısı (uygulama açılırken tablo yoksa otomatik oluşur)
  - `Services/PriceHistoryService.cs` → ürün her çekildiğinde fiyatı kaydeder (fiyat değiştiyse veya son kayıt 6 saatten eskiyse)
  - `GET /api/products/{id}/price-history?days=30` → fiyat geçmişini döner
  - `POST /api/products/{id}/price-history/seed-demo` → **sadece geliştirme ortamında**, grafiği denemek için sahte 30 günlük geçmiş ekler
- **Frontend tarafı:** `components/PriceChart` (kütüphanesiz SVG çizgi grafiği) ürün detay sayfasında "Son 30 Gün Fiyat Geçmişi" olarak gösterilir. Veri azsa açıklayıcı mesaj çıkar.
- **Not:** Gerçek geçmiş, ürünler farklı günlerde çekildikçe birikir. İleride arka planda her gün fiyat çeken bir servis eklenebilir.

### 🧭 5.6 Menüde "Ürün Detay" Linki
- Menüdeki link koda sabit olarak `/product/1` yazılı olduğu için hep 404 veriyordu.
- Artık kullanıcının **en son açtığı ürünün** detayına gider ve `Ürün Detay: <ürün adı>` olarak görünür (`services/lastViewed.ts`, `localStorage`). Hiç ürün açılmadıysa link görünmez.

### 💤 5.7 Yorum Satırına Alınan Alanlar (İstenirse Tekrar Açılabilir)
`src/pages/Products/Products.tsx` içindeki **"link yapıştırarak ürün çekme"** bölümü kapatıldı. Hepsi `[LINKLE ÜRÜN ÇEKME KAPALI]` etiketiyle bulunabilir:
1. `scrapeProductByUrl` importu
2. `SAMPLE_STORE_URLS` (hazır örnek linkler)
3. `urlInput`, `scraping`, `scrapeMessage`, `highlightedId` state'leri (+ geçici `highlightedId = null` satırı)
4. `handleFetchSingleUrl` fonksiyonu
5. Link kutusu, "Ürünü Çek" butonu ve örnek link butonlarının JSX bölümü

Tekrar açmak için `/* */` ve `{/* */}` işaretlerini kaldırıp geçici `highlightedId` satırını silmek yeterlidir. Backend'deki `/api/products/scrape` uç noktası ve Karşılaştır sayfasındaki "Linkten Ekle" kutusu açık kalmıştır.

### ♥ 5.8 Favoriler (Takip Listesi) Sayfası
- **Kalp butonu** (`components/FavoriteButton`): Kıyafetler sayfasındaki ve ana sayfadaki ürün kartlarında (sağ üst köşe) ve ürün detay sayfasında (marka etiketinin yanı) bulunur. Tıklayınca ürünü favorilere ekler veya çıkarır.
- **Favoriler sayfası** (`/watchlist`, `pages/Watchlist`): Favori ürünler kart olarak listelenir (fotoğraf, mağaza, kategori, fiyat, "Detay" ve "Mağazada Gör" linkleri). Kalbe basınca ürün listeden çıkar. Liste boşsa kullanıcıyı ürünlere yönlendiren bir ekran gösterilir.
- **Menü:** Üst menüye `♥ Favoriler (adet)` linki eklendi; yanındaki sayı favori sayısını gösterir.
- **Saklama** (`services/favorites.ts`): İlk sürümde giriş sistemi olmadan **`localStorage`** kullanılır. Ürünün adı, fotoğrafı, fiyatı ve mağaza linki kaydedilir; bu yüzden sayfa API kapalıyken de açılır. Değişiklikler aynı tarayıcıdaki diğer sekmelerle senkron kalır.
- **Sınırlar:** Favoriler yalnızca o tarayıcıda durur (başka cihazda görünmez). Sayfadaki fiyat, ürünün **favoriye eklendiği andaki** fiyattır. İleride giriş sistemi + veritabanı ve güncel fiyatı/fiyat değişimini gösterme eklenebilir.
- Yazılar `NAV.WATCHLIST` ve `PAGE.WATCHLIST.*` anahtarlarıyla `tr.json` ve `en.json` içindedir.

### ⏳ 5.9 Yükleme İskeletleri (Skeleton), Hata/Boş Durum Kartları, Ayarlar Sayfası ve Karanlık Mod
- **Yükleme İskeletleri ve Durum Kartları (`components/Feedback/Feedback.tsx`):**
  - `ProductCardSkeletonGrid`: Ürünler yüklenirken (özellikle canlı veri çekimi sırasında) düz yazı yerine parıltılı (shimmer) ürün kartı iskeletleri gösterir.
  - `ProductDetailSkeleton`: Ürün detay sayfası yüklenirken sol galeri ve sağ bilgi alanının iskeletini gösterir.
  - `ErrorStateCard` & `EmptyStateCard`: API hatası durumunda **"Tekrar Dene"** butonu içeren hata kartı ve sonuç bulunamadığında boş durum kartı gösterir.
- **Ayarlar Sayfası (`/settings`, `pages/Settings/Settings.tsx`) ve Karanlık Mod (`services/theme.ts`):**
  - Sağ üst menüye **`⚙ Ayarlar`** butonu eklendi.
  - Ayarlar sayfasından **Açık Mod / Karanlık Mod** (`localStorage` üzerinde `app_theme`, `<html data-theme="dark">`) ve **Uygulama Dili (TR / EN)** seçilebilir.
  - İleride eklenecek ayarlar için hazır bir kart alanı bırakıldı.

### 🏬 5.10 Üçüncü Mağaza: LC Waikiki (`LcwStoreScraper.cs`) ve Bershka / Inditex Bot Koruması Notu
- **LC Waikiki Entegrasyonu (`Services/Scrapers/LcwStoreScraper.cs`):**
  - Ortak `IStoreScraper` mimarisini sınamak için üçüncü mağaza olarak **LC Waikiki (`lcw.com`)** eklendi.
  - **Kategori Araması (`SearchProductsAsync`):** LCW'nin `robots.txt` kurallarına uygun olarak izinli kategori sayfalarındaki (`/erkek-tisort-t-345`, `/erkek-jean-t-194`, `/erkek-sweatshirt-t-300`, `/erkek-gomlek-t-158`, `/erkek-ceket-t-130`) gömülü `CatalogList` JSON verisinden gerçek ürün adı, gerçek fotoğrafı (`img-lcwaikiki.mncdn.com`), rengi ve güncel TL fiyatı çekilir.
  - **Tekil Ürün Detayı (`GetProductByUrlOrCodeAsync`):** Ürün sayfasındaki resmi **Schema.org (`application/ld+json`)** verisinden tüm galeri fotoğrafları, stoktaki bedenler (`XS, S, M, L, XL...`), kalıp, kumaş ve fiyat bilgileri okunur. Ürün kimlikleri `lcw-{optionId}` (örn. `lcw-5263116`) formatındadır.
  - **Ortak Mimari Kanıtı:** `ProductScraperManager` ve `ProductsController` sınıflarına **hiç dokunulmadan**, yalnızca `LcwStoreScraper.cs` yazılıp `Program.cs`'e kaydedilerek 3 mağazalı yapı çalışır hale geldi.
- **⚠️ Bershka (ve Zara / H&M) Hakkında Önemli Teknik Not (Neden Sıkıntılı?):**
  - **Inditex grubu (Zara, Bershka, Pull&Bear)** ve **H&M**, sitelerini **Akamai Bot Manager** güvenlik duvarı ile korur. Normal bir C# `HttpClient` veya standart tarayıcı isteği gönderildiğinde gerçek ürün verisi yerine `403 Forbidden` veya `/interstitial/ic.html` (bot doğrulama sayfası) döner.
  - Bershka'da canlı veri çekebilmek için `WhatsApp/2.23.20.0` (sosyal medya link önizleme) başlığı kullanıldı; ancak bu yöntem **kırılgan (fragile)** bir çözümdür:
    1. Bershka/Akamai bu önizleme iznini kısıtlarsa veya sayfa yapısını değiştirirse canlı fotoğraf ve fiyat çekimi aniden durabilir (bu durumda kodumuzdaki 7 ürünlük sabit katalog devreye girer).
    2. Zara'da ise `robots.txt` dahil tüm otomatik istekler doğrudan `403` ile engellenmektedir.
  - Buna karşılık **Mavi** ve **LC Waikiki**, standart HTTP istekleriyle ve resmi Schema.org / JSON yapılarıyla çok daha kararlı ve hızlı çalışmaktadır.

### 👗 5.11 Dolabım (Gardırop / Wardrobe) Sayfası
- **Amaç:** Kullanıcının evdeki kendi kıyafetlerini tek bir yerde tutabilmesi, dolabındaki temel renk ve parçaları takip edebilmesi ve yeni aldığı ürünleri dolaba katabilmesi.
- **Hızlı ve Pratik Kıyafet Ekleme (`services/wardrobe.ts`, `pages/Wardrobe/Wardrobe.tsx`):**
  - Kullanıcı evdeki kıyafetinin tam marka/modelini bilemeyebileceği için pratik bir yapı kuruldu:
    1. **Tek Tıkla Hazır Şablonlar:** *"Siyah Tişört"*, *"Beyaz Tişört"*, *"Mavi Jean"*, *"Siyah Pantolon"*, *"Gri Sweatshirt"* gibi en sık kullanılan temel kıyafetler tek tıkla doğrudan dolaba eklenebilir.
    2. **Kategori ve Renk Paleti:** Kullanıcı kategori (Tişört, Pantolon, Jean, Gömlek, Sweatshirt, Ceket vb.) ve renk (Siyah, Beyaz, Gri, Lacivert, Mavi, Bej, Haki, Kahverengi vb.) seçip isteğe bağlı özel bir isim yazarak dolabına yeni parça ekleyebilir.
    3. **Sitedeki / Favorilerdeki Ürünlerden Ekleme:** Sitede beğendiği veya satın aldığı ürünleri `ProductDetail.tsx` üzerinden tek tıkla **"👗 Dolabımda Var"** diyerek veya Dolabım sayfasındaki *"Favorilerimden Ekle"* sekmesinden dolabına aktarabilir.
- **Dolap Görünümü ve İstatistikleri:**
  - Dolaptaki toplam kıyafet sayısı (`Total Items`), kategorilere göre dağılım (kaç tişört, kaç pantolon vb.) ve kategori filtreleme çipleri.
  - Her kıyafet için renk balonu / fotoğrafı, kategori etiketi, detay linki ve tek tıkla dolaptan çıkarma (silme) butonu.
- **Menü Entegrasyonu:** Üst menüye `👗 Dolabım (sayı)` linki eklendi; parça sayısı anlık olarak güncellenir.
- **Veri Saklama:** Kullanıcı girişi gerekmeden tarayıcıda **`localStorage`** üzerinde tutulur.

### ⏱️ 5.12 Arka Planda Otomatik Fiyat Güncelleyici (`PriceTrackerBackgroundService.cs`)
- **Neden Yapıldı?** Daha önce fiyat geçmişi yalnızca kullanıcı sitede bir ürünün sayfasına girdiğinde tetikleniyordu. Kullanıcı siteyi günlerce açmazsa fiyat grafiğinde boşluklar oluşuyordu.
- **Nasıl Çalışır?**
  - .NET'in yerleşik **`BackgroundService` / `IHostedService`** altyapısı kullanıldı.
  - Uygulama arka planda sessizce çalışırken (örneğin her 6 saatte bir periyotla) `AppDbContext` üzerindeki takip edilen ürün kimliklerini listeler.
  - Mağazalardan (Mavi, Bershka, LCW) güncel fiyatları sorgular ve fiyatta bir değişiklik varsa veya son kaydın üzerinden zaman geçmişse `PriceRecords` tablosuna otomatik olarak yeni bir nokta ekler.
  - Mağaza sunucularına gereksiz yük bindirmemek için ürün sorguları arasına 1.5 saniye bekleme (`Task.Delay`) konulmuştur.
  - Sonuç: Kullanıcı siteye hiç girmese dahi fiyat grafiği her gün otomatik olarak beslenir ve zenginleşir.

### 🎨 5.13 Kombin Yapıcı (Outfit Builder) ve Renk Uyumu Algoritması (LLM Gerekir mi?)
- **LLM (Büyük Dil Modeli) Kurmak Gerekir mi?**
  - **Hayır!** Moda stilistleri ve e-ticaret devleri (Zara, Pinterest vb.) renk uyumlarını belirlemek için ağır LLM'ler yerine binlerce yıllık **Renk Teorisi (Color Harmony & Color Wheel)** kurallarını algoritmik olarak kullanır.
  - LLM kullanmanın dezavantajları (yüksek maliyet, API anahtarı zorunluluğu, internet gecikmesi / 2-3 saniye bekleme, halüsinasyon riski) yerine; yazdığımız renk teorisi algoritması **0 milisaniyede (anlık)**, **çevrimdışı/offline**, **tutarlı** ve **tamamen ücretsiz** çalışır.
- **Renk Uyumu Algoritması Nasıl Çalışıyor? (`services/outfitMatcher.ts`):**
  1. **Nötr Renkler (Jokerler):** Siyah, Beyaz, Gri, Bej, Ekru. Bu renkler gardırobun temelidir ve neredeyse tüm renklerle %95-100 uyum sağlar.
  2. **Tamamlayıcı (Kontrast) Eşleşmeler:**
     - Mavi/Lacivert ↔ Bej, Beyaz, Haki, Kahverengi
     - Haki/Yeşil ↔ Siyah, Beyaz, Bej, Lacivert
     - Kırmızı/Bordo ↔ Siyah, Gri, Beyaz, Lacivert
  3. **Kıyafet Rolleri (Top / Bottom / Outer):**
     - Tişört, Gömlek, Sweatshirt → Üst Giyim (Top)
     - Jean, Pantolon → Alt Giyim (Bottom)
     - Ceket, Mont → Dış Giyim (Outer)
- **Nerede Kullanılıyor?**
  1. **Dolabım Sayfasında (`/wardrobe` - Kombin Oluşturucu):**
     - Kullanıcı 1 üst + 1 alt + 1 ceket seçerek interaktif kombin tahtasında görsel olarak bir araya getirebilir.
     - **"🪄 Uyumlu Kombin Öner" Butonu:** Dolaptaki tüm kıyafetleri renk uyum matrisinden geçirir ve en yüksek uyum puanına sahip (örn. `%94 Renk Uyumu`) kombini tek tıkla tahtaya dizer!
     - Oluşturulan kombinler isim verilerek kaydedilebilir (`services/outfitStorage.ts`).
  2. **Ürün Detay Sayfasında (`ProductDetail.tsx`):**
     - Kullanıcı sitede bir ürüne bakarken sayfanın altına **"👗 Dolabından Bu Ürüne Yakışacak Parçalar"** kutusu gelir.
     - Örneğin mavi bir tişörte bakıyorsa; algoritma kullanıcının dolabını tarayıp *"Dolabındaki Bej Pantolon ile kontrast uyumu mükemmel (%92 Uyum)"* diyerek parçaları anında listeler.

  3. **Dinamik Alternatif Kombin Üretimi (`generateNextOutfit`):**
     - İlk versiyonda algoritma sadece en yüksek matematiksel puana sahip *tek bir* kombinasyonu buluyordu. Bu yüzden kullanıcı butona 2. kez bastığında aynı parçalar seçildiği için ekranda hiçbir şey değişmiyordu.
     - Yapılan güncellemeyle; dolaptaki tüm olası kombinasyonlar (`getAllPossibleOutfits`) taranır. Kullanıcı butona her bastığında buton **"🔄 Başka Kombin Öner"** haline gelir ve o an tahtada gösterilen parçalardan farklı, yüksek skorlu alternatif bir kombinasyonu rastgele/sırayla getirir.
     - Dolapta sadece tek bir kombinasyon varsa (ör. sadece 1 tişört ve 1 pantolon) kullanıcıya *"Dolabındaki kıyafetlerle oluşturulabilecek tek kombinasyon bu. Daha fazla alternatif için yeni kıyafetler ekleyebilirsin"* bilgilendirme rozeti gösterilir.

### 5.14. Veritabanı Gerektirmeyen Arama Kutusu, Sıralama ve Detaylı Filtreleme (`Products.tsx`)
- **Neden Ekstra Veritabanına İhtiyaç Yok?**
  - Uygulamamızda ürünler zaten canlı olarak mağaza scraper'larından (`Mavi`, `Bershka`, `LC Waikiki`) çekilip JSON dizisi (`ClothingItem[]`) olarak ön yüze geliyor.
  - Bu nedenle **ekstra bir ürün veritabanı kurmadan** iki katmanlı bir mimari uygulandı:
    1. **Anlık Bellek İçi (In-Memory `useMemo`) Filtreleme & Sıralama:**
       - **Serbest Metin Arama:** Arama kutusuna yazılan her harf; ekrandaki ürünlerin adını, rengini, kalıbını (`fit`), markasını ve ürün kodunu milisaniyeler içinde tarayarak anında filtreler.
       - **Canlı Mağaza Araması ("Mağazalarda Ara" Butonu / Enter):** Kullanıcı arama kutusuna örneğin `"keten gömlek"` veya `"kargo pantolon"` yazıp Enter'a basarsa, bu kelime doğrudan API'ye (`/api/products?q=...`) gönderilir ve Mavi, Bershka ile LC Waikiki'de canlı arama yapılır.
       - **Sıralama:** *Varsayılan*, *Fiyat: Düşükten Yükseğe*, *Fiyat: Yüksekten Düşüğe* ve *İndirim Oranı: En Yüksek* seçenekleri.
       - **Fiyat Aralığı & İndirim Filtresi:** Min ₺ / Maks ₺ kutuları ve *"Sadece İndirimdekiler"* onay kutusu.
       - **Dinamik Renk ve Beden Filtreleri:** O an yüklenen ürünlerin içindeki mevcut renkler (`availableColors`) ve bedenler (`availableSizes`) otomatik olarak hesaplanıp açılır listelere doldurulur.
    2. **İleride Veritabanına Geçiş Kolaylığı:**
       - İleride binlerce ürünlük bir SQL katalog tablosu eklenmek istenirse, `Products.tsx` içindeki aynı state'ler (`sortBy`, `minPrice`, `maxPrice`, `selectedColor`, `selectedSize`) hiçbir arayüz değişikliği yapmadan API'ye query parametresi olarak gönderilebilir.

### 5.15. Çift Modlu Yapay Zeka (Qwen/Qwen3-Embedding-0.6B + Yerel C# Vektör Motoru) Ürün & Kombin Öneri Sistemi
- **İlgili Dosyalar:**
  - Backend: `ClothingPriceTracker.Api/Services/EmbeddingRecommendationService.cs`, `Controllers/ProductsController.cs` (`GET /api/products/{id}/recommendations`), `appsettings.json`
  - Frontend: `src/pages/ProductDetail/ProductDetail.tsx`, `src/pages/ProductDetail/ProductDetail.scss`, `src/services/api.ts`
- **Mimari Nasıl Çalışır? (Çift Modlu / Dual-Mode Yapı):**
  1. **Mod A — Bulut Hugging Face API veya Lokal Ollama (`Qwen/Qwen3-Embedding-0.6B`):**
     - `appsettings.json` içerisindeki `Embedding:HuggingFaceApiKey` alanına ücretsiz bir Hugging Face Token (`hf_...`) girildiğinde (veya `UseOllama: true` yapıldığında), `.NET API` ürünlerin metin temsillerini **Instruction-Aware (Talimat Destekli)** formatta doğrudan `Qwen/Qwen3-Embedding-0.6B` modeline gönderir ve L2-normalize edilmiş yoğun vektörleri (embeddings) alır.
  2. **Mod B — Sıfır Kurulumlu 128 Boyutlu Yerel C# Moda & Stil Vektör Motoru (Otomatik Fallback):**
     - Herhangi bir API anahtarı girilmediğinde, internet olmadığında veya API kotası dolduğunda sistem kesintisiz çalışmaya devam eder:
       - Boyut `0..15`: Kategori ve giyim rolü uzayı (Tişört, Gömlek, Sweatshirt, Jean/Pantolon, Ceket)
       - Boyut `16..35`: Kalıp & Stil silüeti uzayı (*Sokak Stili: Oversize / Boxy / Baggy / Wide Leg / Loose* ↔ *Klasik: Regular / Straight / 90lar* ↔ *Dar: Slim / Skinny*)
       - Boyut `36..59`: Renk & Kontrast ton uzayı
       - Boyut `60..79`: Kumaş & Materyal dokusu (Denim, Pamuk, Keten, Polar/Şardonlu, Triko)
       - Boyut `80..127`: Karakter 3-Gram ve Kelime Locality-Sensitive Hashing (LSH) alt-kelime projeksiyonu
  3. **Kosinüs Benzerliği ($\cos(\theta) = \frac{A \cdot B}{\|A\|\|B\|}$) ile İki Ayrı Öneri Listesi:**
     - **Diğer Mağazalardaki En Benzer Alternatifler (`similarProducts`):** İncelenen ürüne kalıp, kumaş ve renk olarak en yakın diğer mağaza ürünlerini (Mavi ↔ Bershka ↔ LC Waikiki) bulur ve **fiyat farkını** (*"↓ 250 ₺ Daha Ucuz"*) doğrudan kart üzerinde gösterir.
     - **Yapay Zeka Stil & Kombin Önerileri (`complementaryProducts`):** `Qwen3-Embedding` modelinin *Instruction-Aware* yeteneğini kullanarak; örneğin *Oversize/Boxy* bir üst giyim inceleniyorsa ona stil olarak en çok yakışacak *Baggy/Wide Leg* alt giyimleri ve uyumlu renkleri vektör uzayında eşleştirip önerir.

### 5.16. Dolabım → "Kombin Oluşturucu" (Outfit Builder) İçine Qwen3 Vektör Motorunun Entegrasyonu (`Wardrobe.tsx` & `outfitMatcher.ts`)
- **İlgili Dosyalar:**
  - Frontend: `src/pages/Wardrobe/Wardrobe.tsx`, `src/pages/Wardrobe/Wardrobe.scss`, `src/services/outfitMatcher.ts`, `src/services/api.ts`
  - Backend: `Controllers/ProductsController.cs` (`POST /api/products/wardrobe-recommendations`), `Services/EmbeddingRecommendationService.cs` (`GetRecommendationsForWardrobeAsync`)
- **Eklenen 3 Yeni Yetenek:**
  1. **128D Vektör + Renk Teorisi ile Canlı Kombin Analizi (`evaluateOutfitVectorHarmony`):**
     - Dolabım sayfasındaki kombin oluşturucuda kullanıcı Üst, Alt veya Dış Giyim seçtiğinde (ya da **"🪄 Uyumlu Kombin Öner"** butonuna bastığında), seçilen parçalar `computeFashionStyleVector` ile 128 boyutlu birim vektörlere dönüştürülür.
     - İki parça arasındaki **Kosinüs Benzerliği (`cosineSimilarity`)** ve **Renk Teorisi (`calculateColorMatch`)** birleştirilerek `%70 - %98` arasında bir uyum skoru ve detaylı vektör analizi (*"Qwen3 128D Vektör Analizi: Sokak Stili (Oversize / Baggy) kesim uyumu ve Siyah × Mavi renk kontrastı Kosinüs Benzerliği ile eşleşti"*) gösterilir.
  2. **🎯 Seçili Parçaya Göre Dolaptan Tamamlama (`completeOutfitFromSelection`):**
     - Kullanıcı 3 slottan sadece 1 veya 2 tanesini seçip (ör. sadece *Siyah Tişört* seçip) **"🎯 Seçili Parçaya Göre Dolaptan Tamamla"** butonuna bastığında, seçilen parça sabit tutulur ve boş kalan slotlar dolaptaki en yüksek vektör uyumlu kıyafetlerle otomatik doldurulur.
  3. **🛍️ Seçili Kıyafetlere Göre Mağazalardan Kombin Parçası Önerme (`POST /api/products/wardrobe-recommendations`):**
     - Kombin tahtasının altındaki **"🧠 Qwen3-Embedding — Seçili Kıyafetlerine Uygun Mağaza Kombin Önerisi"** bölümünde kullanıcı *Otomatik (Eksik Parçayı Bul)*, *Tişört*, *Jean/Pantolon*, *Gömlek*, *Sweatshirt* veya *Ceket* seçip **"🛍️ Mağazalardan Kombin Parçası Öner"** butonuna basabilir.
     - Sistem Mavi, Bershka ve LC Waikiki'deki ürünleri seçili dolap kıyafetleriyle vektör uzayında karşılaştırıp en yüksek uyum puanlı 4 mağaza ürününü getirir.
     - Kullanıcı beğendiği mağaza ürününün altındaki **"＋ Kombine & Dolaba Ekle"** butonuna bastığında ürün tek tıkla hem dolaba kaydedilir hem de kombin tahtasındaki ilgili slota (Üst/Alt/Dış Giyim) yerleştirilir.

### 5.17. Kod Değiştirmeden Başka Bir Yapay Zeka / Hugging Face Modeline Geçiş Rehberi (`appsettings.json`)
- **Neden Kod Değiştirmeye Gerek Yok?**
  - `EmbeddingRecommendationService.cs` içerisindeki vektör normalizasyonu (`NormalizeL2`) ve Kosinüs Benzerliği (`CosineSimilarity`) fonksiyonları sabit bir vektör boyutuna bağımlı değildir; model `384`, `768` veya `1024` boyutlu vektör döndürse de dinamik olarak (`vec.Length`) çalışır.
  - Ayrıca Frontend (`ProductDetail.tsx`) model adını API yanıtındaki `engineName` ve `vectorDimensions` alanlarından dinamik olarak okur.
- **Yeni Bir Modele Geçmek İçin Yapılması Gereken Tek İşlem:**
  - `ClothingPriceTracker.Api/appsettings.json` dosyasındaki `"Embedding"` bloğunda sadece `"Model"` satırını değiştirmek yeterlidir:
    ```json
    "Embedding": {
      "Model": "Qwen/Qwen3-Embedding-0.6B",
      "HuggingFaceApiKey": "hf_SENIN_TOKENIN",
      "OllamaEndpoint": "http://localhost:11434/api/embed",
      "UseOllama": false
    }
    ```
  - **Denenebilecek Alternatif Hugging Face Modelleri:**
    - `"Qwen/Qwen3-Embedding-0.6B"` *(Varsayılan — Instruction-Aware destekli)*
    - `"google/embeddinggemma-2"` *(Google'ın hafif ve hızlı Matryoshka embedding modeli)*
    - `"BAAI/bge-m3"` *(Çok dilli / Türkçe başarımı çok yüksek popüler model)*
    - `"intfloat/multilingual-e5-large"`
    - `"sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"`

### 5.18. Üst Menüdeki (`Navbar.tsx`) "Ürün Detay" Sekmesinin Sadece Aktif Sayfada Gösterilmesi
- **Sorun:** Önceden kullanıcı herhangi bir ürünün detay sayfasına girdiğinde üst menüde (`Navbar`) `Ürün Detay: <Uzun Ürün Adı>` şeklinde bir sekme açılıyor ve kullanıcı başka sayfalara (Ana Sayfa, Kıyafetler, Dolabım) geçse bile üst menüde kalmaya devam ederek kalabalık bir görüntü oluşturuyordu.
- **Çözüm (`src/components/Navbar/Navbar.tsx`):**
  - `useLocation()` üzerinden `const isOnProductDetail = location.pathname.startsWith('/product/');` kontrolü eklendi.
  - Artık **Ürün Detay** sekmesi yalnızca kullanıcı aktif olarak bir ürün detay sayfasındayken kısa ve temiz bir başlık olarak görünür; sayfadan çıkıldığı anda üst menüden otomatik olarak kalkar.

### 5.19. Üst Menüde Birleşik "🛍️ Kıyafetler ▾" (Mağaza Seçimli) Açılır Menüsü ve Seçilen Mağazanın Bütün Ürünlerini Listeleme
- **İlgili Dosyalar:**
  - Frontend: `src/components/Navbar/Navbar.tsx`, `src/components/Navbar/Navbar.scss`, `src/pages/Products/Products.tsx`, `src/services/api.ts`, `src/pages/Home/Home.tsx`
  - Backend: `ClothingPriceTracker.Api/Services/ProductScraperManager.cs`, `Services/Scrapers/BershkaStoreScraper.cs`
- **Nasıl Çalışır?**
  1. **Navbar Birleşik "🛍️ Kıyafetler ▾" Açılır Menüsü (Dropdown):**
     - Üst menüde "Kıyafetler" ve "Mağazalar" ayrı ayrı durup kalabalık yapmasın diye tek bir **`🛍️ Kıyafetler ▾`** açılır sekmesinde birleştirildi.
     - Üzerine gelindiğinde veya tıklandığında aşağı doğru açılan menüde **Tüm Mağazalar**, **Mavi**, **Bershka** ve **LC Waikiki** seçenekleri yer alır.
     - Bir mağazaya tıklandığında `/products?store=<MağazaAdı>&cat=all` adresine yönlendirir ve aktif mağaza adı üst menüde `🛍️ Kıyafetler (Mavi) ▾` şeklinde vurgulanır.
  2. **Sadece 8 veya 24 Ürün Değil, Mağazanın Tüm Kategorilerdeki Bütün Ürünlerini Çekme (`cat=all`):**
     - Eskiden sayfa açıldığında sadece tek bir kategori (`tisort`) ve `PAGE_SIZE = 24` sınırı ile ürün çekiliyordu.
     - Artık `query = "all"` (**Tüm Kategoriler**) seçildiğinde; hem `src/services/api.ts` hem de `ProductScraperManager.cs` seçili mağazanın tüm ana kategorilerini (`tisort`, `jean`, `sweatshirt`, `gomlek`, `ceket`) kategori başına `50–60` ürün limiti ile **paralel (`Promise.all` / `Task.WhenAll`)** olarak sorgular, benzersiz (`id`) ürünleri birleştirir ve mağazanın **bütün ürünlerini (Mavi ve LC Waikiki için 150–250+ canlı ürün, Bershka için tüm katalog + canlı ürünler)** belleğe alır.
  3. **Sayfa Başına 30 Ürün Gösteren Sayfalama (Pagination — `ITEMS_PER_PAGE = 30`):**
     - Yüzlerce ürünün tek sayfada aşağı doğru uzayıp sayfayı ağırlaştırmaması için `Products.tsx` içerisine `ITEMS_PER_PAGE = 30` olacak şekilde sayfalama (`Pagination`) eklendi.
     - Filtre özetinde `1–30 / 215 ürün gösteriliyor (Sayfa 1 / 8)` bilgisi yer alır; sayfa altında ise **← Önceki**, sayfa numaraları (`1, 2, 3...`) ve **Sonraki →** butonları bulunur. Sayfa değiştirildiğinde ekran yumuşak bir şekilde (`smooth scroll`) yukarı kayar.

### 5.20. Tüm Uygulama İkonlarının `react-icons` (`react-icons/fi` & `react-icons/fa`) Kütüphanesine Taşınması
- **Kurulum:** `npm install react-icons` ile projeye dahil edildi (`package.json`).
- **Güncellenen Bileşen ve Sayfalar:**
  - `src/components/Navbar/Navbar.tsx`: Ana Sayfa (`FiHome`), Kıyafetler/Mağazalar (`FiShoppingBag`, `FiChevronDown`), Karşılaştır (`FiLayers`), Favoriler (`FiHeart`), Dolabım (`FaTshirt`), Ürün Detay (`FiTag`), Ayarlar (`FiSettings`).
  - `src/components/FavoriteButton/FavoriteButton.tsx`: Dolu ve boş kalp ikonları (`FaHeart`, `FaRegHeart`).
  - `src/components/Feedback/Feedback.tsx`: Hata (`FiAlertTriangle`), Tekrar Dene (`FiRefreshCw`) ve Boş Liste (`FiShoppingBag`) SVG ikonları.
  - `src/pages/Home/Home.tsx`, `src/pages/Products/Products.tsx`, `src/pages/Compare/Compare.tsx`: Kategori kartı ikonları (`FaTshirt`, `FiLayers`, `FiShoppingBag`, `FaUserTie`, `FiShield`), arama/temizleme/sıfırlama/sayfalama ikonları (`FiSearch`, `FiX`, `FiRotateCcw`, `FiArrowLeft`, `FiArrowRight`, `FiPlus`).
  - `src/pages/ProductDetail/ProductDetail.tsx`, `src/pages/Watchlist/Watchlist.tsx`, `src/pages/Wardrobe/Wardrobe.tsx`, `src/pages/Settings/Settings.tsx`: Yapay zeka öneri başlıkları (`FiCpu`, `FaMagic`), fiyat düşüş oku (`FiArrowDown`), kombin hedefleme/kaydetme (`FiTarget`, `FiSave`, `FiFolder`) ve tema/dil seçici ikonları (`FiSun`, `FiMoon`, `FiGlobe`).

### 5.21. Kombin Oluşturucunun Ayrı Bir "Kombin Stüdyosu" (`/outfits`) Sayfasına Taşınması ve Dolabım Sayfasının Profesyonel Tasarıma Kavuşturulması
- **İlgili Dosyalar:**
  - `src/pages/OutfitStudio/OutfitStudio.tsx` & `src/pages/OutfitStudio/OutfitStudio.scss` *(Yeni Bağımsız Sayfa)*
  - `src/pages/Wardrobe/Wardrobe.tsx` & `src/pages/Wardrobe/Wardrobe.scss` *(Baştan Sona Yenilenen Profesyonel Gardırop Paneli)*
  - `src/components/Navbar/Navbar.tsx` & `src/routes/AppRoutes.tsx`
- **Yapılan Mimari ve Tasarım İyileştirmeleri:**
  1. **Üst Menüde (`Navbar`) Bağımsız "✨ Kombin Stüdyosu" (`/outfits`) Sayfası:**
     - Dolabım sayfasının içinde sıkışık duran Kombin Oluşturucu, üst menüye (`Navbar`) **Kombin Stüdyosu** sekmesi olarak taşındı.
     - Tam ekran **Lookbook Canvas** (Üst Giyim, Alt Giyim, Dış Giyim slotları + her slotun altında dolaptan tek tıkla hızlı seçim çipleri), canlı **Qwen3 128D Vektör & Renk Uyumu İlerleme Çubuğu (Progress Meter)**, **Mağazalardan Kombin Tamamlayıcı** ve **Kaydedilen Kombinleri Tahtaya Geri Yükleme** özellikleriyle bağımsız bir stüdyo haline getirildi.
  2. **Dolabım (`/wardrobe`) Sayfasının Profesyonel SaaS Görünümüne Yenilenmesi:**
     - **Gardırop Analitik & KPI Özeti:** Sayfanın üst kısmında tıklanabilir 4 KPI kartı (**Toplam Parça**, **Üst Giyim**, **Alt Giyim**, **Dış Giyim**) ve kullanıcının dolabındaki renklerin dağılımını gösteren **Gardırop Renk Paleti** şeridi yer alır.
     - **Canlı Kart Önizlemeli (Live Preview) Kıyafet Tasarım Stüdyosu:** Kullanıcı yeni kıyafet eklerken sol tarafta seçtiği renk, kategori ikonu, kalıp (`Regular Fit`, `Oversize`, `Baggy Fit`, `Boxy Fit`, `Slim Fit`) ve isimle **Canlı Kıyafet Kartı Önizlemesi** anlık olarak güncellenir.
     - **Hazır Kapsül Gardırop & Favorilerden Aktarım:** Tek tıkla eklenebilen 8 temel kapsül parça kartı ve favorilerden aktarım sekmesi modern grid yapısına kavuşturuldu.
     - **Kıyafet Kartlarından Tek Tıkla Stüdyoya Geçiş:** Dolaptaki her kıyafet kartının altına **"✨ Kombinde Kullan"** butonu eklendi; tıklandığında `/outfits?piece=<id>` parametresiyle Kombin Stüdyosu'nu açar ve o kıyafeti doğrudan ilgili slota yerleştirir.
