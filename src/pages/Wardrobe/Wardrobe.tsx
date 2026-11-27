import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiHeart,
  FiLayers,
  FiPlus,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiSliders,
  FiTag,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { FaMagic, FaTshirt, FaUserTie } from 'react-icons/fa';
import { useI18n } from '../../i18n/I18nProvider';
import { useWardrobe } from '../../services/wardrobe';
import { useFavorites } from '../../services/favorites';
import { useOutfits } from '../../services/outfitStorage';
import { getClothingRole } from '../../services/outfitMatcher';
import './Wardrobe.scss';

const DEFAULT_CATEGORIES: Array<{
  key: string;
  label: string;
  roleLabel: string;
  icon: ReactNode;
}> = [
  { key: 'tisort', label: 'Tişört', roleLabel: 'Üst Giyim', icon: <FaTshirt /> },
  { key: 'gomlek', label: 'Gömlek', roleLabel: 'Üst Giyim', icon: <FaUserTie /> },
  {
    key: 'sweatshirt',
    label: 'Sweatshirt',
    roleLabel: 'Üst Giyim',
    icon: <FiShoppingBag />,
  },
  { key: 'jean', label: 'Jean', roleLabel: 'Alt Giyim', icon: <FiLayers /> },
  { key: 'pantolon', label: 'Pantolon', roleLabel: 'Alt Giyim', icon: <FiLayers /> },
  { key: 'ceket', label: 'Ceket', roleLabel: 'Dış Giyim', icon: <FiShield /> },
  { key: 'diger', label: 'Diğer', roleLabel: 'Aksesuar / Diğer', icon: <FiTag /> },
];

const FIT_OPTIONS = [
  'Regular Fit',
  'Oversize',
  'Baggy Fit',
  'Boxy Fit',
  'Slim Fit',
];

const DEFAULT_COLORS = [
  { name: 'Siyah', hex: '#111827' },
  { name: 'Beyaz', hex: '#f9fafb', border: true },
  { name: 'Ekru', hex: '#f3efe6', border: true },
  { name: 'Gri', hex: '#6b7280' },
  { name: 'Lacivert', hex: '#1e3a8a' },
  { name: 'Mavi', hex: '#3b82f6' },
  { name: 'Bej', hex: '#e2d5c3' },
  { name: 'Haki', hex: '#556b2f' },
  { name: 'Kahverengi', hex: '#78350f' },
  { name: 'Kırmızı', hex: '#dc2626' },
  { name: 'Yeşil', hex: '#16a34a' },
];

const CAPSULE_PRESETS = [
  {
    name: 'Siyah Oversize Tişört',
    category: 'Tişört',
    color: 'Siyah',
    hex: '#111827',
    tag: 'Sokak Stili Temel',
  },
  {
    name: 'Beyaz Basic Tişört',
    category: 'Tişört',
    color: 'Beyaz',
    hex: '#f9fafb',
    tag: 'Kapsül Klasik',
  },
  {
    name: 'Açık Mavi Baggy Jean',
    category: 'Jean',
    color: 'Mavi',
    hex: '#3b82f6',
    tag: 'Denim Favori',
  },
  {
    name: 'Siyah Rahat Pantolon',
    category: 'Pantolon',
    color: 'Siyah',
    hex: '#111827',
    tag: 'Her Kombine Uyumlu',
  },
  {
    name: 'Gri Kapüşonlu Sweatshirt',
    category: 'Sweatshirt',
    color: 'Gri',
    hex: '#6b7280',
    tag: 'Günlük Rahat',
  },
  {
    name: 'Beyaz Oxford Gömlek',
    category: 'Gömlek',
    color: 'Beyaz',
    hex: '#f9fafb',
    tag: 'Smart Casual',
  },
  {
    name: 'Bej Keten Gömlek',
    category: 'Gömlek',
    color: 'Bej',
    hex: '#e2d5c3',
    tag: 'Yazlık Stil',
  },
  {
    name: 'Haki Bomber Ceket',
    category: 'Ceket',
    color: 'Haki',
    hex: '#556b2f',
    tag: 'Dış Katman',
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Tişört':
      return <FaTshirt />;
    case 'Gömlek':
      return <FaUserTie />;
    case 'Sweatshirt':
      return <FiShoppingBag />;
    case 'Jean':
    case 'Pantolon':
      return <FiLayers />;
    case 'Ceket':
      return <FiShield />;
    default:
      return <FiTag />;
  }
};

const Wardrobe = () => {
  const { t } = useI18n();
  const { items, addManualItem, removeItem, addStoreItem, isProductInWardrobe } =
    useWardrobe();
  const { favorites } = useFavorites();
  const { outfits } = useOutfits();

  // Kıyafet Ekleme Stüdyosu aç/kapat ve sekme state'leri
  const [builderOpen, setBuilderOpen] = useState<boolean>(items.length < 4);
  const [builderMode, setBuilderMode] = useState<
    'custom' | 'presets' | 'favorites'
  >('custom');

  // Özel Kıyafet Tasarım Formu state'leri
  const [selectedCategory, setSelectedCategory] = useState<string>('Tişört');
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
    border?: boolean;
  }>(DEFAULT_COLORS[0]);
  const [selectedFit, setSelectedFit] = useState<string>('Regular Fit');
  const [customName, setCustomName] = useState<string>('');
  const [justAddedToast, setJustAddedToast] = useState<string | null>(null);

  // Gardırop Vitrini Filtreleme & Arama state'leri
  const [filterRole, setFilterRole] = useState<
    'all' | 'top' | 'bottom' | 'outer'
  >('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [wardrobeSearch, setWardrobeSearch] = useState<string>('');

  const showToast = (label: string) => {
    setJustAddedToast(label);
    setTimeout(() => {
      setJustAddedToast((prev) => (prev === label ? null : prev));
    }, 2600);
  };

  // Canlı Önizleme Kartında görünecek otomatik veya özel isim
  const previewTitle =
    customName.trim() ||
    `${selectedColor.name} ${selectedFit !== 'Regular Fit' ? selectedFit + ' ' : ''}${selectedCategory}`;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addManualItem(
      previewTitle,
      selectedCategory,
      selectedColor.name,
      selectedColor.hex
    );
    showToast(`${previewTitle} dolabına eklendi`);
    setCustomName('');
  };

  const handleQuickPresetAdd = (tpl: (typeof CAPSULE_PRESETS)[0]) => {
    addManualItem(tpl.name, tpl.category, tpl.color, tpl.hex);
    showToast(`${tpl.name} dolabına eklendi`);
  };

  // İstatistikler
  const topsCount = items.filter((x) => getClothingRole(x.category) === 'top').length;
  const bottomsCount = items.filter(
    (x) => getClothingRole(x.category) === 'bottom'
  ).length;
  const outersCount = items.filter(
    (x) => getClothingRole(x.category) === 'outer'
  ).length;

  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  // Dolaptaki renk dağılımı
  const colorDistribution = useMemo(() => {
    const map = new Map<string, { color: string; hex: string; count: number }>();
    items.forEach((item) => {
      const key = item.color || 'Standart';
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          color: key,
          hex: item.colorHex || '#111827',
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [items]);

  // Filtrelenmiş gardırop listesi
  const filteredItems = useMemo(() => {
    const q = wardrobeSearch.trim().toLocaleLowerCase('tr-TR');
    return items.filter((item) => {
      if (filterRole !== 'all' && getClothingRole(item.category) !== filterRole) {
        return false;
      }
      if (
        filterCategory !== 'all' &&
        item.category.toLowerCase() !== filterCategory.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = `${item.name} ${item.category} ${item.color} ${item.brand || ''}`.toLocaleLowerCase(
          'tr-TR'
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filterRole, filterCategory, wardrobeSearch]);

  const isLightHex = (hex?: string) =>
    ['#f9fafb', '#f3efe6', '#e2d5c3', '#ffffff'].includes(hex || '');

  return (
    <div className="wardrobe-page">
      {/* Üst Profesyonel Başlık ve Aksiyon Barı */}
      <header className="wardrobe-hero">
        <div className="wardrobe-hero__info">
          <span className="hero-eyebrow">
            <FaTshirt /> Kişisel Dijital Gardırop Yönetimi
          </span>
          <h1>{t('PAGE.WARDROBE.HEADING')}</h1>
          <p>{t('PAGE.WARDROBE.SUBTITLE')}</p>
        </div>

        <div className="wardrobe-hero__actions">
          <button
            type="button"
            className={`btn-toggle-studio ${builderOpen ? 'is-open' : ''}`}
            onClick={() => setBuilderOpen((prev) => !prev)}
          >
            <FiPlus />
            {builderOpen ? 'Ekleme Panelini Gizle' : 'Yeni Kıyafet Ekle'}
            {builderOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <Link to="/outfits" className="btn-go-outfit-studio">
            <FaMagic /> Kombin Stüdyosu ({outfits.length})
          </Link>
        </div>
      </header>

      {/* Gardırop Analitik & Renk Paleti Özeti */}
      <section className="wardrobe-analytics">
        <div className="kpi-grid">
          <button
            type="button"
            className={`kpi-card ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => {
              setFilterRole('all');
              setFilterCategory('all');
            }}
          >
            <span className="kpi-icon kpi-icon--all">
              <FiSliders />
            </span>
            <div>
              <strong>{items.length}</strong>
              <span>Toplam Parça</span>
            </div>
          </button>

          <button
            type="button"
            className={`kpi-card ${filterRole === 'top' ? 'active' : ''}`}
            onClick={() => {
              setFilterRole('top');
              setFilterCategory('all');
            }}
          >
            <span className="kpi-icon kpi-icon--top">
              <FaTshirt />
            </span>
            <div>
              <strong>{topsCount}</strong>
              <span>Üst Giyim</span>
            </div>
          </button>

          <button
            type="button"
            className={`kpi-card ${filterRole === 'bottom' ? 'active' : ''}`}
            onClick={() => {
              setFilterRole('bottom');
              setFilterCategory('all');
            }}
          >
            <span className="kpi-icon kpi-icon--bottom">
              <FiLayers />
            </span>
            <div>
              <strong>{bottomsCount}</strong>
              <span>Alt Giyim</span>
            </div>
          </button>

          <button
            type="button"
            className={`kpi-card ${filterRole === 'outer' ? 'active' : ''}`}
            onClick={() => {
              setFilterRole('outer');
              setFilterCategory('all');
            }}
          >
            <span className="kpi-icon kpi-icon--outer">
              <FiShield />
            </span>
            <div>
              <strong>{outersCount}</strong>
              <span>Dış Giyim</span>
            </div>
          </button>
        </div>

        {colorDistribution.length > 0 && (
          <div className="color-distribution-bar">
            <span className="dist-title">Gardırop Renk Paletin:</span>
            <div className="dist-pills">
              {colorDistribution.slice(0, 7).map((c) => (
                <span key={c.color} className="dist-pill">
                  <span
                    className="dist-dot"
                    style={{
                      backgroundColor: c.hex,
                      border: isLightHex(c.hex) ? '1px solid #9ca3af' : 'none',
                    }}
                  />
                  {c.color} <strong>({c.count})</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Profesyonel İki Sütunlu "Yeni Kıyafet Tasarım & Ekleme Stüdyosu" */}
      {builderOpen && (
        <section className="garment-creator-studio">
          <div className="studio-nav">
            <div className="studio-tabs">
              <button
                type="button"
                className={`studio-tab ${builderMode === 'custom' ? 'active' : ''}`}
                onClick={() => setBuilderMode('custom')}
              >
                <FiSliders /> Özel Kıyafet Oluştur
              </button>
              <button
                type="button"
                className={`studio-tab ${builderMode === 'presets' ? 'active' : ''}`}
                onClick={() => setBuilderMode('presets')}
              >
                <FaTshirt /> Hazır Kapsül Parçalar (Tek Tık)
              </button>
              <button
                type="button"
                className={`studio-tab ${builderMode === 'favorites' ? 'active' : ''}`}
                onClick={() => setBuilderMode('favorites')}
              >
                <FiHeart /> Favorilerimden Aktar ({favorites.length})
              </button>
            </div>

            {justAddedToast && (
              <div className="added-toast">
                <FiCheck /> {justAddedToast}
              </div>
            )}
          </div>

          {/* 1) ÖZEL KIYAFET OLUŞTURUCU (SOLDA CANLI KART ÖNİZLEMESİ + SAĞDA SEÇİCİLER) */}
          {builderMode === 'custom' && (
            <div className="creator-split-layout">
              {/* Sol Sütun: Canlı Kıyafet Kartı Önizlemesi */}
              <div className="live-preview-pane">
                <span className="preview-badge">CANLI KART ÖNİZLEMESİ</span>
                <div className="preview-garment-card">
                  <div
                    className="preview-visual"
                    style={{
                      backgroundColor: selectedColor.hex,
                      color: isLightHex(selectedColor.hex) ? '#111827' : '#ffffff',
                    }}
                  >
                    <div className="preview-icon">
                      {getCategoryIcon(selectedCategory)}
                    </div>
                    <span className="preview-fit-tag">{selectedFit}</span>
                  </div>
                  <div className="preview-meta">
                    <div className="meta-row">
                      <span className="cat">{selectedCategory}</span>
                      <span className="col">
                        <span
                          className="dot"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        {selectedColor.name}
                      </span>
                    </div>
                    <h4>{previewTitle}</h4>
                  </div>
                </div>
              </div>

              {/* Sağ Sütun: Adım Adım Modern Seçiciler */}
              <form className="creator-controls-pane" onSubmit={handleManualAdd}>
                <div className="control-block">
                  <label>1. {t('PAGE.WARDROBE.LABEL_CATEGORY')}</label>
                  <div className="category-grid">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        className={`cat-tile ${
                          selectedCategory === cat.label ? 'active' : ''
                        }`}
                        onClick={() => setSelectedCategory(cat.label)}
                      >
                        <span className="tile-icon">{cat.icon}</span>
                        <div className="tile-text">
                          <strong>{cat.label}</strong>
                          <small>{cat.roleLabel}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-block">
                  <label>
                    2. Kalıp / Silüet Seçimi:{' '}
                    <strong>{selectedFit}</strong>
                  </label>
                  <div className="fit-pills">
                    {FIT_OPTIONS.map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        className={`fit-pill ${selectedFit === fit ? 'active' : ''}`}
                        onClick={() => setSelectedFit(fit)}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-block">
                  <label>
                    3. {t('PAGE.WARDROBE.LABEL_COLOR')}:{' '}
                    <strong>{selectedColor.name}</strong>
                  </label>
                  <div className="swatch-grid">
                    {DEFAULT_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        className={`swatch-chip ${
                          selectedColor.name === col.name ? 'active' : ''
                        }`}
                        onClick={() => setSelectedColor(col)}
                      >
                        <span
                          className="swatch-circle"
                          style={{
                            backgroundColor: col.hex,
                            border: col.border ? '1px solid #cbd5e1' : 'none',
                          }}
                        />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-block control-block--submit">
                  <div className="input-with-label">
                    <label>4. Parça Adı ({t('PAGE.WARDROBE.NAME_OPTIONAL')})</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={`Örn: ${previewTitle}`}
                      className="creator-input"
                    />
                  </div>
                  <button type="submit" className="btn-save-garment">
                    <FiPlus /> {t('PAGE.WARDROBE.BTN_ADD')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2) HAZIR KAPSÜL GARDIROP PARÇALARI */}
          {builderMode === 'presets' && (
            <div className="capsule-presets-pane">
              <p className="pane-subtitle">
                Her gardıropta bulunan temel kapsül parçaları tek tıkla dolabına
                ekleyebilirsin:
              </p>
              <div className="capsule-grid">
                {CAPSULE_PRESETS.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    className="capsule-card"
                    onClick={() => handleQuickPresetAdd(tpl)}
                  >
                    <div
                      className="capsule-swatch"
                      style={{
                        backgroundColor: tpl.hex,
                        color: isLightHex(tpl.hex) ? '#111827' : '#ffffff',
                      }}
                    >
                      {getCategoryIcon(tpl.category)}
                    </div>
                    <div className="capsule-info">
                      <span className="capsule-tag">{tpl.tag}</span>
                      <strong>{tpl.name}</strong>
                      <small>
                        {tpl.category} • {tpl.color}
                      </small>
                    </div>
                    <span className="capsule-add-icon">
                      <FiPlus />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3) FAVORİLERİMDEN DOLABA AKTAR */}
          {builderMode === 'favorites' && (
            <div className="favorites-import-pane">
              <p className="pane-subtitle">{t('PAGE.WARDROBE.FAVORITES_DESC')}</p>
              {favorites.length === 0 ? (
                <div className="empty-fav-box">
                  <p>{t('PAGE.WATCHLIST.EMPTY')}</p>
                  <Link to="/products" className="btn-explore">
                    {t('PAGE.HOME.HERO_CTA_PRIMARY')}
                  </Link>
                </div>
              ) : (
                <div className="fav-import-grid">
                  {favorites.map((fav) => {
                    const alreadyIn = isProductInWardrobe(fav.id);
                    return (
                      <div
                        key={`${fav.brand}:${fav.id}`}
                        className="fav-import-card"
                      >
                        <img src={fav.imageUrl} alt={fav.name} />
                        <div className="fav-import-info">
                          <small>{fav.brand}</small>
                          <h4>{fav.name}</h4>
                          <span>{fav.category}</span>
                        </div>
                        <button
                          type="button"
                          className={`btn-import ${alreadyIn ? 'is-added' : ''}`}
                          disabled={alreadyIn}
                          onClick={() => {
                            if (!alreadyIn) {
                              addStoreItem({
                                id: fav.id,
                                brand: fav.brand,
                                name: fav.name,
                                category: fav.category,
                                imageUrl: fav.imageUrl,
                                galleryImages: [fav.imageUrl],
                                offers: [],
                                availableSizes: [],
                              });
                              showToast(`${fav.name} dolabına aktarıldı`);
                            }
                          }}
                        >
                          {alreadyIn ? (
                            <>
                              <FiCheck /> {t('PAGE.WARDROBE.ALREADY_IN')}
                            </>
                          ) : (
                            <>
                              <FiPlus /> {t('PAGE.WARDROBE.ADD_TO_WARDROBE')}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Gardırop Vitrini & Filtreleme Araç Çubuğu */}
      <section className="wardrobe-showcase">
        <div className="showcase-toolbar">
          <div className="showcase-title">
            <h2>
              {t('PAGE.WARDROBE.MY_CLOTHES')}
              <span className="count-pill">{filteredItems.length}</span>
            </h2>
          </div>

          <div className="showcase-filters">
            <div className="wardrobe-search">
              <FiSearch className="s-icon" />
              <input
                type="text"
                value={wardrobeSearch}
                onChange={(e) => setWardrobeSearch(e.target.value)}
                placeholder="Dolabında ara (isim, renk, kategori)..."
              />
              {wardrobeSearch && (
                <button
                  type="button"
                  className="s-clear"
                  onClick={() => setWardrobeSearch('')}
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="cat-chips">
              <button
                type="button"
                className={`cat-chip ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCategory('all')}
              >
                Tümü ({items.length})
              </button>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-chip ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="wardrobe-empty-state">
            <div className="empty-circle">
              <FaTshirt />
            </div>
            <h3>{t('PAGE.WARDROBE.EMPTY_TITLE')}</h3>
            <p>{t('PAGE.WARDROBE.EMPTY_DESC')}</p>
            {!builderOpen && (
              <button
                type="button"
                className="btn-open-creator"
                onClick={() => setBuilderOpen(true)}
              >
                <FiPlus /> İlk Kıyafetini Ekle
              </button>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="wardrobe-empty-state">
            <h3>{t('STATE.EMPTY.PRODUCTS_TITLE')}</h3>
            <p>{t('STATE.EMPTY.PRODUCTS_DESC')}</p>
          </div>
        ) : (
          <div className="wardrobe-cards-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="garment-card">
                <div className="garment-card__visual">
                  <button
                    type="button"
                    className="btn-remove-garment"
                    onClick={() => removeItem(item.id)}
                    title={t('PAGE.WARDROBE.REMOVE')}
                    aria-label="remove"
                  >
                    <FiTrash2 />
                  </button>

                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <div
                      className="garment-color-canvas"
                      style={{
                        backgroundColor: item.colorHex || '#3b82f6',
                        color: isLightHex(item.colorHex) ? '#111827' : '#ffffff',
                      }}
                    >
                      <span className="canvas-icon">
                        {getCategoryIcon(item.category)}
                      </span>
                      <span className="canvas-color">{item.color}</span>
                    </div>
                  )}

                  <span className="garment-source-badge">
                    {item.brand ? item.brand : 'Gardırop'}
                  </span>
                </div>

                <div className="garment-card__body">
                  <div className="garment-meta">
                    <span className="garment-cat">{item.category}</span>
                    <span className="garment-color">
                      {item.colorHex && (
                        <span
                          className="color-dot"
                          style={{
                            backgroundColor: item.colorHex,
                            border: isLightHex(item.colorHex)
                              ? '1px solid #9ca3af'
                              : 'none',
                          }}
                        />
                      )}
                      {item.color}
                    </span>
                  </div>

                  <h4 className="garment-title">{item.name}</h4>

                  <div className="garment-actions">
                    <Link
                      to={`/outfits?piece=${encodeURIComponent(item.id)}`}
                      className="btn-style-piece"
                    >
                      <FaMagic /> Kombinde Kullan
                    </Link>

                    {item.source === 'store' && item.productId && (
                      <Link
                        to={`/product/${item.productId}`}
                        className="btn-store-detail"
                        title={t('PAGE.PRODUCTS.BTN_DETAIL')}
                      >
                        <FiExternalLink />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Wardrobe;
