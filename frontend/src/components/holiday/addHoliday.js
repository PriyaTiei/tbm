import React, { useEffect, useRef, useState, useMemo } from 'react';
import Card from 'react-bootstrap/Card';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from "react-date-picker";
import { Button, FloatingLabel, Form, Table } from 'react-bootstrap';
import "./addHoliday.css";
import { createData, deleteData, fetchData, fetchSingleData, updateData } from '../../redux/holiday/holidayActions';
import { toast } from 'react-toastify';
import axios from 'axios';

export const AddHoliday = () => {
  const auth = useSelector((state) => state.auth);
  const users = auth.user ? auth.user : "";
  const [toDate, setToDate] = useState(new Date(Date.now()));
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [natureFilter, setNatureFilter] = useState("all");
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const [hdata, setHdata] = useState({
    date: new Date(Date.now()),
    reason: "",
    adhoc: "",
    user: users?._id
  });
  const [errors, setErrors] = useState({});
  const [cards, setCards] = useState("empty");
  const { holidaydata, holidaySingledata } = useSelector((state) => state.holiday);
  const [complete, setComplete] = useState([]);
  const [selected, setSelected] = useState();

  useEffect(() => {
    if (toDate && !isNaN(toDate.getTime())) {
      const year = toDate.getFullYear();
      const month = String(toDate.getMonth() + 1).padStart(2, '0');
      const day = String(toDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}/${month}/${day}`;
      setHdata((prev) => ({ ...prev, date: formattedDate }));
    }
  }, [toDate]);

  const handleAutoGenerateClick = () => {
    setShowInput(true);
  };

  const handleSubmitClick = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a valid year");
      return;
    }
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/holidays/prepopulate`,
        { year: inputValue }
      )
      .then((result) => {
        if (result.data.success) {
          toast.success("Holidays auto-generated successfully");
          setShowInput(false);
          setInputValue("");
          dispatch(fetchData());
        }
      })
      .catch((err) => {
        setShowInput(false);
        setInputValue("");
        toast.error(`Data could not be saved, ${err.message}`);
      });
  };

  useEffect(() => {
    if (holidaydata?.holidays) {
      setComplete(holidaydata?.holidays);
    }
  }, [holidaydata]);

  useEffect(() => {
    if (holidaySingledata && holidaySingledata?.holiday) {
      setHdata(holidaySingledata?.holiday);
      const dateString = holidaySingledata?.holiday?.date;
      if (dateString) {
        const dateOnly = String(dateString).split("T")[0];
        const formattedDate = new Date(dateOnly);
        if (!isNaN(formattedDate.getTime())) {
          setToDate(formattedDate);
        }
      }
    }
  }, [holidaySingledata]);

  const validate = () => {
    let errs = {};
    if (!hdata.date || isNaN(new Date(hdata.date).getTime())) {
      errs.date = "Valid date is required.";
    }
    if (!hdata.reason || !hdata.reason.trim()) {
      errs.reason = "Reason is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      dispatch(createData({ ...hdata, user: users?._id }))
        .then(() => {
          toast.success("Holiday Added successfully");
          dispatch(fetchData());
          handleClear();
        })
        .catch((error) => {
          console.error("Submission failed:", error);
          toast.error(error);
        });
    }
  };

  const handleSave = () => {
    if (validate()) {
      dispatch(updateData(selected, { ...hdata, user: users?._id }))
        .then(() => {
          toast.success("Holiday Updated successfully");
          dispatch(fetchData());
          handleClear();
        })
        .catch((error) => {
          console.error("Submission failed:", error);
          toast.error(error);
        });
    }
  };

  const handleClear = () => {
    setToDate(new Date(Date.now()));
    setHdata({ adhoc: '', reason: '', date: new Date(Date.now()) });
    setCards("empty");
    setErrors({});
  };

  const handleEditClick = (item) => {
    textareaRef.current?.focus();
    dispatch(fetchSingleData(item));
    setSelected(item);
    setCards("edit");
  };

  const handleDeleteClick = (item) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this holiday?");
    if (confirmDelete) {
      dispatch(deleteData(item)).then(() => dispatch(fetchData()));
    }
  };

  const formatDateSafely = (dateVal) => {
    if (!dateVal) return "--";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toISOString().slice(0, 10);
    } catch {
      return String(dateVal);
    }
  };

  // Filtered holiday list based on search query and nature filter
  const filteredHolidays = useMemo(() => {
    if (!complete || !Array.isArray(complete)) return [];
    return complete.filter((item) => {
      const dateStr = formatDateSafely(item?.date);
      const reasonStr = (item?.reason || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery = !query || dateStr.includes(query) || reasonStr.includes(query);

      let matchesNature = true;
      if (natureFilter === "scheduled") {
        matchesNature = !item?.adhoc;
      } else if (natureFilter === "spontaneous") {
        matchesNature = !!item?.adhoc;
      }

      return matchesQuery && matchesNature;
    });
  }, [complete, searchQuery, natureFilter]);

  return (
    <div className="container-fluid px-3 px-md-4 py-3" style={{ minHeight: "85vh" }}>
      {/* Top Header Card */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
            <i className="bi bi-calendar-event fs-5"></i>
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              Holidays List
              <span className="badge bg-light text-primary border fs-6 fw-normal rounded-pill">
                {filteredHolidays.length} / {complete?.length || 0}
              </span>
            </h4>
            <small className="text-muted">
              Organization holidays, scheduled weekends, and factory shutdowns.
            </small>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Quick Search */}
          <div className="d-flex align-items-center bg-white border rounded-pill px-3 py-1 shadow-sm" style={{ height: "36px" }}>
            <i className="bi bi-search text-muted me-2 small"></i>
            <input
              type="text"
              placeholder="Filter by date or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent p-0"
              style={{ fontSize: "13px", outline: "none", width: "160px" }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0 ms-1 border-0"
                onClick={() => setSearchQuery("")}
                title="Clear"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>

          {/* Nature filter pill */}
          <select
            className="form-select form-select-sm border rounded-pill shadow-sm"
            style={{ width: "140px", height: "36px", fontSize: "13px" }}
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="scheduled">Scheduled</option>
            <option value="spontaneous">Spontaneous</option>
          </select>

          {/* Auto Generate */}
          {!showInput ? (
            <button
              className="btn btn-sm btn-outline-warning text-dark border rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ height: "36px" }}
              onClick={handleAutoGenerateClick}
            >
              <i className="bi bi-magic text-warning fs-6"></i>
              <span>Auto Generate</span>
            </button>
          ) : (
            <div className="d-flex align-items-center gap-1 bg-light border p-1 rounded-pill shadow-sm" style={{ height: "36px" }}>
              <input
                type="number"
                placeholder="Year (e.g. 2026)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="form-control form-control-sm border-0 bg-transparent px-2"
                style={{ width: "120px", fontSize: "13px" }}
              />
              <button
                className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold"
                style={{ fontSize: "12px" }}
                onClick={handleSubmitClick}
              >
                Generate
              </button>
              <button
                className="btn btn-sm btn-light border-0 rounded-circle text-muted"
                onClick={() => { setShowInput(false); setInputValue(""); }}
                title="Cancel"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}

          {/* Add Holiday Button */}
          {cards !== 'add' && (
            <button
              className="btn btn-sm btn-warning text-dark rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ height: "36px" }}
              onClick={() => setCards("add")}
            >
              <i className="bi bi-plus-lg fs-6"></i>
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form Card */}
      {(cards === 'add' || cards === 'edit') && (
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-8 col-lg-6">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${cards === 'add' ? 'bi-calendar-plus text-primary' : 'bi-pencil-square text-warning'} fs-5`}></i>
                  <h6 className="mb-0 fw-bold text-dark">
                    {cards === 'add' ? "Add New Holiday" : "Edit Holiday Record"}
                  </h6>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClear}
                  aria-label="Close"
                ></button>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small mb-1">Holiday Date</label>
                  <div className="border rounded-3 p-2 bg-light">
                    <DatePicker
                      format="dd/MM/yyyy"
                      className="w-100 border-0"
                      value={toDate}
                      onChange={setToDate}
                      clearIcon={null}
                    />
                  </div>
                  {errors.date && <small className="text-danger mt-1 d-block">{errors.date}</small>}
                </div>

                <div className="mb-3">
                  <FloatingLabel controlId="floatingSelect" label="Ad Hoc Holiday Nature">
                    <Form.Select
                      aria-label="Ad Hoc Holiday Nature"
                      className="rounded-3"
                      value={hdata?.adhoc}
                      onChange={(e) => setHdata({ ...hdata, adhoc: e.target.value })}
                    >
                      <option value="">Please select nature</option>
                      <option value="false">Scheduled (Standard Weekend/Holiday)</option>
                      <option value="true">Spontaneous (Unplanned / Emergency)</option>
                    </Form.Select>
                  </FloatingLabel>
                  {errors.adhoc && <small className="text-danger mt-1 d-block">{errors.adhoc}</small>}
                </div>

                <div className="mb-4">
                  <FloatingLabel controlId="floatingTextarea2" label="Reason for Holiday">
                    <Form.Control
                      as="textarea"
                      placeholder="Enter holiday reason"
                      style={{ height: '90px' }}
                      className="rounded-3"
                      ref={textareaRef}
                      value={hdata?.reason || ""}
                      onChange={(e) => setHdata({ ...hdata, reason: e.target.value })}
                    />
                  </FloatingLabel>
                  {errors.reason && <small className="text-danger mt-1 d-block">{errors.reason}</small>}
                </div>

                <div className="d-flex align-items-center justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border rounded-pill px-4 py-2 text-secondary fw-semibold"
                    onClick={handleClear}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                    onClick={cards === 'add' ? handleSubmit : handleSave}
                  >
                    {cards === 'add' ? "Save Holiday" : "Update Holiday"}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Holidays Table Card with Internal Scrolling & Sticky Header */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
        <div
          className="holiday-table-wrapper"
          style={{
            maxHeight: "520px",
            overflowY: "auto",
            overflowX: "auto",
            position: "relative"
          }}
        >
          <Table hover className="align-middle mb-0" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th
                  scope="col"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#475569",
                    width: "160px",
                    padding: "12px 16px"
                  }}
                >
                  Date
                </th>
                <th
                  scope="col"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#475569",
                    padding: "12px 16px"
                  }}
                >
                  Reason
                </th>
                <th
                  scope="col"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#475569",
                    width: "180px",
                    textAlign: "center",
                    padding: "12px 16px"
                  }}
                >
                  Adhoc Type
                </th>
                <th
                  scope="col"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#475569",
                    width: "120px",
                    textAlign: "center",
                    padding: "12px 16px"
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.length > 0 ? (
                filteredHolidays.map((item, i) => (
                  <tr key={item?._id || i}>
                    <td className="font-monospace fw-medium text-dark px-3 py-2">
                      <i className="bi bi-calendar3 me-2 text-muted"></i>
                      {formatDateSafely(item?.date)}
                    </td>
                    <td className="fw-semibold text-dark px-3 py-2">
                      {item?.reason || "--"}
                    </td>
                    <td style={{ textAlign: "center" }} className="px-3 py-2">
                      {item.adhoc ? (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-1 rounded-pill fw-semibold">
                          <i className="bi bi-lightning-charge me-1"></i> Spontaneous
                        </span>
                      ) : (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">
                          <i className="bi bi-clock me-1"></i> Scheduled
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }} className="px-3 py-2">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-primary rounded-circle p-1 d-inline-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "30px", height: "30px" }}
                          onClick={() => handleEditClick(item?._id)}
                          title="Edit Holiday"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-danger rounded-circle p-1 d-inline-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "30px", height: "30px" }}
                          onClick={() => handleDeleteClick(item?._id)}
                          title="Delete Holiday"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="py-4">
                      <div className="d-inline-flex align-items-center justify-content-center bg-light text-muted rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-calendar-x fs-2"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">No Holidays Found</h6>
                      <p className="text-muted small mb-0">
                        {searchQuery || natureFilter !== "all"
                          ? "No holidays match your search criteria."
                          : "Use 'Add Holiday' or 'Auto Generate' to populate organization holidays."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};
