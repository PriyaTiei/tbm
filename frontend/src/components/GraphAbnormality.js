import React from 'react';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

function GraphAbnormality(props) {
  const labels = props.labels;

  const data = {
    labels: labels,
    datasets: [
      {
        data: props.data,
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)", // Total - Blue
          "rgba(34, 197, 94, 0.85)",  // Complete - Green
          "rgba(245, 158, 11, 0.85)", // Pending - Amber
          "rgba(139, 92, 246, 0.85)"  // Inprogress - Purple
        ],
        borderColor: [
          "#2563eb",
          "#16a34a",
          "#d97706",
          "#7c3aed"
        ],
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1e293b",
        titleFont: { size: 12 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: "600" },
          color: "#475569"
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { size: 11 },
          color: "#64748b"
        }
      }
    }
  };

  return (
    <div style={{ height: "140px", width: "320px" }} className="p-2 bg-white rounded-3 border shadow-sm my-2">    
      <Bar data={data} options={options} />
    </div>
  );
}

export default GraphAbnormality;
