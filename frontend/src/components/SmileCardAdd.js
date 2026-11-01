import React, { useEffect, useState } from "react";
// import styles from "./styles/smilecard.module.css";
import axios from "axios";
import "./table.css";
import "./smileCardAdd.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
// import FlavorForm from "./MultipleOptions";
import { Button, Form, Row, Col } from "react-bootstrap";

function SmileCardAdd() {
  const { pS } = useSelector((state) => state.filters);
  const [labelUnits, setLabelUnits] = useState([{ m_lable: "", m_unit: "", m_criteria: "" }]);

  const handleAddLabelUnit = () => {
    setLabelUnits([...labelUnits, { m_lable: "", m_unit: "", m_criteria: "" }]);
  };

  const handleLabelUnitChange = (index, field, value) => {
    const newLabelUnits = [...labelUnits];
    newLabelUnits[index][field] = value;
    setLabelUnits(newLabelUnits);
  };

  const handleRemoveLabelUnit = (index) => {
    const newLabelUnits = labelUnits.filter((_, i) => i !== index);
    setLabelUnits(newLabelUnits);
  };


  const [selectedFile, setSelectedFile] = useState("");

  const selectedFileHandler = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const [actionNew, setActionNew] = useState("");
  const [cardNoNew, setCardNoNew] = useState("");
  const [categoryCtrlNew, setCategoryCtrlNew] = useState("");
  const [commonItemNew, setCommonItemNew] = useState("");
  const [criterionNew, setCriterionNew] = useState("");
  const [cycleNew, setCycleNew] = useState("");
  const [dNew, setDNew] = useState([9999]);
  const [entryDateNew, setEntryDateNew] = useState(new Date(Date.now()));
  const [holidayOperationNew, setHolidayOperationNew] = useState("");
  const [imagesNew, setImagesNew] = useState("");
  const [lineNew, setLineNew] = useState("");
  const [mNew, setMNew] = useState([9999]);
  const [methodWssNoNew, setMethodWssNoNew] = useState("");
  const [modelNew, setModelNew] = useState("");
  const [pSNew, setPSNew] = useState("S");
  const [prepManHrNew, setPrepManHrNew] = useState("");
  const [processNoNew, setProcessNoNew] = useState("");
  const [qualityOnePointNew, setQualityOnePointNew] = useState("");
  const [rSNew, setRSNew] = useState("R");
  const [reasonNew, setReasonNew] = useState("");
  const [remarkNew, setRemarkNew] = useState("");
  const [safetyOnePointNew, setSafetyOnePointNew] = useState("");
  const [toolNew, setToolNew] = useState("");
  const [wNew, setWNew] = useState([9999]);
  const [wHrNew, setWHrNew] = useState("");
  const [workDetailNew, setWorkDetailNew] = useState("");
  const [workManpowerNew, setWorkManpowerNew] = useState("");
  const [tlVerify, setVerifTL] = useState(false);
  const [glVerify, setGlVerify] = useState(false);
  const [workOnePointNew, setWorkOnePointNew] = useState("");
  const [workTimeNew, setWorkTimeNew] = useState("");
  const [yNew, setYNew] = useState([9999]);
  const [groupNew, setGroupNew] = useState("");

  const optionsLine = [
    { value: "Block", label: "Block Line" },
    { value: "Head", label: "Head Line" },
    { value: "Crank", label: "Crank Line" },
    { value: "Assembly", label: "Assembly Line" },
  ];
  // const optionsPS = [
  //   { value: "P", label: "Maintenace dept." },
  //   { value: "S", label: "Production dept." },
  // ];
  const optionsRS = [
    { value: "R", label: "Running Check" },
    { value: "S", label: "Stop Check" },
  ];

  const optionsYear = [
    { value: 9999, label: "Every Year" },
    { value: 2022, label: "2022" },
    { value: 2023, label: "2023" },
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
    { value: 2026, label: "2026" },
    { value: 2027, label: "2027" },
    { value: 2028, label: "2028" },
    { value: 2029, label: "2029" },
    { value: 2030, label: "2030" },
    { value: 2031, label: "2031" },
    { value: 2032, label: "2032" },
    { value: 2033, label: "2033" },
    { value: 2034, label: "2034" },
    { value: 2035, label: "2035" },
  ];
  const optionsMonth = [
    { value: 9999, label: "Every Month" },
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];
  const optionsWeek = [
    { value: 9999, label: "Every Week" },
    { value: 1, label: "Week 1" },
    { value: 2, label: "Week 2" },
    { value: 3, label: "Week 3" },
    { value: 4, label: "Week 4" },
    { value: 5, label: "Week 5" },
  ];

  const optionsDay = [
    { value: 9999, label: "Every Day" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 7, label: "Sun" },
  ];

  const optionsGroup = [
    { value: "white", label: "White Group" },
    { value: "yellow", label: "Yellow Group" },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      borderRadius: "7px",
      minHeight: "38px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.15)" : "none",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#eff6ff",
      border: "1px solid #dbeafe",
      borderRadius: "5px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1d4ed8",
      fontWeight: 500,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const uploadImage = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("image", selectedFile);

    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/uploadImage`,
        formData,
        {
          headers: { "Content-Type": "Multipart/form-data" },
        }
      )
      .then((result) => {
        setImagesNew(result.data.file.filename);
        if (result.data.success) {
          toast.success(
            `Image uploaded successfully, Name of file ${result.data.file.filename}`
          );
        }
      })
      .catch((err) => {

        toast.success(
          `Failed to upload Image, choose correct Image file with file extension .png/.jpg`
        );
      });
  };

  const saveData = (e) => {
    console.log(labelUnits)
    if (cycleNew) {
      e.preventDefault();
      const formData = new FormData();

      let labelUnitss = labelUnits.filter(item => {
        return !(item.m_label === undefined && item.m_unit === "" && item.m_criteria === "");
      });

      // formData.append("image", selectedFile);

      formData.append("images", imagesNew);
      //// formData.append("createdAt" ,createdAtNew);

      formData.append("action", actionNew);
      formData.append("cardNo", cardNoNew);
      formData.append("criterion", criterionNew);
      formData.append("cycle", cycleNew);
      formData.append("d", dNew);
      formData.append("line", lineNew);
      formData.append("model", modelNew);
      formData.append("processNo", processNoNew);
      formData.append("tool", toolNew);
      formData.append("workDetail", workDetailNew);
      formData.append("workOnePoint", workOnePointNew);
      formData.append("tlVerify", tlVerify);
      formData.append("glVerify", glVerify);
      formData.append("categoryCtrl", categoryCtrlNew);
      formData.append("commonItem", commonItemNew);
      formData.append("entryDate", new Date(Date.now()));
      formData.append("holidayOperation", holidayOperationNew);
      formData.append("m", mNew);
      formData.append("methodWssNo", methodWssNoNew);
      formData.append("m_spec", JSON.stringify(labelUnitss));


      //formData.append("pS", pSNew);
      formData.append("pS", pS);

      formData.append("prepManHr", prepManHrNew);
      formData.append("qualityOnePoint", qualityOnePointNew);
      formData.append("rS", rSNew);
      formData.append("reason", reasonNew);
      formData.append("remark", remarkNew);
      formData.append("safetyOnePoint", safetyOnePointNew);
      formData.append("w", wNew);
      formData.append("wHr", wHrNew);
      formData.append("workManpower", workManpowerNew);
      formData.append("workTime", workTimeNew);
      formData.append("y", yNew);
      formData.append("group", groupNew);      
      
      console.log(labelUnitss);
      axios
        .post(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/insertData`,
          formData,
          {
            headers: { "Content-Type": "Multipart/form-data" },
          }
        )
        .then((result) => {
          toast.success(`Data uploaded successfully`);
        })
        .catch((err) => {

          toast.error(
            err.response.data.message
            // `failed to upload data, Fill all data with correct Data type`
          );
        });
    } else {
      toast.error("Add all required fields")
    }

  };

  return (
    <div className="tbm-checkitem-page">
      {/* Top Header & Action Bar */}
      <div className="tbm-page-header">
        <div className="tbm-header-title-box">
          <h4>
            <i className="bi bi-card-checklist text-primary"></i> Add Check Item
          </h4>
          <p>
            Configure inspection criteria, schedule frequency, and measurement specifications
          </p>
        </div>
        <div className="tbm-header-actions">
          <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
            <i className="bi bi-building me-1 text-secondary"></i>
            {pS === "S" ? "Production Dept" : "Maintenance Dept"}
          </span>
          <span className="tbm-required-pill">
            <i className="bi bi-asterisk"></i> Required Fields
          </span>
          <button
            type="button"
            className="btn tbm-btn-save"
            onClick={saveData}
          >
            <i className="bi bi-cloud-arrow-up-fill"></i> Save Check Item
          </button>
        </div>
      </div>

      {/* Card 1: Basic & Location Information */}
      <div className="tbm-card">
        <div className="tbm-card-header">
          <h5 className="tbm-card-title">
            <i className="bi bi-geo-alt-fill"></i> Basic & Location Information
          </h5>
        </div>
        <div className="tbm-card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Line <span className="req">*</span>
              </label>
              <Select
                options={optionsLine}
                styles={customSelectStyles}
                placeholder="Select Line..."
                value={optionsLine.find((o) => o.value === lineNew) || null}
                onChange={(e) => setLineNew(e ? e.value : "")}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                {pS === "S" ? "Station / Line" : "OP no."}{" "}
                <span className="req">*</span>
              </label>
              <div className="input-group tbm-op-group">
                <span className="input-group-text">OP</span>
                <input
                  className="form-control tbm-input"
                  type="text"
                  value={processNoNew.replace(/^OP/, "")}
                  onChange={(e) => {
                    const alphanumericValue = e.target.value.toUpperCase();
                    setProcessNoNew("OP" + alphanumericValue);
                  }}
                  placeholder="10A, 100, etc."
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">Group</label>
              <Select
                options={optionsGroup}
                styles={customSelectStyles}
                placeholder="Select Group..."
                value={optionsGroup.find((o) => o.value === groupNew) || null}
                onChange={(e) => setGroupNew(e ? e.value : "")}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Running / Stop Check <span className="req">*</span>
              </label>
              <Select
                options={optionsRS}
                styles={customSelectStyles}
                value={
                  optionsRS.find((o) => o.value === rSNew) || {
                    value: "R",
                    label: "Running Check",
                  }
                }
                onChange={(e) => setRSNew(e ? e.value : "R")}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">Model</label>
              <input
                className="form-control tbm-input"
                value={modelNew}
                onChange={(e) => setModelNew(e.target.value)}
                placeholder="e.g. TNGA, etc."
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                {pS === "S" ? "Matrix Card No." : "Control No."}
              </label>
              <input
                className="form-control tbm-input"
                value={cardNoNew}
                onChange={(e) => setCardNoNew(e.target.value)}
                placeholder="Enter Card No."
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                {pS === "S" ? "Ledger No." : "WSS No."}
              </label>
              <input
                className="form-control tbm-input"
                value={methodWssNoNew}
                onChange={(e) => setMethodWssNoNew(e.target.value)}
                placeholder="Enter Ledger / WSS No."
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                {pS === "S" ? "Area to inspect" : "No. of members"}
              </label>
              <input
                className="form-control tbm-input"
                value={workManpowerNew}
                onChange={(e) => setWorkManpowerNew(e.target.value)}
                placeholder={pS === "S" ? "Inspection area details" : "e.g. 1, 2"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Inspection & Work Details */}
      <div className="tbm-card">
        <div className="tbm-card-header">
          <h5 className="tbm-card-title">
            <i className="bi bi-clipboard2-check-fill"></i> Inspection & Work Details
          </h5>
        </div>
        <div className="tbm-card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="tbm-label">
                {pS === "S" ? "Inspection Item" : "Work Detail"}{" "}
                <span className="req">*</span>
              </label>
              <input
                className="form-control tbm-input"
                value={workDetailNew}
                onChange={(e) => setWorkDetailNew(e.target.value)}
                placeholder="Enter inspection description or work detail"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="tbm-label">
                {pS === "S" ? "Inspection Method" : "Tools"}
              </label>
              <input
                className="form-control tbm-input"
                value={toolNew}
                onChange={(e) => setToolNew(e.target.value)}
                placeholder="Visual, Gauge, Torque wrench, etc."
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="tbm-label">
                Cycle <span className="req">*</span>
              </label>
              <input
                className="form-control tbm-input"
                value={cycleNew}
                onChange={(e) => setCycleNew(e.target.value)}
                placeholder="e.g. Daily, 1W, 1M, 3M"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="tbm-label">Total Time in Mins</label>
              <input
                className="form-control tbm-input"
                value={workTimeNew}
                onChange={(e) => setWorkTimeNew(e.target.value)}
                placeholder="e.g. 5, 10, 15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Frequency & Schedule Configuration */}
      <div className="tbm-card">
        <div className="tbm-card-header">
          <h5 className="tbm-card-title">
            <i className="bi bi-calendar3"></i> Frequency & Schedule Configuration
          </h5>
          <span className="text-muted small">
            Configure periodic triggers or leave as recurring defaults
          </span>
        </div>
        <div className="tbm-card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Day Frequency <span className="req">*</span>
              </label>
              <Select
                options={optionsDay}
                isMulti={true}
                styles={customSelectStyles}
                value={
                  dNew.includes(9999)
                    ? [{ value: 9999, label: "Every Day" }]
                    : optionsDay.filter((opt) => dNew.includes(opt.value))
                }
                onChange={(e) => {
                  let newArray = [];
                  (e || []).forEach((item) => {
                    if (typeof item.value === "object") {
                      item.value.forEach(() => {
                        newArray.push(item.value[0]);
                      });
                    } else {
                      newArray.push(item.value);
                    }
                  });
                  setDNew(newArray);
                }}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Week Frequency <span className="req">*</span>
              </label>
              <Select
                options={optionsWeek}
                isMulti={true}
                styles={customSelectStyles}
                value={
                  wNew.includes(9999)
                    ? [{ value: 9999, label: "Every Week" }]
                    : optionsWeek.filter((opt) => wNew.includes(opt.value))
                }
                onChange={(e) => {
                  let newArray = [];
                  (e || []).forEach((item) => {
                    if (typeof item.value === "object") {
                      item.value.forEach(() => {
                        newArray.push(item.value[0]);
                      });
                    } else {
                      newArray.push(item.value);
                    }
                  });
                  setWNew(newArray);
                }}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Month Frequency <span className="req">*</span>
              </label>
              <Select
                options={optionsMonth}
                isMulti={true}
                styles={customSelectStyles}
                value={
                  mNew.includes(9999)
                    ? [{ value: 9999, label: "Every Month" }]
                    : optionsMonth.filter((opt) => mNew.includes(opt.value))
                }
                onChange={(e) => {
                  let newArray = [];
                  (e || []).forEach((item) => {
                    if (typeof item.value === "object") {
                      item.value.forEach(() => {
                        newArray.push(item.value[0]);
                      });
                    } else {
                      newArray.push(item.value);
                    }
                  });
                  setMNew(newArray);
                }}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="tbm-label">
                Year Frequency <span className="req">*</span>
              </label>
              <Select
                options={optionsYear}
                isMulti={true}
                styles={customSelectStyles}
                value={
                  yNew.includes(9999)
                    ? [{ value: 9999, label: "Every Year" }]
                    : optionsYear.filter((opt) => yNew.includes(opt.value))
                }
                onChange={(e) => {
                  let newArray = [];
                  (e || []).forEach((item) => {
                    if (typeof item.value === "object") {
                      item.value.forEach(() => {
                        newArray.push(parseInt(item.value[0]));
                      });
                    } else {
                      newArray.push(parseInt(item.value));
                    }
                  });
                  setYNew(newArray);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Verification & Reference Image */}
      <div className="tbm-card">
        <div className="tbm-card-header">
          <h5 className="tbm-card-title">
            <i className="bi bi-shield-check"></i> Verification & Reference Image
          </h5>
        </div>
        <div className="tbm-card-body">
          <div className="row g-4 align-items-start">
            {/* Approvals */}
            <div className="col-12 col-md-6">
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold mb-3 text-secondary" style={{ fontSize: "0.85rem" }}>
                  <i className="bi bi-person-check-fill me-1"></i> Approval Settings
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="tbm-label">TL Approval</label>
                    <select
                      className="form-select tbm-select"
                      value={tlVerify}
                      onChange={(e) => setVerifTL(e.target.value === "true" || e.target.value === true)}
                    >
                      <option value={false}>Not Required</option>
                      <option value={true}>Required</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="tbm-label">GL Approval</label>
                    <select
                      className="form-select tbm-select"
                      value={glVerify}
                      onChange={(e) => setGlVerify(e.target.value === "true" || e.target.value === true)}
                    >
                      <option value={false}>Not Required</option>
                      <option value={true}>Required</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Image */}
            <div className="col-12 col-md-6">
              <div className="tbm-upload-zone">
                <label className="tbm-label mb-2">Item Reference Image</label>
                <div className="tbm-upload-controls">
                  <input
                    type="file"
                    id="uploadImage"
                    className="form-control tbm-input"
                    style={{ maxWidth: "260px" }}
                    onChange={selectedFileHandler}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary fw-semibold"
                    onClick={uploadImage}
                    disabled={!selectedFile}
                  >
                    <i className="bi bi-cloud-arrow-up me-1"></i> Upload Image
                  </button>
                </div>
                {imagesNew ? (
                  <div className="tbm-uploaded-badge">
                    <i className="bi bi-check-circle-fill"></i> Uploaded: {imagesNew}
                  </div>
                ) : (
                  <div className="text-muted small mt-2">
                    <i className="bi bi-info-circle me-1"></i> Attach .png/.jpg photo for visual standard
                  </div>
                )}
                <div className="mt-3 text-start">
                  <label className="tbm-label" style={{ fontSize: "0.75rem" }}>
                    Image Filename / Key
                  </label>
                  <input
                    className="form-control tbm-input"
                    value={imagesNew}
                    onChange={(e) => setImagesNew(e.target.value)}
                    placeholder="Auto-populated or enter filename"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Measurement Specifications & Criteria */}
      <div className="tbm-card">
        <div className="tbm-card-header">
          <h5 className="tbm-card-title">
            <i className="bi bi-rulers"></i> Measurement Specifications
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary fw-semibold"
            onClick={handleAddLabelUnit}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Parameter
          </button>
        </div>
        <div className="tbm-card-body">
          {labelUnits && labelUnits.length > 0 && (
            <div className="tbm-measure-header">
              <div className="tbm-measure-col-label">Parameter Label</div>
              <div className="tbm-measure-col-unit">Unit</div>
              <div className="tbm-measure-col-val">Standard Value / Criteria</div>
              <div className="tbm-measure-col-act text-end">Action</div>
            </div>
          )}

          {labelUnits.map((item, index) => (
            <div key={index} className="tbm-measure-row">
              <div className="tbm-measure-col-label">
                <input
                  type="text"
                  className="form-control tbm-input"
                  placeholder="e.g. Oil Level, Pressure"
                  value={item.m_lable}
                  onChange={(e) =>
                    handleLabelUnitChange(index, "m_lable", e.target.value)
                  }
                />
              </div>
              <div className="tbm-measure-col-unit">
                <input
                  type="text"
                  className="form-control tbm-input"
                  placeholder="e.g. mm, bar, kg"
                  value={item.m_unit}
                  onChange={(e) =>
                    handleLabelUnitChange(index, "m_unit", e.target.value)
                  }
                />
              </div>
              <div className="tbm-measure-col-val">
                <input
                  type="text"
                  className="form-control tbm-input"
                  placeholder="e.g. 25 ± 2, Max 80"
                  value={item.m_criteria}
                  onChange={(e) =>
                    handleLabelUnitChange(index, "m_criteria", e.target.value)
                  }
                />
              </div>
              <div className="tbm-measure-col-act">
                <button
                  type="button"
                  className="btn tbm-btn-remove"
                  onClick={() => handleRemoveLabelUnit(index)}
                  title="Remove parameter"
                >
                  <i className="bi bi-trash"></i> Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="tbm-btn-add-measure"
            onClick={handleAddLabelUnit}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Another Measurement Parameter
          </button>
        </div>
      </div>

      {/* Card 6: Extended Maintenance Details (pS !== 'S') */}
      {pS !== "S" && (
        <div className="tbm-card">
          <div className="tbm-card-header">
            <h5 className="tbm-card-title">
              <i className="bi bi-tools"></i> Maintenance Extended Details
            </h5>
          </div>
          <div className="tbm-card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Holiday Operation</label>
                <input
                  className="form-control tbm-input"
                  value={holidayOperationNew}
                  onChange={(e) => setHolidayOperationNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Reason</label>
                <input
                  className="form-control tbm-input"
                  value={reasonNew}
                  onChange={(e) => setReasonNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Remark</label>
                <input
                  className="form-control tbm-input"
                  value={remarkNew}
                  onChange={(e) => setRemarkNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Action</label>
                <input
                  className="form-control tbm-input"
                  value={actionNew}
                  onChange={(e) => setActionNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Preparation Time (mins)</label>
                <input
                  className="form-control tbm-input"
                  value={prepManHrNew}
                  onChange={(e) => setPrepManHrNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Work Time / Person</label>
                <input
                  className="form-control tbm-input"
                  value={wHrNew}
                  onChange={(e) => setWHrNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Work One Point</label>
                <input
                  className="form-control tbm-input"
                  value={workOnePointNew}
                  onChange={(e) => setWorkOnePointNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Quality One Point</label>
                <input
                  className="form-control tbm-input"
                  value={qualityOnePointNew}
                  onChange={(e) => setQualityOnePointNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Safety One Point</label>
                <input
                  className="form-control tbm-input"
                  value={safetyOnePointNew}
                  onChange={(e) => setSafetyOnePointNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Category Control</label>
                <input
                  className="form-control tbm-input"
                  value={categoryCtrlNew}
                  onChange={(e) => setCategoryCtrlNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Common Item</label>
                <input
                  className="form-control tbm-input"
                  value={commonItemNew}
                  onChange={(e) => setCommonItemNew(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="tbm-label">Criterion</label>
                <input
                  className="form-control tbm-input"
                  value={criterionNew}
                  onChange={(e) => setCriterionNew(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating / Bottom Action Bar for Quick Submission */}
      <div className="tbm-bottom-bar">
        <span className="tbm-required-pill me-auto">
          <i className="bi bi-asterisk"></i> Please ensure all required fields are filled before saving
        </span>
        <button
          type="button"
          className="btn tbm-btn-save"
          onClick={saveData}
        >
          <i className="bi bi-cloud-arrow-up-fill"></i> Save Check Item
        </button>
      </div>
    </div>
  );
}

export default SmileCardAdd;
