import { useState } from "react";
import { useLocalStorage } from "react-use";
import carsData from "../assets/taladrod-cars.min.json";
import "./car.css";
import { Tabs, Tab, Button } from 'react-bootstrap';

export default function Highlight() {
    const [highlightedCars, setHighlightedCars] = useLocalStorage('highlightedCars', []);
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [subBrands, setSubBrands] = useState([]);
    const [hoveredBrand, setHoveredBrand] = useState(null);
    const [selectedSubBrand, setSelectedSubBrand] = useState("All");

    const isHighlighted = (Cid) => highlightedCars.some(car => car.Cid === Cid);

    const highlightCar = (car) => {
        if (!isHighlighted(car.Cid)) {
            setHighlightedCars([...highlightedCars, car]);
        }
    };

    const removeCar = (Cid) => {
        setHighlightedCars(highlightedCars.filter(car => car.Cid !== Cid));
    };

    const handleBrandFilter = (event) => {
        const brand = event.target.value;
        setSelectedBrand(brand);
        setSelectedSubBrand("All"); // Reset sub-brand when a new brand is selected

        if (brand !== "All") {
            const brandModels = carsData.Cars.filter(car => car.NameMMT.split(' ')[0] === brand)
                .map(car => car.Model);
            setSubBrands([...new Set(brandModels)]);
        } else {
            setSubBrands([]);
        }
    };

    const handleSubBrandFilter = (event) => {
        const model = event.target.value;
        setSelectedSubBrand(model); // Update the sub-brand value only
    };

    const filteredCars = carsData.Cars.filter(car => {
        const brand = car.NameMMT.split(' ')[0];
        const matchesBrand = selectedBrand === "All" || selectedBrand === brand;
        const matchesModel = selectedSubBrand === "All" || selectedSubBrand === car.Model;

        return matchesBrand && matchesModel;
    });

    const uniqueBrands = ["All", ...new Set(carsData.Cars.map(car => car.NameMMT.split(' ')[0]))];

    const groupedHighlightedCars = highlightedCars.reduce((acc, car) => {
        const brand = car.NameMMT.split(' ')[0];
        if (!acc[brand]) {
            acc[brand] = [];
        }
        acc[brand].push(car);
        return acc;
    }, {});

    return (
        <div className="highlight-container">
            <div style={{ textAlign: "center" }}>
                <h2>Highlighted Cars</h2>

                <div className="highlighted-cars">
                    <Tabs defaultActiveKey="All" id="highlighted-cars-tabs">
                        {Object.keys(groupedHighlightedCars).map(brand => (
                            <Tab eventKey={brand} key={brand} title={brand}>
                                <div className="car-container pt-4">
                                    {groupedHighlightedCars[brand].map(car => (
                                        <div key={car.Cid} className="car-item highlighted">
                                            <img src={car.Img300} alt={car.NameMMT} className="car-image" />
                                            <div className="car-info">
                                                <span className="car-name">{car.NameMMT}</span>
                                                <span className="car-model">{car.Model}</span>
                                                <span className="car-year">Year: {car.Yr}</span>
                                                <span className="car-price">Price: {car.Prc}</span>
                                                <Button variant="danger" onClick={() => removeCar(car.Cid)}>Remove</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                    
                    {/* Conditionally render "No cars highlighted yet." text */}
                    {highlightedCars.length === 0 && <p className="pt-4">No cars highlighted yet.</p>}
                </div>

                <div>
                    <label htmlFor="brandFilter" className="filter-label pt-4">Filter by Brand: </label>
                    <select
                        id="brandFilter"
                        value={selectedBrand}
                        onChange={handleBrandFilter}
                        className="filter-select"
                    >
                        {uniqueBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>

                    {selectedBrand !== "All" && subBrands.length > 0 && (
                        <select
                            id="subBrandFilter"
                            value={selectedSubBrand}
                            onChange={handleSubBrandFilter}
                            className="filter-select"
                        >
                            {subBrands.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            <div className="available-cars">
                <div className="car-container">
                    {filteredCars.map(car => (
                         <div key={car.Cid} className={`car-item ${isHighlighted(car.Cid) ? 'highlighted' : ''}`}>
                            <img src={car.Img300} alt={car.NameMMT} className="car-image" />
                            <div className="car-info">
                                <span className="car-name">{car.NameMMT}</span>
                                <span className="car-model">{car.Model}</span>
                                <span className="car-year">Year: {car.Yr}</span>
                                <span className="car-price">Price: {car.Prc}</span>
                                <button className="highlight-button" onClick={() => highlightCar(car)}>
                                    {isHighlighted(car.Cid) ? 'Highlighted' : 'Highlight'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
