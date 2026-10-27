import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verification = ({ showModals, setShowModals }) => {
    const [show, setShow] = useState(false);
    const [comment, setComment] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [comman, setCommon] = useState([]);
    const [tblData, setTblData] = useState([]);
    const [activeList, setActiveList] = useState("toBeApproved");

    const handleCloses = () => setShow(false);
    const auth = useSelector((state) => state.auth);
    const level = auth.user ? auth.user.level : 0;
    const filters = useSelector((state) => state.filters);

    const handleNavigate = (date) => {
        localStorage.setItem("changedDate", date);
    };

    const handlePages = (page) => {
        localStorage.setItem("changedPage", page);
    };

    const fetchCommonData = () => {
        if (filters.rS == null) {
            axios
                .get(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/getVerifyItems?ps=${filters.pS}`
                )
                .then((result) => {
                    setCommon(result?.data?.dailyItemsWithGlTlVerify || []);
                })
                .catch((err) => {
                    toast.error(`${err.message}`);
                });
        }
    };

    const fetchVerificationData = () => {
        if (level >= 20 && level < 30) {
            axios
                .get(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/tlVerifyItems?ps=${filters.pS}`
                )
                .then((result) => {
                    const extractedData = (result?.data?.tlList || []).map(entry => {
                        const item = entry.item[0] || {};
                        return {
                            _id: entry._id,
                            line: item.line,
                            processNo: item.processNo,
                            workDetail: item.workDetail,
                            m_spec: entry.dailystatus?.m_spec || [],
                            remarks: entry.dailystatus?.remarks,
                            entryFor: entry.dailystatus?.entryFor,
                            result: entry.result,
                            pageNo: entry.pageNo
                        };
                    });
                    setTblData(extractedData);
                })
                .catch((err) => {
                    toast.error(`${err.message}`);
                });
        } else if (level === 30) {
            axios
                .get(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/glVerifyItems?ps=${filters.pS}`
                )
                .then((result) => {
                    const extractedData = (result?.data?.glList || []).map(entry => {
                        const item = entry.item[0] || {};
                        return {
                            _id: entry._id,
                            line: item.line,
                            processNo: item.processNo,
                            workDetail: item.workDetail,
                            m_spec: entry.dailystatus?.m_spec || [],
                            remarks: entry.dailystatus?.remarks,
                            entryFor: entry.dailystatus?.entryFor,
                            result: entry.result,
                            pageNo: entry.pageNo
                        };
                    });
                    setTblData(extractedData);
                })
                .catch((err) => {
                    toast.error(`${err.message}`);
                });
        }
    };

    useEffect(() => {
        fetchCommonData();
    }, [filters.rS, filters.pS]);

    useEffect(() => {
        fetchVerificationData();
    }, [level, filters]);

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            const allIds = tblData?.map(row => row._id);
            setSelectedRows(allIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (rowId) => {
        if (selectedRows.includes(rowId)) {
            setSelectedRows(selectedRows.filter((id) => id !== rowId));
        } else {
            setSelectedRows([...selectedRows, rowId]);
        }
    };

    const handleShow = () => {
        if (selectedRows.length > 0) {
            setShow(true);
        } else {
            toast.error(`Select rows`);
        }
    };

    const handleSubmit = () => {
        let data = {
            ids: selectedRows,
            user: auth.user._id,
            comment: comment
        };
        if (level >= 20 && level < 30) {
            axios
                .post(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateTlComment`, data
                )
                .then(() => {
                    fetchVerificationData();
                    toast.success(`Comment Added Successfully`);
                    setSelectedRows([]);
                    setSelectAll(false);
                })
                .catch((err) => {
                    toast.error(`${err.message}`);
                });
        } else if (level === 30) {
            axios
                .post(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateGlComment`, data
                )
                .then(() => {
                    fetchVerificationData();
                    toast.success(`Comment Added Successfully`);
                    setSelectedRows([]);
                    setSelectAll(false);
                })
                .catch((err) => {
                    toast.error(`${err.message}`);
                });
        }

        setShow(false);
        setComment('');
    };

    const approveSelected = () => {
        if (selectedRows.length > 0) {
            let data = {
                ids: selectedRows,
                user: auth.user._id
            };
            if (level >= 20 && level < 30) {
                axios
                    .post(
                        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateTlConfirm`, data
                    )
                    .then(() => {
                        fetchVerificationData();
                        toast.success(`Approved`);
                        setSelectedRows([]);
                        setSelectAll(false);
                    })
                    .catch((err) => {
                        toast.error(`${err.message}`);
                    });
            } else if (level === 30) {
                axios
                    .post(
                        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateGlConfirm`, data
                    )
                    .then(() => {
                        fetchVerificationData();
                        toast.success(`Approved`);
                        setSelectedRows([]);
                        setSelectAll(false);
                    })
                    .catch((err) => {
                        toast.error(`${err.message}`);
                    });
            }
        } else {
            toast.error(`Select rows`);
        }
    };

    const getStatusLabel = (data, type) => {
        if (!data || !type) return "";
        const verifyKey = `${type}Verify`;
        const atKey = `${type}At`;
        const commentKey = `${type}Comment`;
        if (data?.checkItem?.[verifyKey]) {
            if (data[atKey]) {
                if (!data[commentKey] || data[commentKey].trim() === "") {
                    return `Approved`;
                } else {
                    return `Commented: ${data[commentKey]}`;
                }
            } else {
                return `Pending`;
            }
        } else {
            return "--";
        }
    };

    const renderVerificationBadge = (label) => {
        if (!label || label === "--") return <span className="text-muted small">--</span>;
        if (label === "Approved") {
            return (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
                    <i className="bi bi-check2"></i> Approved
                </span>
            );
        }
        if (label === "Pending") {
            return (
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
                    <i className="bi bi-hourglass-split"></i> Pending
                </span>
            );
        }
        if (label.startsWith("Commented:")) {
            return (
                <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fw-semibold text-truncate d-inline-flex align-items-center gap-1" style={{ maxWidth: "160px" }} title={label}>
                    <i className="bi bi-chat-text"></i> {label}
                </span>
            );
        }
        return <span className="badge bg-light text-dark border">{label}</span>;
    };

    return (
        <div className="container-fluid px-3 px-md-4 py-3" style={{ minHeight: "85vh" }}>
            {/* Top Toolbar: Tabs and Actions */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
                <div className="d-inline-flex p-1 bg-light rounded-pill border shadow-sm">
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 transition-all ${
                            activeList === "toBeApproved"
                                ? "btn-primary shadow-sm"
                                : "btn-light text-secondary border-0"
                        }`}
                        onClick={() => setActiveList("toBeApproved")}
                    >
                        <i className="bi bi-clock-history"></i>
                        <span>To Be Approved List</span>
                        {tblData?.length > 0 && (
                            <span className={`badge rounded-pill ${activeList === "toBeApproved" ? "bg-white text-primary" : "bg-primary text-white"}`}>
                                {tblData.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 transition-all ${
                            activeList === "general"
                                ? "btn-primary shadow-sm"
                                : "btn-light text-secondary border-0"
                        }`}
                        onClick={() => setActiveList("general")}
                    >
                        <i className="bi bi-card-checklist"></i>
                        <span>General List</span>
                        {comman?.length > 0 && (
                            <span className={`badge rounded-pill ${activeList === "general" ? "bg-white text-primary" : "bg-secondary text-white"}`}>
                                {comman.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeList === "toBeApproved" && (
                    <div className="d-flex align-items-center gap-2">
                        {selectedRows.length > 0 && (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-medium">
                                {selectedRows.length} selected
                            </span>
                        )}
                        <button
                            className="btn btn-sm btn-success rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                            onClick={approveSelected}
                        >
                            <i className="bi bi-check2-circle fs-6"></i>
                            <span>Approve Selected</span>
                        </button>
                        <button
                            onClick={handleShow}
                            className="btn btn-sm btn-danger rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        >
                            <i className="bi bi-chat-left-dots fs-6"></i>
                            <span>Comment Selected</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Header Title Section */}
            <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <i className="bi bi-shield-check text-primary"></i>
                            {activeList === "toBeApproved" ? "Completion Verification" : "General Verification Records"}
                        </h4>
                        <p className="text-muted small mb-0">
                            {activeList === "toBeApproved"
                                ? "Verification required from you before completing work orders."
                                : "Historical overview of daily status verification across all lines."}
                        </p>
                    </div>
                    <div>
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-person-badge text-primary me-1"></i>
                            Role: {level >= 20 && level < 30 ? "Team Leader (TL)" : level === 30 ? "Group Leader (GL)" : "Member / Viewer"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {activeList === "toBeApproved" ? (
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4">
                    <div className="table-responsive" style={{ maxHeight: "72vh" }}>
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                            <thead className="table-light text-uppercase sticky-top" style={{ fontSize: "11px", letterSpacing: "0.5px", zIndex: 1 }}>
                                <tr>
                                    <th scope="col" style={{ width: "40px", textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th scope="col" style={{ width: "45px", textAlign: "center" }}>#</th>
                                    <th scope="col">Line</th>
                                    <th scope="col">Station</th>
                                    <th scope="col" style={{ minWidth: "160px" }}>Inspection Item</th>
                                    <th scope="col">Measurement</th>
                                    <th scope="col">Standard Value</th>
                                    <th scope="col">Actual Value</th>
                                    <th scope="col" style={{ minWidth: "95px" }}>Date</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Status</th>
                                    <th scope="col" style={{ minWidth: "140px" }}>Remarks</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tblData.length > 0 ? (
                                    tblData.map((items, i) => {
                                        const isSelected = selectedRows.includes(items?._id);
                                        return (
                                            <tr
                                                key={items?._id || i}
                                                className={isSelected ? "table-primary" : ""}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); handleSelectRow(items?._id); }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(items?._id)}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                </td>
                                                <td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>{i + 1}</td>
                                                <td className="fw-semibold text-dark">{items?.line}</td>
                                                <td>
                                                    <span className="badge bg-light text-secondary border">{items?.processNo}</span>
                                                </td>
                                                <td className="fw-medium text-dark">{items?.workDetail}</td>
                                                <td>
                                                    {items.m_spec?.length > 0 ? (
                                                        items.m_spec.map((item, index) => (
                                                            <div key={index} className="text-secondary small">
                                                                {item.m_lable ? item.m_lable : ""}
                                                                {item.m_unit ? ` (${item.m_unit})` : ""}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted">--</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {items.m_spec?.length > 0 ? (
                                                        items.m_spec.map((item, index) => (
                                                            <div key={index} className="fw-bold small text-dark">
                                                                {item.m_criteria ? item.m_criteria : "--"}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted">--</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {items.m_spec?.length > 0 ? (
                                                        items.m_spec.map((item, index) => (
                                                            <div key={index} className="fw-bold small text-primary">
                                                                {item.m_value !== undefined && item.m_value !== null ? item.m_value : 0}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted">0</span>
                                                    )}
                                                </td>
                                                <td className="text-nowrap text-secondary font-monospace" style={{ fontSize: "11px" }}>
                                                    {items?.entryFor}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {items?.result === "NG" ? (
                                                        <span className="badge bg-danger text-white px-2 py-1 shadow-sm d-inline-flex align-items-center gap-1">
                                                            <i className="bi bi-exclamation-triangle-fill"></i> NG
                                                        </span>
                                                    ) : items?.result === "OK" ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
                                                            <i className="bi bi-check-circle-fill"></i> OK
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-light text-dark border">
                                                            {items?.result || "--"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="small text-muted" style={{ maxWidth: "180px", wordBreak: "break-word" }}>
                                                    {items?.remarks || "--"}
                                                </td>
                                                <td style={{ textAlign: "center" }} onClick={() => { handleNavigate(items?.entryFor); handlePages(items.pageNo); }}>
                                                    <Link
                                                        to={`/checkList?line=${encodeURIComponent(items?.line || "")}&processNo=${encodeURIComponent(items?.processNo || "")}`}
                                                        className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-semibold text-nowrap d-inline-flex align-items-center gap-1 shadow-sm"
                                                        style={{ fontSize: "11px", textDecoration: "none" }}
                                                    >
                                                        <i className="bi bi-box-arrow-up-right"></i>
                                                        <span>Card</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="text-center py-5">
                                            <div className="py-4">
                                                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: 64, height: 64 }}>
                                                    <i className="bi bi-check2-circle fs-1"></i>
                                                </div>
                                                <h5 className="fw-bold text-dark mb-1">All Caught Up!</h5>
                                                <p className="text-muted small mb-0">No completion verification items currently require your action.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* General List Table */
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4">
                    <div className="table-responsive" style={{ maxHeight: "72vh" }}>
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                            <thead className="table-light text-uppercase sticky-top" style={{ fontSize: "11px", letterSpacing: "0.5px", zIndex: 1 }}>
                                <tr>
                                    <th scope="col" style={{ width: "45px", textAlign: "center" }}>#</th>
                                    <th scope="col">Line</th>
                                    <th scope="col">Station</th>
                                    <th scope="col" style={{ minWidth: "160px" }}>Inspection Item</th>
                                    <th scope="col">Measurement</th>
                                    <th scope="col">Standard Value</th>
                                    <th scope="col">Actual Value</th>
                                    <th scope="col" style={{ minWidth: "95px" }}>Date</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Status</th>
                                    <th scope="col" style={{ minWidth: "140px" }}>Remarks</th>
                                    <th scope="col" style={{ textAlign: "center" }}>TL Status</th>
                                    <th scope="col" style={{ textAlign: "center" }}>GL Status</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comman.length > 0 ? (
                                    comman.map((items, i) => (
                                        <tr key={items?._id || i}>
                                            <td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>{i + 1}</td>
                                            <td className="fw-semibold text-dark">{items?.checkItem?.line}</td>
                                            <td>
                                                <span className="badge bg-light text-secondary border">{items?.checkItem?.processNo}</span>
                                            </td>
                                            <td className="fw-medium text-dark">{items?.checkItem?.workDetail}</td>
                                            <td>
                                                {items.m_spec?.length > 0 ? (
                                                    items.m_spec.map((item, index) => (
                                                        <div key={index} className="text-secondary small">
                                                            {item.m_lable ? item.m_lable : ""}
                                                            {item.m_unit ? ` (${item.m_unit})` : ""}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">--</span>
                                                )}
                                            </td>
                                            <td>
                                                {items.m_spec?.length > 0 ? (
                                                    items.m_spec.map((item, index) => (
                                                        <div key={index} className="fw-bold small text-dark">
                                                            {item.m_criteria ? item.m_criteria : "--"}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">--</span>
                                                )}
                                            </td>
                                            <td>
                                                {items.m_spec?.length > 0 ? (
                                                    items.m_spec.map((item, index) => (
                                                        <div key={index} className="fw-bold small text-primary">
                                                            {item.m_value !== undefined && item.m_value !== null ? item.m_value : 0}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">0</span>
                                                )}
                                            </td>
                                            <td className="text-nowrap text-secondary font-monospace" style={{ fontSize: "11px" }}>
                                                {items?.entryFor}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {items?.result === "NG" ? (
                                                    <span className="badge bg-danger text-white px-2 py-1 shadow-sm d-inline-flex align-items-center gap-1">
                                                        <i className="bi bi-exclamation-triangle-fill"></i> NG
                                                    </span>
                                                ) : items?.result === "OK" ? (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
                                                        <i className="bi bi-check-circle-fill"></i> OK
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-light text-dark border">
                                                        {items?.result || "--"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="small text-muted" style={{ maxWidth: "180px", wordBreak: "break-word" }}>
                                                {items?.remarks || "--"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {renderVerificationBadge(getStatusLabel(items, "tl"))}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {renderVerificationBadge(getStatusLabel(items, "gl"))}
                                            </td>
                                            <td style={{ textAlign: "center" }} onClick={() => { handleNavigate(items?.entryFor); handlePages(items.pageNo); }}>
                                                <Link
                                                    to={`/checkList?line=${encodeURIComponent(items?.checkItem?.line || "")}&processNo=${encodeURIComponent(items?.checkItem?.processNo || "")}`}
                                                    className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-semibold text-nowrap d-inline-flex align-items-center gap-1 shadow-sm"
                                                    style={{ fontSize: "11px", textDecoration: "none" }}
                                                >
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                    <span>Card</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="text-center py-5">
                                            <div className="py-4">
                                                <div className="d-inline-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary rounded-circle mb-3" style={{ width: 64, height: 64 }}>
                                                    <i className="bi bi-inbox fs-1"></i>
                                                </div>
                                                <h5 className="fw-bold text-dark mb-1">No Verification Records</h5>
                                                <p className="text-muted small mb-0">No historical verification items found for the current department filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            <Modal show={show} onHide={handleCloses} centered>
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-chat-left-dots text-danger"></i>
                        Add Verification Comment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formComment">
                        <Form.Label className="fw-semibold small text-dark">
                            Feedback / Comment for Selected Items ({selectedRows.length})
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter your verification comment or action items..."
                            className="form-control rounded-3"
                            style={{ fontSize: "13px" }}
                        />
                        <Form.Text className="text-muted">
                            This comment will be recorded and attached to the selected verification items.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top py-2">
                    <Button variant="light" className="rounded-pill px-3 border" onClick={handleCloses}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="rounded-pill px-4 fw-semibold" onClick={handleSubmit}>
                        Submit Comment
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Verification;
