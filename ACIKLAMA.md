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

## 4. Gelecek Aşamalar İçin Mimari Öneriler (Backend, Veritabanı ve Araçlar)

İskeletimiz hazır. Bundan sonraki aşamalarda işimizi en çok kolaylaştıracak ve projeyi profesyonel seviyeye taşıyacak önerilerimiz şunlardır:

### 🗄️ 1. Veritabanı: **PostgreSQL + pgAdmin 4**
- **Neden PostgreSQL?**
  - Kıyafetler, markalar, kategoriler, mağazalar (Zara, Bershka, Trendyol, H&M vb.) ve fiyat geçmişi birbiriyle ilişkili tablolardır; PostgreSQL bu ilişkisel yapıyı çok hızlı yönetir.
  - Kıyafetlerin özellikleri kategoriye göre değişir (ayakkabıda numara `42`, tişörtte beden `S/M/L`, kumaş `%100 Pamuk`). PostgreSQL'in **`JSONB`** özelliği sayesinde her kategori için ayrı tablo açmak yerine bu esnek özellikleri tek bir sütunda tutabiliriz.
- **Neden pgAdmin 4?**
  - Veritabanındaki tabloları görsel olarak görmek, veri eklemek ve SQL sorgularını kolayca test etmek için **pgAdmin 4** kullanacağız.

### ⚙️ 2. Backend (API): **C# (.NET 8 Web API)** *(veya Java Spring Boot)*
- **Önerimiz C# (.NET Web API + Entity Framework Core):**
  - Kurulumu çok hızlıdır ve **Swagger** (API test ekranı) hazır kurulu gelir.
  - **Entity Framework Core (EF Core)** sayesinde C# ile yazdığımız sınıflardan PostgreSQL tablolarını otomatik olarak oluşturabiliriz (Migration).
  - **Swagger** sayesinde Backend'i yazan arkadaşımız bir uç (endpoint) yazdığında, Frontend yazan arkadaşımız tarayıcıdan o adresi görüp anında test edebilir.
  - *(Alternatif: Eğer ekip üyeleri okul derslerinden dolayı Java'ya daha hakimse **Java Spring Boot** da kullanılabilir.)*

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
