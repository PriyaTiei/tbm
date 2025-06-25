import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Modal from "react-bootstrap/Modal";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportData } from "./redux/reportChart/reportChartActions";
import DatePicker from "react-date-picker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const MultiLevelXAxisBarChart = ({ showModal, setShowModal, chkDate }) => {
    const [firstMondayCurrent, setFirstMondayCurrent] = useState(null);
    const [firstMondayNext, setFirstMondayNext] = useState(null);
    const [daysDifference, setDaysDifference] = useState(null);
    const [daysInMonth, setDaysInMonth] = useState(null);
    const [monthName, setMonthName] = useState("");
    const [monthNumber, setMonthNumber] = useState("");
    const [year, setYear] = useState();
    const dispatch = useDispatch()
    const { reportChartdata } = useSelector(state => state?.report)
    const { pS } = useSelector(state => state?.filters)
    const [chartData, setChartData] = useState([])
    const [datas, setDatas] = useState([])
    const [optionss, setOptionss] = useState([])
    const [labelss, setlabelss] = useState([])
    const [pendings, setPending] = useState([])
    const [cpendings, setCPending] = useState([])
    const [monthYear, setMonthYear] = useState("");
    const [monthYearS, setMonthYearS] = useState("");


    const handleMonthYearChange = (e) => {
        // Define the input date
        function convertDate(inputDate) {

            const [year, month] = inputDate.split('-').map(Number);


            const date = new Date(year, month - 1, 1); // Months are 0-indexed in JavaScript

            const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 14, 0).toString();

            return formattedDate;
        }
        const converted = convertDate(e.target.value)
        setMonthYearS(converted);
        setMonthYear(e.target.value);
    };

    useEffect(() => {
        const date = new Date(monthYearS ? monthYearS : chkDate);
        const monthNames = date.toLocaleString('default', { month: 'long' });
        setMonthName(monthNames);

        const monthNumbers = date.getMonth();
        setMonthNumber(monthNumbers + 1);

        const years = date.getFullYear();
        setYear(years);
        dispatch(fetchReportData({ year: years, month: monthNumbers + 1, pS: pS }))
        function getFirstMonday(year, month) {
            let date = new Date(year, month, 1);
            while (date.getDay() !== 1) {
                date.setDate(date.getDate() + 1);
            }
            date.setDate(date.getDate() + 1);
            return date.toISOString().split("T")[0];
        }

        function daysBetween(date1, date2) {
            const oneDay = 24 * 60 * 60 * 1000;
            return Math.round((new Date(date2) - new Date(date1)) / oneDay);
        }

        function daysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }

        const firstMondayInCurrent = getFirstMonday(years, monthNumbers);
        setFirstMondayCurrent(firstMondayInCurrent);

        const nextMonth = monthNumbers === 11 ? 0 : monthNumbers + 1;
        const nextYear = monthNumbers === 11 ? years + 1 : years;
        const firstMondayInNext = getFirstMonday(nextYear, nextMonth);

        let dateeee = new Date(firstMondayInNext);
        dateeee.setDate(dateeee.getDate() - 1);
        let formattedDate = dateeee.toISOString().split('T')[0];
        setFirstMondayNext(formattedDate);

        const daysDiff = daysBetween(firstMondayInCurrent, firstMondayInNext);
        setDaysDifference(daysDiff);

        const daysInCurrentMonth = daysInMonth(monthNumbers, years);
        setDaysInMonth(daysInCurrentMonth);

    }, [chkDate, showModal, monthYear]);


    useEffect(() => {
        setChartData(reportChartdata?.report?.data)
    }, [reportChartdata])




    useEffect(() => {
        let pends = [];
        let cpends = [];

        function generateLabels(startDate, endDate) {
            let labels = []
            const start = new Date(startDate);
            const end = new Date(endDate);

            const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
            let currentDay = start;
            let weekNumber = 1;

            function getDayLabel(day) {
                const dayIndex = day.getDay();
                return dayNames[dayIndex === 0 ? 6 : dayIndex - 1];
            }

            while (currentDay <= end) {
                const day = currentDay.getDate();
                const dayLabel = getDayLabel(currentDay);
                let weekLabel = "";
                let endLabel = "";

                if (dayLabel === "Mo" && currentDay.getDate() !== start.getDate()) {
                    weekNumber++;
                }

                if (dayLabel === "Th") {
                    weekLabel = `week${weekNumber++}`;
                }
                if (dayLabel === "Su") {
                    endLabel = `|`;
                }

                labels.push(`${day}\n\n${dayLabel}${weekLabel ? '\n\n' + weekLabel : ''}${endLabel ? '\n\n' + endLabel : ''}`);

                currentDay.setDate(currentDay.getDate() + 1);
            }

            return labels;
        }

        let labels = generateLabels(firstMondayCurrent, firstMondayNext);

        pends = labels?.map(label => {
            return 0;
        })
        cpends = labels?.map(label => {
            return 0;
        })

        let data = {
            labels: labels,
            datasets: [
                {
                    label: "Completed",
                    data: labels?.map(label => {
                        return 0;
                    }),
                    background: (context) => {
                        return "rgb(40, 167, 69)";
                    },
                },
                {
                    label: "Planned",
                    data: labels?.map(label => {
                        return 0;
                    }),
                    background: (context) => {

                        return "rgb(193,193,193)";
                    },
                    datalabels: {
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] !== 0; // Show label only if the value is not 0
                        }
                    }

                },
                {
                    label: "Holidays",
                    data: labels?.map(label => {
                        return 0;
                    }),
                    background: (context) => {
                        return "rgb(180,198,231)"
                    },
                    datalabels: {
                        display: false, // Disable data labels for "Pending"
                    },

                }


            ]
        };



        let options = {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function () {
                            return ''; // No title
                        },
                        label: function (tooltipItem) {
                            const labels = tooltipItem.chart.data.labels;
                            const label = labels && labels[tooltipItem.dataIndex] ? labels[tooltipItem.dataIndex] : "";

                            // Hide tooltip for weekends
                            if (label.includes("#")) {
                                return ''; // Return empty string to hide tooltip
                            }

                            // Return the default label otherwise
                            return tooltipItem.label;
                        },
                        footer: function () {
                            // Optionally, you can hide the footer as well
                            return [];
                        }
                    },
                    // Prevent tooltip from showing
                    enabled: false
                },
                datalabels: {
                    align: 'end',
                    anchor: 'end',
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            if (typeof label === "string") {
                                return label.split("\n");
                            }
                            return label;
                        },
                        minRotation: 0,
                        maxRotation: 0
                    },
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value === 0 ? '0' : value;
                        }
                    }
                }
            }
        };

        const modifyDataAtIndex = (index, newValue) => {
            data.datasets[0].data[index] = newValue;
        };
        const modifyDataHolidayAtIndex = (index, newValue) => {
            data.datasets[2].data[index] = newValue;
        };

        const modifyLabelPending = (index, newLabel) => {
            data.datasets[1].data[index] = newLabel;
        };

        const modifypends = (index, newLabel) => {
            pends[index] = newLabel;
        };
        const modifycpends = () => {
            for (let i = 0; i < cpends.length; i++) {
                cpends[i] = (i === 0) ? pends[i] : cpends[i - 1] + pends[i];
            }
        };


        function roundUpToNearest10(value) {
            return Math.ceil(value / 10) * 10;
        }

        if (chartData) {

            chartData.map((ddd, index) => {
                // Extract and parse date parts
                let dateParts = ddd.entryFor?.split('-');
                let day = parseInt(dateParts && dateParts[2]);

                let firstParts = firstMondayCurrent.split('-');
                let difference;
                let newDate;

                let firstday = parseInt(firstParts[2]);
                if (parseInt(firstParts[1]) === parseInt(dateParts && dateParts[1])) {
                    difference = day - firstday;
                } else {
                    newDate = daysInMonth + day;
                    difference = newDate - firstday;
                }

                // Handle undefined or null values
                const okCount = parseInt(ddd.okCount ?? 0); // Ensuring it's a number
                const ngCount = parseInt(ddd.ngCount ?? 0); // Ensuring it's a number
                const pendingCount = parseInt(ddd.pendingCount ?? 0);
                const totalItemCount = parseInt(ddd.totalItemCount ?? 0);
                const cumPendingCount = parseInt(ddd.cumPendingCount ?? 0);

                const totalOkNgCount = okCount + ngCount;



                if (ddd?.holiday) {
                    // modifyLabelAtIndex(difference, labels[difference]?.split('\n').slice(0, 2).join('\n') + '#\n' + labels[difference].split('\n').slice(2).join('\n'))
                    const { maxOkCountss, maxOkCountPending, maxNgCountss, maxItemCountss } = chartData.reduce(
                        (acc, obj) => {
                            acc.maxOkCountss = Math.max(acc.maxOkCountss, obj.okCount);
                            acc.maxOkCountPending = Math.max(acc.maxOkCountPending, obj.pendingCount);
                            acc.maxNgCountss = Math.max(acc.maxNgCountss, obj.ngCount);
                            acc.maxItemCountss = Math.max(acc.maxItemCountss, obj.totalItemCount);
                            return acc;
                        },
                        { maxOkCountss: 0, maxOkCountPending: 0, maxNgCountss: 0, maxItemCountss: 0 }
                    );


                    const maxCount = maxItemCountss

                    modifyLabelPending(difference, 0)

                    modifypends(difference, pendingCount)
                    modifycpends(difference, cumPendingCount)

                    modifyDataHolidayAtIndex(
                        difference,
                        typeof maxCount === "number" && maxCount != -Infinity && maxCount != 0
                            ? roundUpToNearest10(maxCount - totalOkNgCount)
                            : 2
                    );


                } else {
                    modifyLabelPending(difference, totalItemCount)
                    // modifyDataAtIndex(difference, ddd.okCount + ddd.ngCount);
                    modifypends(difference, totalItemCount - (okCount + ngCount))
                    console.log(pends)
                    modifycpends(difference, ddd.cumPendingCount)
                }
                // Remove other logic for focus on summing
                modifyDataAtIndex(difference, totalOkNgCount ? totalOkNgCount : 0);

                return {
                    ...ddd,
                    difference
                };
            });

        }



        setPending(pends)
        setCPending(cpends)
        setlabelss(labels);
        setDatas(data);
        setOptionss(options);
    }, [chartData])



    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <Modal
            show={showModal}
            onHide={handleClose}
            dialogClassName="my-modal"
            // contentClassName="modal-height"
            style={{ height: "100%!important" }}
        >
            <Modal.Header closeButton style={{ display: "flex", justifyContent: 'space-between', width: '100%' }}>
                <Modal.Title>
                    Monthly Chart ({monthName}-{year})
                </Modal.Title>

                <div style={{ marginLeft: 'auto' }}>
                    <input
                        type="month"
                        id="monthYear"
                        name="monthYear"
                        value={monthYear}
                        onChange={handleMonthYearChange}
                    />
                </div>
            </Modal.Header>


            <Modal.Body

            >
                <div
                    style={{ width: "100%", overflowY: "scroll" }}
                    className="d-flex justify-content-center align-item-center "
                    onClick={handleClose}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "70vw" }}>
                        <div style={{ width: "100%" }}>

                            <Bar data={datas} options={optionss} />
                        </div>
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table className="table table-bordered" style={{ width: "100%", tableLayout: "fixed" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontSize: 11 }}>{"P"}</td>
                                        {pendings?.map((dats, index) => (
                                            <td
                                                key={index}
                                                style={{
                                                    fontSize: 11, // Adjust as needed
                                                    borderRight: (index + 1) % 7 === 0 ? "2px solid black" : "none",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {String(dats).padStart(2, "0")}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: 11 }}>CP</td>
                                        {cpendings?.map((dats, index) => (
                                            <td
                                                key={index}
                                                style={{
                                                    fontSize: 11, // Adjust as needed
                                                    borderRight: (index + 1) % 7 === 0 ? "2px solid black" : "none",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {String(dats).padStart(2, "0")}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
    );
};

export default MultiLevelXAxisBarChart;
