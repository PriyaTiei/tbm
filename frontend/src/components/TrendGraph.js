import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrendGraph = (props) => {
  const { data, setToDate, toDate, setFromDate, fromDate, setSelectedId, selectedId, mspecs } = props;
  
  const getTomorrowDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDateTenDaysBefore = () => {
    const today = new Date();
    const dateTenDaysBefore = new Date(today);
    dateTenDaysBefore.setDate(today.getDate() - 10);
    return dateTenDaysBefore.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getDateTenDaysBefore());
  const [endDate, setEndDate] = useState(getTomorrowDate());

  useEffect(() => {
    setFromDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setToDate(endDate);
  }, [endDate]);

  useEffect(() => {
    if (mspecs.length > 0) {
      setSelectedId(mspecs[0]._id);
    }
  }, [mspecs]);

  // Sort data by date (year, month, day)
  const sortedData = data.sort((a, b) => {
    const [yearA, monthA, dayA] = a.entryFor.split('-').map(Number);
    const [yearB, monthB, dayB] = b.entryFor.split('-').map(Number);

    if (yearA !== yearB) return yearA - yearB;
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  const filteredData = sortedData.filter(item => {
    const date = new Date(item.entryFor);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const createChart = (label, labelId) => {
    // Filter out any data points without a valid m_value
    const validData = filteredData.filter(item => {
      const spec = item.m_spec.find(spec => spec.m_lable === label);
      return spec && spec.m_value !== null && spec.m_value !== undefined;
    });

    const chartData = {
      labels: validData.map(item => item.entryFor),
      datasets: [
        {
          label: label,
          data: validData.map(item => {
            const spec = item.m_spec.find(spec => spec.m_lable === label);
            return spec.m_value;
          }),
          borderColor: "rgba(75, 192, 192, 1)",
          background: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Trend of ${label}`,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.formattedValue}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            callback: function (value, index, values) {
              if (index === 0 || index === values.length - 1) {
                return this.getLabelForValue(value);
              }
              return null;
            }
          },
        },
      },
    };

    return (
      <div key={labelId} className="card cardss">
        <div className="card-body">
          <h5 className="card-title">{label} ({mspecs.find(item => item._id === labelId)?.m_unit})</h5>
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /> &emsp;
        <label>End Date: </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="row">
        {mspecs.map(spec => createChart(spec.m_lable, spec._id))}
      </div>
    </div>
  );
};

export default TrendGraph;
