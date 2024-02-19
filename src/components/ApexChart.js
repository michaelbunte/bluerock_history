import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({
    data,
    brush_start,
    brush_end
  }) => {
  const [state, setState] = useState({
    series: [{
      data: data
    }],
    options: {
      chart: {
        id: 'chart2',
        type: 'line',
        height: 230,
        toolbar: {
          autoSelected: 'pan',
          show: false
        }
      },
      colors: ['#546E7A'],
      stroke: {
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: 'datetime'
      }
    },
    
    seriesLine: [{
      data: data
    }],
    optionsLine: {
      chart: {
        id: 'chart1',
        height: 130,
        type: 'area',
        brush: {
          target: 'chart2',
          enabled: true
        },
        selection: {
          enabled: true,
          xaxis: {
            min: new Date(brush_start).getTime(),
            max: new Date(brush_end).getTime()
          }
        },
      },
      colors: ['#008FFB'],
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.91,
          opacityTo: 0.1,
        }
      },
      xaxis: {
        type: 'datetime',
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        tickAmount: 2,
        min: 0
      }
    },
  });

  return (
    <div>
      <div id="wrapper">
        <div id="chart-line2">
          <ReactApexChart options={state.options} series={state.series} type="line" height={230} />
        </div>
        <div id="chart-line">
          <ReactApexChart options={state.optionsLine} series={state.seriesLine} type="area" height={130} />
        </div>
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default ApexChart;
