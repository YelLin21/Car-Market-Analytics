import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { useSearchParams } from 'react-router-dom';
import carsData from '../assets/taladrod-cars.min.json';
import './car.css';

const getBrand = (car) => car.NameMMT.split(' ')[0];
const getPrice = (car) => Number(String(car.Prc || '').replace(/[^0-9.]/g, '')) || 0;
const MAX_COMPARE_CARS = 3;
const PAGE_SIZE = 12;
const initialFilters = {
  search: '',
  brand: 'All',
  model: 'All',
  province: 'All',
  status: 'All',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
};

const formatAmount = (value, currency = 'Baht') => (
  value ? `${value.toLocaleString('en-US')} ${currency}` : 'Contact seller'
);

const getPriceStats = (cars) => {
  const prices = cars.map(getPrice).filter((price) => price > 0);
  if (prices.length === 0) return null;
  return {
    count: prices.length,
    average: Math.round(prices.reduce((total, price) => total + price, 0) / prices.length),
    minimum: Math.min(...prices),
    maximum: Math.max(...prices),
  };
};

const comparisonRows = [
  ['Brand', (car) => getBrand(car)],
  ['Model', (car) => car.Model],
  ['Price', (car) => formatAmount(getPrice(car), car.Currency)],
  ['Year', (car) => car.Yr],
  ['Location', (car) => car.Province],
  ['Status', (car) => car.Status],
  ['Page views', (car) => car.PageViews],
  ['Last updated', (car) => `${car.Upd} days ago`],
  ['Down payment', (car) => car.DPmt && Number(car.DPmt) > 0 ? `${car.DPmt} ${car.Currency}` : 'Not specified'],
];

const detailSpecs = (car) => [
  ['Brand', getBrand(car)],
  ['Model', car.Model],
  ['Year', car.Yr],
  ['Location', car.Province],
  ['Status', car.Status],
  ['Listing ID', car.Cid],
  ['Page views', car.PageViews],
  ['Last updated', `${car.Upd} days ago`],
  ['Down payment', car.DPmt && Number(car.DPmt) > 0 ? `${car.DPmt} ${car.Currency}` : 'Not specified'],
];

export default function Highlight({ data = carsData.Cars }) {
  const [highlightedCars, setHighlightedCars] = useLocalStorage('highlightedCars', []);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('relevance');
  const [savedBrand, setSavedBrand] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const [compareCars, setCompareCars] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const safeHighlightedCars = Array.isArray(highlightedCars) ? highlightedCars : [];
  const sharedCarId = searchParams.get('car');
  const uniqueBrands = ['All', ...new Set(data.map(getBrand))];
  const uniqueProvinces = ['All', ...new Set(data.map((car) => car.Province).filter(Boolean).sort())];
  const uniqueStatuses = ['All', ...new Set(data.map((car) => car.Status).filter(Boolean).sort())];
  const availableModels = filters.brand === 'All'
    ? data.map((car) => car.Model)
    : data.filter((car) => getBrand(car) === filters.brand).map((car) => car.Model);
  const uniqueModels = ['All', ...new Set(availableModels.filter(Boolean).sort())];
  const savedBrands = [...new Set(safeHighlightedCars.map(getBrand))];

  useEffect(() => {
    const sharedCar = data.find((car) => String(car.Cid) === sharedCarId);
    setSelectedCar(sharedCar || null);
  }, [data, sharedCarId]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.brand, filters.model, filters.province, filters.status, filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, sortBy]);

  useEffect(() => {
    const hasModal = selectedCar !== null || compareOpen;
    document.body.style.overflow = hasModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCar, compareOpen]);

  useEffect(() => {
    const closeWithEscape = (event) => {
      if (event.key !== 'Escape') return;
      setSelectedCar(null);
      setCompareOpen(false);
    };
    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, []);

  const isHighlighted = (Cid) => safeHighlightedCars.some((car) => car.Cid === Cid);
  const isCompared = (Cid) => compareCars.some((car) => car.Cid === Cid);

  const openDetails = (car) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('car', String(car.Cid));
    setSearchParams(nextParams);
  };

  const closeDetails = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('car');
    setSearchParams(nextParams, { replace: true });
  };

  const highlightCar = (car) => {
    if (isHighlighted(car.Cid)) return;
    setHighlightedCars([...safeHighlightedCars, car]);
  };

  const removeCar = (Cid) => {
    setHighlightedCars(safeHighlightedCars.filter((car) => car.Cid !== Cid));
  };

  const toggleCompare = (car) => {
    if (isCompared(car.Cid)) {
      setCompareCars(compareCars.filter((item) => item.Cid !== car.Cid));
      setCompareNotice('');
      return;
    }
    if (compareCars.length >= MAX_COMPARE_CARS) {
      setCompareNotice(`You can compare up to ${MAX_COMPARE_CARS} cars at a time.`);
      return;
    }
    setCompareCars([...compareCars, car]);
    setCompareNotice('');
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, ...(name === 'brand' ? { model: 'All' } : {}) }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSortBy('relevance');
  };

  const filteredCars = data.filter((car) => {
    if (car.IsCExp) return false;
    const searchText = `${car.NameMMT} ${car.Model} ${car.Province}`.toLowerCase();
    const price = getPrice(car);
    const year = Number(car.Yr);
    const minPrice = filters.minPrice === '' ? 0 : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? Infinity : Number(filters.maxPrice);
    const minYear = filters.minYear === '' ? -Infinity : Number(filters.minYear);
    const maxYear = filters.maxYear === '' ? Infinity : Number(filters.maxYear);
    return searchText.includes(filters.search.toLowerCase().trim())
      && (filters.brand === 'All' || getBrand(car) === filters.brand)
      && (filters.model === 'All' || car.Model === filters.model)
      && (filters.province === 'All' || car.Province === filters.province)
      && (filters.status === 'All' || car.Status === filters.status)
      && price >= minPrice && price <= maxPrice
      && year >= minYear && year <= maxYear;
  });

  const sortedCars = [...filteredCars].sort((first, second) => {
    if (sortBy === 'price-low') return getPrice(first) - getPrice(second);
    if (sortBy === 'price-high') return getPrice(second) - getPrice(first);
    if (sortBy === 'year-new') return Number(second.Yr) - Number(first.Yr);
    if (sortBy === 'year-old') return Number(first.Yr) - Number(second.Yr);
    if (sortBy === 'popular') return Number(second.PageViews) - Number(first.PageViews);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedCars.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCars = sortedCars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const priceStats = getPriceStats(filteredCars);
  const selectedModelCars = selectedCar ? data.filter((car) => car.Model === selectedCar.Model && !car.IsCExp) : [];
  const similarCars = selectedCar ? data.filter((car) => car.Cid !== selectedCar.Cid && getBrand(car) === getBrand(selectedCar)).slice(0, 3) : [];

  const exportComparison = () => {
    const rows = [['Car', ...comparisonRows.map(([label]) => label)], ...compareCars.map((car) => [car.NameMMT, ...comparisonRows.map(([, getValue]) => getValue(car))])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'car-comparison.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sharedDetailProps = selectedCar ? {
    car: selectedCar,
    modelStats: getPriceStats(selectedModelCars),
    similarCars,
    isCompared: isCompared(selectedCar.Cid),
    compareDisabled: compareCars.length >= MAX_COMPARE_CARS,
    onToggleCompare: toggleCompare,
    onOpenDetails: openDetails,
    onClose: closeDetails,
  } : null;

  return (
    <div className="highlight-page">
      <section className="highlight-hero">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1>Find cars worth a closer look.</h1>
          <p>Save interesting listings, open their details, and compare your favourites.</p>
        </div>
        <div className="saved-count"><strong>{safeHighlightedCars.length}</strong><span>saved {safeHighlightedCars.length === 1 ? 'car' : 'cars'}</span></div>
      </section>

      {safeHighlightedCars.length > 0 && (
        <section className="saved-section" aria-labelledby="saved-cars-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Saved inventory</p><h2 id="saved-cars-heading">Highlighted cars</h2></div>
            <div className="saved-filters" role="tablist" aria-label="Filter highlighted cars">
              <button type="button" className={savedBrand === 'All' ? 'saved-filter active' : 'saved-filter'} onClick={() => setSavedBrand('All')}>All</button>
              {savedBrands.map((brand) => (
                <button type="button" key={brand} className={savedBrand === brand ? 'saved-filter active' : 'saved-filter'} onClick={() => setSavedBrand(brand)}>{brand}</button>
              ))}
            </div>
          </div>
          <div className="car-container saved-car-grid">
            {safeHighlightedCars.filter((car) => savedBrand === 'All' || getBrand(car) === savedBrand).map((car) => (
              <CarCard key={car.Cid} car={car} highlighted onRemove={removeCar} onOpenDetails={openDetails} isCompared={isCompared(car.Cid)} onToggleCompare={toggleCompare} compareDisabled={compareCars.length >= MAX_COMPARE_CARS} />
            ))}
          </div>
        </section>
      )}

      <section className="available-section" aria-labelledby="available-cars-heading">
        <div className="section-heading available-heading">
          <div><p className="eyebrow">Browse inventory</p><h2 id="available-cars-heading">Available cars</h2></div>
          <span className="inventory-result-count">{sortedCars.length.toLocaleString('en-US')} matching listings</span>
        </div>

        <div className="inventory-tools">
          <div className="inventory-toolbar">
            <label className="inventory-search" htmlFor="inventory-search"><span>Search inventory</span><input id="inventory-search" type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Brand, model, or location" /></label>
            <label className="sort-field" htmlFor="inventory-sort"><span>Sort by</span><select id="inventory-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="relevance">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="year-new">Year: newest</option><option value="year-old">Year: oldest</option><option value="popular">Most viewed</option></select></label>
            <button type="button" className="reset-filters" onClick={clearFilters}>Reset filters</button>
          </div>
          <div className="advanced-filters">
            <label className="filter-field"><span>Brand</span><select value={filters.brand} onChange={(event) => updateFilter('brand', event.target.value)}>{uniqueBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
            <label className="filter-field"><span>Model</span><select value={filters.model} onChange={(event) => updateFilter('model', event.target.value)}>{uniqueModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>
            <label className="filter-field"><span>Location</span><select value={filters.province} onChange={(event) => updateFilter('province', event.target.value)}>{uniqueProvinces.map((province) => <option key={province} value={province}>{province}</option>)}</select></label>
            <label className="filter-field"><span>Status</span><select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>{uniqueStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <label className="filter-field compact-field"><span>Min price</span><input type="number" min="0" value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="Any" /></label>
            <label className="filter-field compact-field"><span>Max price</span><input type="number" min="0" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="Any" /></label>
            <label className="filter-field compact-field"><span>From year</span><input type="number" min="1900" max="2100" value={filters.minYear} onChange={(event) => updateFilter('minYear', event.target.value)} placeholder="Any" /></label>
            <label className="filter-field compact-field"><span>To year</span><input type="number" min="1900" max="2100" value={filters.maxYear} onChange={(event) => updateFilter('maxYear', event.target.value)} placeholder="Any" /></label>
          </div>
        </div>

        {priceStats && (
          <div className="inventory-stats" aria-label="Price insights for matching listings">
            <div><span>Average price</span><strong>{formatAmount(priceStats.average)}</strong></div>
            <div><span>Lowest price</span><strong>{formatAmount(priceStats.minimum)}</strong></div>
            <div><span>Highest price</span><strong>{formatAmount(priceStats.maximum)}</strong></div>
          </div>
        )}

        <div className="car-container">
          {visibleCars.map((car) => (
            <CarCard key={car.Cid} car={car} isHighlighted={isHighlighted(car.Cid)} isCompared={isCompared(car.Cid)} onHighlight={highlightCar} onOpenDetails={openDetails} onToggleCompare={toggleCompare} compareDisabled={compareCars.length >= MAX_COMPARE_CARS} />
          ))}
        </div>
        {sortedCars.length === 0 && <p className="empty-cars">No cars match these filters. Try widening your search.</p>}
        {sortedCars.length > 0 && <PaginationControls page={currentPage} totalPages={totalPages} onChange={setPage} />}
      </section>

      {compareCars.length > 0 && (
        <aside className="compare-tray" aria-label="Car comparison tray">
          <div className="compare-tray-copy"><strong>{compareCars.length} of {MAX_COMPARE_CARS} cars selected</strong><span>{compareNotice || 'Select up to three cars to compare.'}</span></div>
          <div className="compare-tray-actions">
            <button type="button" className="tray-clear" onClick={() => { setCompareCars([]); setCompareNotice(''); }}>Clear</button>
            <button type="button" className="tray-compare" onClick={() => setCompareOpen(true)} disabled={compareCars.length < 2}>Compare cars</button>
          </div>
        </aside>
      )}

      {sharedDetailProps && <CarDetailsModal key={sharedDetailProps.car.Cid} {...sharedDetailProps} />}
      {compareOpen && <CompareModal cars={compareCars} onRemove={toggleCompare} onExport={exportComparison} onClose={() => setCompareOpen(false)} />}
    </div>
  );
}

function CarCard({ car, highlighted = false, isHighlighted: saved = false, isCompared, compareDisabled, onHighlight, onRemove, onOpenDetails, onToggleCompare }) {
  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenDetails(car);
    }
  };

  return (
    <article className={'car-item' + (saved ? ' is-highlighted' : '')} onClick={() => onOpenDetails(car)} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label={`View details for ${car.NameMMT}`}>
      <div className="car-image-wrap">
        <CarImage src={car.Img300} alt={car.NameMMT} className="car-image" loading="lazy" />
        {saved && <span className="saved-badge">Saved</span>}
        {isCompared && <span className="compare-badge">Comparing</span>}
      </div>
      <div className="car-info">
        <h3 className="car-name">{car.NameMMT}</h3>
        <span className="car-model">{car.Model}</span>
        <div className="car-meta"><span>Year {car.Yr}</span><span>{formatAmount(getPrice(car), car.Currency)}</span></div>
        <button type="button" className="details-link" onClick={(event) => { event.stopPropagation(); onOpenDetails(car); }}>View details <span aria-hidden="true">-&gt;</span></button>
        <div className="car-actions">
          {highlighted ? (
            <button type="button" className="car-action remove-action" onClick={(event) => { event.stopPropagation(); onRemove(car.Cid); }}>Remove</button>
          ) : (
            <button type="button" className="car-action" onClick={(event) => { event.stopPropagation(); onHighlight(car); }} disabled={saved}>{saved ? 'Highlighted' : 'Highlight'}</button>
          )}
          <button type="button" className={'car-action compare-action' + (isCompared ? ' selected' : '')} onClick={(event) => { event.stopPropagation(); onToggleCompare(car); }} disabled={!isCompared && compareDisabled}>
            {isCompared ? 'Remove compare' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}

function CarImage({ src, alt, className, loading = 'eager' }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    setImageSrc(src);
    setLoadingImage(true);
  }, [src]);

  return (
    <div className={'image-frame' + (loadingImage ? ' image-loading' : '')}>
      <img src={imageSrc || '/car-placeholder.svg'} alt={alt} className={className} loading={loading} onLoad={() => setLoadingImage(false)} onError={() => { setImageSrc('/car-placeholder.svg'); setLoadingImage(false); }} />
    </div>
  );
}

function CarDetailsModal({ car, modelStats, similarCars, isCompared, compareDisabled, onToggleCompare, onOpenDetails, onClose }) {
  const imageSources = [...new Set([car.Img100, car.Img300, car.Img600].filter(Boolean))];
  const [activeImage, setActiveImage] = useState(imageSources.length - 1);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="car-modal details-modal" role="dialog" aria-modal="true" aria-labelledby="car-details-title">
        <button type="button" className="modal-close" aria-label="Close car details" onClick={onClose}>x</button>
        <div className="details-modal-grid">
          <div className="modal-gallery">
            <div className="modal-image-wrap"><CarImage src={imageSources[activeImage] || car.Img300} alt={car.NameMMT} className="modal-main-image" /></div>
            <div className="image-thumbnails" aria-label="Car images">
              {imageSources.map((image, index) => <button type="button" key={image} className={activeImage === index ? 'image-thumbnail active' : 'image-thumbnail'} onClick={() => setActiveImage(index)}><img src={image} alt={`${car.NameMMT} view ${index + 1}`} /></button>)}
            </div>
          </div>
          <div className="modal-copy">
            <p className="eyebrow">{getBrand(car)} · {car.Status}</p>
            <h2 id="car-details-title">{car.NameMMT}</h2>
            <p className="modal-model">{car.Model}</p>
            <strong className="modal-price">{formatAmount(getPrice(car), car.Currency)}</strong>
            <div className="spec-grid">
              {detailSpecs(car).map(([label, value]) => <div className="spec-item" key={label}><span>{label}</span><strong>{value || 'Not specified'}</strong></div>)}
            </div>
            {modelStats && <div className="market-insight"><span>Model average price</span><strong>{formatAmount(modelStats.average, car.Currency)}</strong><small>{getPrice(car) <= modelStats.average ? 'This listing is at or below the model average.' : 'This listing is above the model average.'}</small></div>}
            <button type="button" className={'modal-compare-button' + (isCompared ? ' selected' : '')} onClick={() => onToggleCompare(car)} disabled={!isCompared && compareDisabled}>{isCompared ? 'Remove from comparison' : compareDisabled ? 'Comparison is full' : 'Add to comparison'}</button>
          </div>
        </div>
        {similarCars.length > 0 && <div className="similar-section"><h3>More from {getBrand(car)}</h3><div className="similar-cars">{similarCars.map((similarCar) => <button type="button" className="similar-car" key={similarCar.Cid} onClick={() => onOpenDetails(similarCar)}><CarImage src={similarCar.Img100} alt="" className="similar-car-image" loading="lazy" /><span><strong>{similarCar.NameMMT}</strong><small>{formatAmount(getPrice(similarCar), similarCar.Currency)}</small></span></button>)}</div></div>}
      </div>
    </div>
  );
}

function CompareModal({ cars, onRemove, onExport, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="car-modal compare-modal" role="dialog" aria-modal="true" aria-labelledby="compare-title">
        <div className="compare-modal-header"><div><p className="eyebrow">Side by side</p><h2 id="compare-title">Compare cars</h2></div><div className="compare-header-actions"><button type="button" className="compare-export" onClick={onExport}>Download CSV</button><button type="button" className="compare-export" onClick={() => window.print()}>Print</button><button type="button" className="modal-close" aria-label="Close comparison" onClick={onClose}>x</button></div></div>
        <div className="compare-scroll">
          <div className="compare-grid compare-grid-images"><div className="compare-label-cell">Selected cars</div>{cars.map((car) => <div className="compare-car-heading" key={car.Cid}><CarImage src={car.Img300} alt="" className="compare-car-image" loading="lazy" /><strong>{car.NameMMT}</strong><button type="button" onClick={() => onRemove(car)}>Remove</button></div>)}</div>
          {comparisonRows.map(([label, getValue]) => <div className="compare-grid compare-row" key={label}><strong className="compare-label-cell">{label}</strong>{cars.map((car) => <span key={car.Cid}>{getValue(car) || 'Not specified'}</span>)}</div>)}
        </div>
      </div>
    </div>
  );
}

function PaginationControls({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return <nav className="pagination-controls" aria-label="Inventory pages"><button type="button" className="page-button" onClick={() => onChange(page - 1)} disabled={page === 1}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" className="page-button" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next</button></nav>;
}
