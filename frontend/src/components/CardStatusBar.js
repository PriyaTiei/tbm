import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

const CardStatusGraph = ({ unFilteredData }) => {



    const [data, setData] = useState({})

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        var tempDataSet = [
            {
                label: "OK",
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                background: "rgba(75, 192, 192, 0.8)",
                data: data.okData,
                grouped: false,
                stack: '1'
            },
            {
                label: "NG",
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                background: "rgba(255, 99, 132, 0.8)",
                data: data.ngData,
                grouped: false,
                stack: '1'
            },
            {
                label: "Pending",
                backgroundColor: "rgba(255, 159, 64, 0.8)",
                background: "rgba(255, 159, 64, 0.8)",
                data: data.pendingData,
                grouped: false,
                stack: '1'
            },
            {
                label: "Total",
                backgroundColor: "#3498db",
                background: "#3498db",
                data: data.totalData,
                grouped: false
            }
        ]
        setChartData(({
            datasets: tempDataSet,
            labels: data.dates || []
        }))
    }, [data]);

    useEffect(() => {
        var dates = []
        var ngData = []
        var okData = []
        var totalData = []
        var pendingData = []
        
        if (unFilteredData && typeof unFilteredData === "object") {
            Object.keys(unFilteredData).sort().forEach((val)=>{
                if (unFilteredData[val]) {
                    dates.push(unFilteredData[val].date)
                    totalData.push(unFilteredData[val].total)
                    okData.push(unFilteredData[val].totalOK)
                    ngData.push(unFilteredData[val].totalNG)
                    pendingData.push(unFilteredData[val].totalPending)
                }
            })
        }

        setData({
            dates: dates,
            ngData: ngData,
            okData: okData,
            totalData: totalData,
            pendingData: pendingData
        })
    }, [unFilteredData])

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                // stacked: true
            },
            y: {
                // stacked: true,
                beginAtZero: true,
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