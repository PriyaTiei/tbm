import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import Select from "react-select";
import {
    filterLine,
    filterMainLine,
    filterSubLine,
} from "./redux/filter/filterActions";

const totalCountPlugin = {
    id: "totalCountPlugin",
    afterDatasetsDraw(chart) {
        if (!chart.options?.plugins?.totalCount?.display) return;
        const { ctx, data } = chart;
        const metaCompleted = chart.getDatasetMeta(0);
        const metaPending = chart.getDatasetMeta(1);
        if (!metaCompleted || !metaCompleted.data) return;

        ctx.save();
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        metaCompleted.data.forEach((bar, index) => {
            const completedVal = Number(data.datasets[0]?.data[index]) || 0;
            const pendingVal = Number(data.datasets[1]?.data[index]) || 0;
            const total = completedVal + pendingVal;

            if (total > 0) {
                let topY = bar.y;
                let x = bar.x;
                if (pendingVal > 0 && metaPending?.data && metaPending.data[index]) {
                    topY = metaPending.data[index].y;
                    x = metaPending.data[index].x;
                } else if (completedVal > 0) {
                    topY = bar.y;
                    x = bar.x;
                }
                ctx.fillText(String(total), x, topY - 4);
            }
        });
        ctx.restore();
    }
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    totalCountPlugin
);

const getCurrentMonthYear = (d) => {
    const baseDate = d ? new Date(d) : new Date();
    const validDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const convertDate = (inputDate) => {
    if (!inputDate) return "";
    const [year, month] = inputDate.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 14, 0).toString();
    return formattedDate;
};

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "36px",
        height: "36px",
        fontSize: "13px",
        borderRadius: "8px",
        borderColor: state.isFocused ? "#0d6efd" : "#cbd5e1",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(13, 110, 253, 0.15)" : "none",
        "&:hover": {
            borderColor: "#94a3b8"
        },
        minWidth: "150px",
        backgroundColor: "#ffffff"
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 8px"
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "4px"
    }),
    menu: (base) => ({
        ...base,
        fontSize: "13px",
        zIndex: 9999,
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
    })
};

const formatMatrixValue = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "00";
    const num = Number(val);
    if (isNaN(num) || num === 0) return "00";
    return String(num);
};

const MultiLevelXAxisBarChart = ({ showModal, setShowModal, chkDate }) => {
    const [firstMondayCurrent, setFirstMondayCurrent] = useState(null);
    const [firstMondayNext, setFirstMondayNext] = useState(null);
    const [daysDifference, setDaysDifference] = useState(null);
    const [daysInMonth, setDaysInMonth] = useState(null);
    const [monthName, setMonthName] = useState("");
    const [monthNumber, setMonthNumber] = useState("");
    const [year, setYear] = useState();
    const dispatch = useDispatch();
    const { reportChartdata } = useSelector(state => state?.report);
    const { machineData } = useSelector((state) => state.machines);
    const filters = useSelector(state => state?.filters);
    const { pS, line } = filters || {};
    const [chartData, setChartData] = useState([]);
    const [datas, setDatas] = useState([]);
    const [optionss, setOptionss] = useState([]);
    const [labelss, setlabelss] = useState([]);
    const [pendings, setPending] = useState([]);
    const [cpendings, setCPending] = useState([]);

    const exportToExcel = () => {
        const completed = datas?.datasets?.[0]?.data || [];
        const pending = datas?.datasets?.[1]?.data || [];

        const exportData = labelss.map((label, index) => ({
            Day: label.replace(/\n/g, " "),
            Completed: completed[index] || 0,
            Pending: pending[index] || 0,
            CumulativePending: cpendings[index] || 0,
            Total: (completed[index] || 0) + (pending[index] || 0)
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Monthly Report"
        );

        XLSX.writeFile(
            workbook,
            `Monthly_Report_${monthName}_${year}.xlsx`
        );
    };

    const [monthYear, setMonthYear] = useState(() => getCurrentMonthYear(chkDate));
    const [monthYearS, setMonthYearS] = useState(() => convertDate(getCurrentMonthYear(chkDate)));
    const [selectLineRef, setSelectLineRef] = useState("test");

    useEffect(() => {
        if (chkDate) {
            const formatted = getCurrentMonthYear(chkDate);
            setMonthYear(formatted);
            setMonthYearS(convertDate(formatted));
        }
    }, [chkDate]);

    const getLineGroup = (line) => {
        if (!line) return "Other Lines";
        const lower = String(line).toLowerCase();
        if (lower.includes("assembly")) return "Assembly";
        if (
            lower.includes("block") ||
            lower.includes("crank") ||
            lower.includes("head") ||
            lower.includes("cam")
        ) {
            return "Machining";
        }
        return "Other Lines";
    };

    const allDiscoveredLinesRef = useRef(new Set());
    const prevDeptRef = useRef(pS);

    if (prevDeptRef.current !== pS) {
        prevDeptRef.current = pS;
        allDiscoveredLinesRef.current.clear();
    }

    if (machineData && machineData.machineData !== undefined) {
        machineData.machineData.forEach((element) => {
            if (!element || !element.line) return;
            allDiscoveredLinesRef.current.add(element.line);
        });
    }

    const groupedLines = {};
    const uniqueGroups = new Set();
    const allSubLines = new Set();

    allDiscoveredLinesRef.current.forEach((lineName) => {
        const group = getLineGroup(lineName);
        uniqueGroups.add(group);
        if (!groupedLines[group]) {
            groupedLines[group] = new Set();
        }
        groupedLines[group].add(lineName);
        allSubLines.add(lineName);
    });

    const preferredOrder = ["Assembly", "Machining"];
    const otherGroups = Array.from(uniqueGroups).filter(
        (g) => !preferredOrder.includes(g)
    );
    const sortedGroupNames = [
        ...preferredOrder.filter((g) => uniqueGroups.has(g)),
        ...otherGroups,
    ];

    var lineOptions = [{ value: null, label: "All Lines" }];
    sortedGroupNames.forEach((groupName) => {
        lineOptions.push({
            value: groupName,
            label: groupName,
        });
    });

    const selectedMainLine = filters?.mainLine ?? null;
    let subLineOptions = [];

    if (selectedMainLine && groupedLines[selectedMainLine]) {
        subLineOptions = [
            { value: null, label: `All ${selectedMainLine} Sub-lines` },
            ...Array.from(groupedLines[selectedMainLine]).sort().map((subLine) => ({
                value: subLine,
                label: subLine,
            })),
        ];
    } else {
        const groupedCategoryOptions = sortedGroupNames
            .map((groupName) => ({
                label: groupName,
                options: Array.from(groupedLines[groupName] || [])
                    .sort()
                    .map((subLine) => ({
                        value: subLine,
                        label: subLine,
                    })),
            }))
            .filter((group) => group.options.length > 0);

        subLineOptions = [
            { value: null, label: "All Sub-lines" },
            ...groupedCategoryOptions,
        ];
    }

    const selectLineHandler = (e) => {
        const val = e ? e.value : null;
        dispatch(filterMainLine(val));
        setSelectLineRef(val);
    };

    const selectSubLineHandler = (e) => {
        const val = e ? e.value : null;
        dispatch(filterSubLine(val));
        setSelectLineRef(val);
    };

    const selectedMainLineOption =
        lineOptions.find((opt) => opt.value === selectedMainLine) || lineOptions[0];

    let selectedSubLineOption = null;
    if (filters?.subLine) {
        selectedSubLineOption = { value: filters.subLine, label: filters.subLine };
    } else {
        selectedSubLineOption = {
            value: null,
            label: selectedMainLine ? `All ${selectedMainLine} Sub-lines` : "All Sub-lines",
        };
    }

    const handleMonthYearChange = (e) => {
        const val = e.target.value;
        if (val) {
            const converted = convertDate(val);
            setMonthYearS(converted);
            setMonthYear(val);
        } else {
            const current = getCurrentMonthYear();
            setMonthYearS(convertDate(current));
            setMonthYear(current);
        }
    };

    useEffect(() => {
        const date = new Date(monthYearS ? monthYearS : chkDate);
        const monthNames = date.toLocaleString('default', { month: 'long' });
        setMonthName(monthNames);

        const monthNumbers = date.getMonth();
        setMonthNumber(monthNumbers + 1);

        const years = date.getFullYear();
        setYear(years);
        dispatch(fetchReportData({ year: years, month: monthNumbers + 1, pS: pS, line: line }));

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

    }, [chkDate, showModal, monthYear, selectLineRef, line, dispatch, monthYearS]);

    useEffect(() => {
        setChartData(reportChartdata?.report?.data);
    }, [reportChartdata]);

    useEffect(() => {
        let pends = [];
        let cpends = [];

        function generateLabels(startDate, endDate) {
            let labels = [];
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

        pends = labels?.map(() => 0) || [];
        cpends = labels?.map(() => 0) || [];

        let data = {
            labels: labels,
            datasets: [
                {
                    label: "Completed",
                    data: labels?.map(() => 0),
                    backgroundColor: "rgba(34, 197, 94, 0.9)",
                    borderColor: "#16a34a",
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                    datalabels: {
                        anchor: 'center',
                        align: 'center',
                        color: '#ffffff',
                        font: {
                            weight: 'bold',
                            size: 10
                        },
                        formatter: function (value) {
                            return value > 0 ? value : '';
                        },
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] > 0;
                        }
                    }
                },
                {
                    label: "Pending",
                    data: labels?.map(() => 0),
                    backgroundColor: "rgba(148, 163, 184, 0.75)",
                    borderColor: "#94a3b8",
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                    datalabels: {
                        anchor: 'center',
                        align: 'center',
                        color: '#1e293b',
                        font: {
                            weight: 'bold',
                            size: 10
                        },
                        formatter: function (value) {
                            return value > 0 ? value : '';
                        },
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] > 0;
                        }
                    }
                },
                {
                    label: "Holidays",
                    data: labels?.map(() => 0),
                    backgroundColor: "rgba(186, 230, 253, 0.7)",
                    borderColor: "#7dd3fc",
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                    datalabels: {
                        display: false,
                    }
                }
            ]
        };

        let options = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 15,
                    bottom: 2,
                    left: 2,
                    right: 2
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "rectRounded",
                        boxWidth: 10,
                        boxHeight: 10,
                        padding: 10,
                        font: { size: 11, weight: "600" },
                        color: "#334155"
                    }
                },
                totalCount: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        title: function () {
                            return '';
                        },
                        label: function (tooltipItem) {
                            const labels = tooltipItem.chart.data.labels;
                            const label = labels && labels[tooltipItem.dataIndex] ? labels[tooltipItem.dataIndex] : "";

                            if (label.includes("#")) {
                                return '';
                            }
                            return tooltipItem.label;
                        },
                        footer: function () {
                            return [];
                        }
                    },
                    enabled: false
                },
                datalabels: {
                    font: {
                        weight: 'bold',
                        size: 10
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        font: {
                            size: 10,
                            weight: "500"
                        },
                        color: "#475569",
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
                    grid: {
                        color: "#f1f5f9"
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: "#64748b",
                        callback: function (value) {
                            return value === 0 ? '0' : value;
                        }
                    },
                    stacked: true,
                    beginAtZero: true,
                    grace: '5%'
                }
            }
        };

        const modifyDataAtIndex = (index, newValue) => {
            if (index >= 0 && index < data.datasets[0].data.length) {
                data.datasets[0].data[index] = (data.datasets[0].data[index] || 0) + (newValue || 0);
            }
        };
        const modifyDataHolidayAtIndex = (index, newValue) => {
            if (index >= 0 && index < data.datasets[2].data.length) {
                data.datasets[2].data[index] = (data.datasets[2].data[index] || 0) + (newValue || 0);
            }
        };

        const modifyLabelPending = (index, newLabel) => {
            if (index >= 0 && index < data.datasets[1].data.length) {
                data.datasets[1].data[index] = (data.datasets[1].data[index] || 0) + (newLabel || 0);
            }
        };

        const modifypends = (index, newLabel) => {
            if (index !== undefined && index >= 0 && index < pends.length) {
                const add = Number(newLabel) || 0;
                pends[index] = (Number(pends[index]) || 0) + add;
            }
        };

        const modifycpends = () => {
            for (let i = 0; i < cpends.length; i++) {
                const prev = i === 0 ? 0 : (Number(cpends[i - 1]) || 0);
                const curr = Number(pends[i]) || 0;
                cpends[i] = prev + curr;
            }
        };

        function roundUpToNearest10(value) {
            return Math.ceil(value / 10) * 10;
        }

        if (chartData && Array.isArray(chartData) && firstMondayCurrent) {
            chartData.forEach((ddd) => {
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

                const okCount = parseInt(ddd.okCount ?? 0) || 0;
                const ngCount = parseInt(ddd.ngCount ?? 0) || 0;
                const pendingCount = parseInt(ddd.pendingCount ?? 0) || 0;
                const totalItemCount = parseInt(ddd.totalItemCount ?? 0) || 0;
                const totalOkNgCount = okCount + ngCount;

                if (ddd?.holiday) {
                    const { maxItemCountss } = chartData.reduce(
                        (acc, obj) => {
                            acc.maxItemCountss = Math.max(acc.maxItemCountss, obj.totalItemCount || 0);
                            return acc;
                        },
                        { maxItemCountss: 0 }
                    );

                    const maxCount = maxItemCountss;
                    modifyLabelPending(difference, 0);
                    modifypends(difference, pendingCount);

                    modifyDataHolidayAtIndex(
                        difference,
                        typeof maxCount === "number" && maxCount !== -Infinity && maxCount !== 0
                            ? roundUpToNearest10(maxCount - totalOkNgCount)
                            : 2
                    );
                } else {
                    const pendingForDay = Math.max(0, totalItemCount - totalOkNgCount);
                    modifyLabelPending(difference, pendingForDay);
                    modifypends(difference, pendingForDay);
                }
                modifyDataAtIndex(difference, totalOkNgCount ? totalOkNgCount : 0);
            });

            modifycpends();
        }

        setPending(pends);
        setCPending(cpends);
        setlabelss(labels);
        setDatas(data);
        setOptionss(options);
    }, [chartData, firstMondayCurrent, firstMondayNext, daysInMonth]);

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <Modal
            show={showModal}
            onHide={handleClose}
            dialogClassName="my-modal"
            centered
            size="xl"
        >
            <Modal.Header closeButton className="border-bottom px-4 py-2 bg-white">
                <div className="d-flex flex-wrap align-items-center justify-content-between w-100 pe-3 gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
                            <i className="bi bi-bar-chart-line-fill fs-5"></i>
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold text-dark">
                                Monthly Performance Chart
                            </h5>
                            <small className="text-muted fw-semibold">
                                {monthName} {year}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
                        <div className="d-flex align-items-center bg-light border rounded-3 px-2 py-1 shadow-sm" style={{ height: "34px" }}>
                            <i className="bi bi-calendar3 text-secondary me-2"></i>
                            <input
                                type="month"
                                id="monthYear"
                                name="monthYear"
                                value={monthYear}
                                onChange={handleMonthYearChange}
                                className="form-control form-control-sm border-0 bg-transparent p-0"
                                style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "130px" }}
                            />
                        </div>

                        <button
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-2 rounded-3 px-3 shadow-sm fw-semibold"
                            style={{ height: "34px" }}
                            onClick={exportToExcel}
                        >
                            <i className="bi bi-file-earmark-excel-fill"></i>
                            <span>Download Excel</span>
                        </button>

                        <div style={{ minWidth: "140px" }}>
                            <Select
                                options={lineOptions}
                                value={selectedMainLineOption}
                                onChange={selectLineHandler}
                                isSearchable={true}
                                placeholder="Main Line"
                                styles={customSelectStyles}
                            />
                        </div>

                        <div style={{ minWidth: "150px" }}>
                            <Select
                                options={subLineOptions}
                                value={selectedSubLineOption}
                                onChange={selectSubLineHandler}
                                isSearchable={true}
                                placeholder="Sub Line"
                                styles={customSelectStyles}
                            />
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="bg-light px-3 py-2" style={{ maxHeight: "calc(90vh - 65px)", overflowY: "auto" }}>
                <div className="d-flex flex-column align-items-center w-100">
                    {/* Modern Compact Chart Container - Fits comfortably without scrolling */}
                    <div
                        className="w-100 bg-white rounded-3 border p-2 mb-2 shadow-sm"
                        style={{ borderColor: "#e2e8f0", height: "340px", position: "relative" }}
                    >
                        <Bar data={datas} options={optionss} plugins={[totalCountPlugin]} />
                    </div>

                    {/* Modern Matrix Summary Table */}
                    <div
                        className="w-100 bg-white rounded-3 border shadow-sm overflow-hidden"
                        style={{ borderColor: "#e2e8f0" }}
                    >
                        <div className="table-responsive">
                            <table className="table table-sm table-borderless mb-0" style={{ width: "100%", tableLayout: "fixed" }}>
                                <tbody>
                                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <th
                                            style={{
                                                width: "55px",
                                                backgroundColor: "#f8fafc",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                borderRight: "2px solid #cbd5e1",
                                                color: "#1e293b",
                                                padding: "5px 2px"
                                            }}
                                        >
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">P</span>
                                        </th>
                                        {pendings?.map((dats, index) => {
                                            const isWeekEnd = (index + 1) % 7 === 0;
                                            const formatted = formatMatrixValue(dats);
                                            const isZero = formatted === "00";
                                            return (
                                                <td
                                                    key={index}
                                                    style={{
                                                        fontSize: "11px",
                                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                                        fontWeight: isZero ? 500 : 700,
                                                        color: isZero ? "#94a3b8" : "#0f172a",
                                                        backgroundColor: isWeekEnd ? "#f8fafc" : "#ffffff",
                                                        borderRight: isWeekEnd ? "2px solid #cbd5e1" : "1px solid #f1f5f9",
                                                        textAlign: "center",
                                                        padding: "5px 2px",
                                                        verticalAlign: "middle"
                                                    }}
                                                >
                                                    {formatted}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <th
                                            style={{
                                                width: "55px",
                                                backgroundColor: "#f8fafc",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                borderRight: "2px solid #cbd5e1",
                                                color: "#1e293b",
                                                padding: "5px 2px"
                                            }}
                                        >
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">CP</span>
                                        </th>
                                        {cpendings?.map((dats, index) => {
                                            const isWeekEnd = (index + 1) % 7 === 0;
                                            const formatted = formatMatrixValue(dats);
                                            const isZero = formatted === "00";
                                            return (
                                                <td
                                                    key={index}
                                                    style={{
                                                        fontSize: "11px",
                                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                                        fontWeight: isZero ? 500 : 700,
                                                        color: isZero ? "#94a3b8" : "#0f172a",
                                                        backgroundColor: isWeekEnd ? "#f8fafc" : "#fafafa",
                                                        borderRight: isWeekEnd ? "2px solid #cbd5e1" : "1px solid #f1f5f9",
                                                        textAlign: "center",
                                                        padding: "5px 2px",
                                                        verticalAlign: "middle"
                                                    }}
                                                >
                                                    {formatted}
                                                </td>
                                            );
                                        })}
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
