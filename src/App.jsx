import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl } from 'react-bootstrap';
import carList from './assets/taladrod-cars.min.json';
import Car from './Components/Car';
import DataTable from './Components/DataTable';
import './App.css';

const NavContent = ({ Cars, MMList }) => {
  const location = useLocation();

  return (
    <>
      <Navbar
        style={{
          position: "sticky",
          top: "0",
          zIndex: "1000",
          backgroundColor: "#669ed6ff"
        }}
         expand="lg" className="sticky-navbar mb-4">

        <Container>
          <Navbar.Brand as={Link} to="/"><h2>Car Market</h2></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/highlight" className={location.pathname === '/highlight' ? 'active' : ''}>Highlighted</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
        </Navbar>
      <Routes>
        <Route path="/" element={<DataTable data={Cars} brand={MMList} />} />
        <Route path="/highlight" element={<Car data={Cars} />} />
      </Routes>
    </>
  );
};

const App = () => {
  const { Cars } = carList;
  const { MMList } = carList;

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <NavContent Cars={Cars} MMList={MMList} />
    </Router>
  );
};

export default App;

