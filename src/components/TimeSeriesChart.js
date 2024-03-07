import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ReactD3Library from 'react-d3-library';

const TimeSeriesChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (data.length === 0) return;

    // Set the dimensions and margins of the chart
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Parse the date / time
    const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

    // Set the ranges
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // Define the line
    const line = d3
      .line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    // Create SVG element
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Format the data
    data.forEach(d => {
      d.date = parseTime(d.date);
      d.value = +d.value;
    });

    // Scale the range of the data
    xScale.domain(d3.extent(data, d => d.date));
    yScale.domain([0, d3.max(data, d => d.value)]);

    // Add the valueline path
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', line);

    // Add the X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add the Y Axis
    svg.append('g').call(d3.axisLeft(yScale));

  }, [data]);

  return <ReactD3Library.Svg ref={chartRef} />;
};

export default TimeSeriesChart;
