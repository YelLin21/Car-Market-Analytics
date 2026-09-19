import { useState } from 'react';
import { Col, Container, FormControl, Row, Table } from 'react-bootstrap';
import PieChart from './Piechart';
import StackedBarChart from './StackedbarChart2';
import './dashboard.css';

const formatNumber = (value) => value.toLocaleString('en-US');

const DataTable = ({ data, brand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredData = data.filter((car) => {
    if (car.IsCExp) return false;
    return car.NameMMT.toLowerCase().includes(normalizedSearch);
  });

  const filteredBrand = brand.filter((item) =>
    item.Name.toLowerCase().includes(normalizedSearch),
  );

  const countTotalOfBrand = (mkID) =>
    filteredData.filter((item) => item.MkID === mkID).length;

  const totalValueOfBrand = (mkID) => filteredData.reduce((total, item) => {
    if (item.MkID !== mkID) return total;
    return total + parseInt(item.Prc.replace(/[^0-9.]/g, ''), 10);
  }, 0);

  const modelCounts = filteredData.reduce((acc, car) => {
    if (!acc[car.MdID]) {
      acc[car.MdID] = { count: 0, models: new Set(), nameMMT: new Set(), price: 0 };
    }
    acc[car.MdID].count += 1;
    acc[car.MdID].models.add(car.Model);
    acc[car.MdID].nameMMT.add(car.NameMMT);
    acc[car.MdID].price += parseInt(car.Prc.replace(/[^0-9.]/g, ''), 10);
    return acc;
  }, {});

  const modelResults = Object.entries(modelCounts).map(([mdID, result]) => ({
    MdID: mdID,
    Count: result.count,
    Models: Array.from(result.models).join(', '),
    NameMMT: Array.from(result.nameMMT).join(', '),
    Prc: result.price,
  }));

  const totalBrands = new Set(filteredData.map((car) => car.MkID)).size;

  return (
    <Container fluid className="dashboard-page px-0">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Market overview</p>
          <h1>Car market analytics</h1>
          <p className="page-subtitle">Explore availability, model mix, and estimated market value at a glance.</p>
        </div>
        <div className="dashboard-search">
          <label htmlFor="market-search">Search inventory</label>
          <FormControl
            id="market-search"
            type="search"
            placeholder="Try Toyota, Honda..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="metric-grid" aria-label="Market summary">
        <div className="metric-card"><span className="metric-label">Available cars</span><strong>{formatNumber(filteredData.length)}</strong><span className="metric-detail">In current inventory</span></div>
        <div className="metric-card"><span className="metric-label">Brands tracked</span><strong>{formatNumber(totalBrands)}</strong><span className="metric-detail">Across all listings</span></div>
        <div className="metric-card"><span className="metric-label">Models tracked</span><strong>{formatNumber(modelResults.length)}</strong><span className="metric-detail">Unique model groups</span></div>
      </section>

      <Row className="g-4">
        <Col xs={12} xl={7}>
          <section className="dashboard-card table-card">
            <div className="section-heading"><div><p className="eyebrow">Inventory mix</p><h2>Models by volume</h2></div><span className="result-count">{modelResults.length} groups</span></div>
            <div className="table-scroll">
              <Table responsive="sm" className="analytics-table mb-0">
                <thead><tr><th>Brand</th><th>Model</th><th>Cars</th><th>Value (฿)</th></tr></thead>
                <tbody>
                  {modelResults.map((item) => (
                    <tr key={item.MdID}>
                      <td>{item.NameMMT.slice(0, item.NameMMT.indexOf(' '))}</td><td>{item.Models}</td><td>{item.Count}</td><td>{formatNumber(item.Prc)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {modelResults.length === 0 && <p className="empty-table">No inventory matches your search.</p>}
            </div>
          </section>
        </Col>
        <Col xs={12} xl={5}>
          <section className="dashboard-card table-card">
            <div className="section-heading"><div><p className="eyebrow">Brand summary</p><h2>Market value</h2></div></div>
            <div className="table-scroll">
              <Table responsive="sm" className="analytics-table mb-0">
                <thead><tr><th>Brand</th><th>Cars</th><th>Value (฿)</th></tr></thead>
                <tbody>
                  {filteredBrand.map((item) => {
                    const totalCars = countTotalOfBrand(item.mkID);
                    if (totalCars === 0) return null;
                    return <tr key={item.mkID}><td>{item.Name}</td><td>{totalCars}</td><td>{formatNumber(totalValueOfBrand(item.mkID))}</td></tr>;
                  })}
                </tbody>
              </Table>
              {filteredBrand.every((item) => countTotalOfBrand(item.mkID) === 0) && <p className="empty-table">No brands match your search.</p>}
            </div>
          </section>
        </Col>
      </Row>

      <section className="chart-grid">
        <div className="dashboard-card chart-card"><PieChart data={data} /></div>
        <div className="dashboard-card chart-card chart-card-wide"><StackedBarChart data={data} /></div>
      </section>
    </Container>
  );
};

export default DataTable;
