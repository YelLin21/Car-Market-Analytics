import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Form, FormControl } from 'react-bootstrap';
import carList from './assets/taladrod-cars.min.json';
import Car from './Components/Car';
import DataTable from './Components/DataTable';
import './App.css';

const App = () => {
  const { Cars } = carList;
  const { MMList } = carList;

  return (

    <Router>
      <Navbar
        style={{
          position: "sticky",
          top: "0",
          zIndex: "1000",
          backgroundColor: "#f8f9fa"
        }}
        bg="light" expand="lg" className="sticky-navbar mb-4">

        <Container>
          <Navbar.Brand as={Link} to="/"><h2>Car Market</h2></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/Car-Market-Analytics">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/Car-Market-Analytics/highlight">Highlighted</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
        </Navbar>
      <Routes>
        <Route path="/Car-Market-Analytics" element={<DataTable data={Cars} brand={MMList} />} />
        <Route path="/Car-Market-Analytics/highlight" element={<Car data={Cars} />} />
      </Routes>
      
    </Router>

  );
}
export default App;

