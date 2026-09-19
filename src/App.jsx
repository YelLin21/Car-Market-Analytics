import { useEffect } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import carList from './assets/taladrod-cars.min.json';
import Car from './Components/Car';
import DataTable from './Components/DataTable';
import './App.css';

const NavContent = ({ cars, brands }) => {
  const location = useLocation();

  useEffect(() => {
    const isDashboard = location.pathname === '/';
    document.title = isDashboard ? 'Car Market Analytics' : 'Browse and Compare Cars | Car Market';

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = isDashboard
      ? 'Explore car market availability, model mix, and market value.'
      : 'Browse, save, compare, and inspect car listings in detail.';
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="sticky-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-mark">
            <span className="brand-mark-icon" aria-hidden="true">CM</span>
            <span>Car Market</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navigation" />
          <Navbar.Collapse id="main-navigation">
            <Nav className="main-navigation">
              <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/highlight" className={location.pathname === '/highlight' ? 'active' : ''}>
                Highlighted
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<DataTable data={cars} brand={brands} />} />
          <Route path="/highlight" element={<Car data={cars} />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <Router basename={import.meta.env.BASE_URL}>
    <NavContent cars={carList.Cars} brands={carList.MMList} />
  </Router>
);

export default App;
