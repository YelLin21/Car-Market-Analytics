import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import chroma from 'chroma-js';
import cars from '../assets/taladrod-cars.min.json';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const groupCarsByBrand = (cars) => {
  if (!Array.isArray(cars)) {
    console.error('Expected an array for cars, but got:', cars);
    return {};
  }

  const brandCounts = {};

  cars.forEach(car => {
    const brand = car.NameMMT.split(' ')[0];
    if (brandCounts[brand]) {
      brandCounts[brand] += 1;
    } else {
      brandCounts[brand] = 1;
    }
  });

  return brandCounts;
};

const generateDistinctColors = (count) => {
  return chroma.scale('paired').mode('lab').colors(count);
};

const PieChart = ({ data }) => {
  // Validate data to ensure it's an array
  const cars = Array.isArray(data) ? data : [];

  const brandData = groupCarsByBrand(cars);
  
  const sortedBrands = Object.entries(brandData).sort((a, b) => b[1] - a[1]);
  
  const labels = sortedBrands.map(([brand]) => brand);
  const values = sortedBrands.map(([, count]) => count);
  
  const colorCount = labels.length;
  const colors = generateDistinctColors(colorCount);

  const pieData = {
    labels: labels,
    datasets: [
      {
        label: 'Total Number of Cars', // Fixed label property name
        data: values,
        backgroundColor: colors, 
        borderColor: colors.map(color => chroma(color).darken(0.8).hex()), 
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Car Availability by Brand',
        font: {
          size: 18,
        },
      },
    },
  };

  return <Pie data={pieData} options={options} />;
};

export default PieChart;
