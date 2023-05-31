import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

const CardStatusGraph = ({ data }) => {

    console.log(data);
    const [datasets, setDatasets] = useState([
        {
            label: "Late",
            backgroundColor: "rgba(54, 162, 235)",
            data: [30],
            grouped:false,
            stack: '1'
        },
        {
            label: "OK",
            backgroundColor: "rgba(75, 192, 192)",
            data: [10],
            grouped: false,
            stack: '1'
        },
        {
            label: "Total",
            backgroundColor: "rgba(255, 99, 132)",
            data: [50],
            grouped:false
        }
    ])

    const [chartData, setChartData] = useState({
        labels: ["31-05-2023"],
        datasets: datasets
    });

    useEffect(() => {
        // console.log(data);
        // dailyStatusDataLinewise.map((dat=>{

        // }))
        
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                // stacked: true
            },
            y: {
                // stacked: true,
                beginAtZero: false,
                // max: 100,
                ticks: {
                    callback: (value) => `${value}`
                }
            }
        },
        plugins: {
            legend: {
                position: "right",
                align: "end",
                labels: {
                    boxWidth: 12,
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <div style={{ height: "100%" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default CardStatusGraph;