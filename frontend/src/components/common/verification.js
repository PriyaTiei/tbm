import React, { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { NavLink } from 'react-router-dom';
import DatePicker from "react-date-picker";
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import axios from 'axios';
import { ButtonGroup, ToggleButton } from "react-bootstrap";
const Verification = ({ showModals, setShowModals }) => {
    const [show, setShow] = useState(false);
    const [comment, setComment] = useState('');
    const [fromDate, setFromDate] = useState(new Date(Date.now()));
    const [toDate, setToDate] = useState(new Date(Date.now()));
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [comman, setCommon] = useState([])


    const handleCloses = () => setShow(false);
    const auth = useSelector((state) => state.auth);
    const level = auth.user ? auth.user.level : 0;

    const [tblData, setTblData] = useState([])
    const [activeList, setActiveList] = useState("toBeApproved");



    useEffect(() => {
        axios
            .get(
                `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/getVerifyItems`
            )
            .then((result) => {
                setCommon(result?.data?.dailyItemsWithGlTlVerify)
            })
            .catch((err) => {
                toast.error(`${err.message}`);
            });
    }, [])

    useEffect(() => {
        console.log(comman)
    }, [comman])

    useEffect(() => {
        if (level >= 20 && level < 30) {
            axios
                .get(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/tlVerifyItems`
                )
                .then((result) => {
                    const extractedData = result?.data?.tlList.map(entry => {
                        const item = entry.item[0];
                        // console.log(entry.dailystatus.m_spec)
                        return {
                            _id: entry._id,
                            line: item.line,
                            processNo: item.processNo,
                            workDetail: item.workDetail,
                            m_spec: entry.dailystatus.m_spec,
                            remarks: entry.dailystatus.remarks,
                            entryFor: entry.dailystatus.entryFor,
                            result: entry.result
                        };
                    });


                    setTblData(extractedData)
                })
                .catch((err) => {

                    toast.error(`${err.message}`);
                });
        }
        else if (level == 30) {
            axios
                .get(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/glVerifyItems`
                )
                .then((result) => {
                    const extractedData = result?.data?.glList.map(entry => {
                        const item = entry.item[0];
                        // console.log(entry.dailystatus.m_spec)
                        return {
                            _id: entry._id,
                            line: item.line,
                            processNo: item.processNo,
                            workDetail: item.workDetail,
                            m_spec: entry.dailystatus.m_spec,
                            remarks: entry.dailystatus.remarks,
                            entryFor: entry.dailystatus.entryFor,
                            result: entry.result
                        };
                    });
                    setTblData(extractedData)

                })
                .catch((err) => {

                    toast.error(`${err.message}`);
                });
        }

    }, [level])
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            const allIds = tblData?.map(row => row._id);
            setSelectedRows(allIds);
        } else {
            // Deselect all rows
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
    }

    const handleSubmit = () => {
        let data = {
            ids: selectedRows,
            user: auth.user._id,
            comment: comment
        }
        if (level >= 20 && level < 30) {
            axios
                .post(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateTlComment`, data
                )
                .then((result) => {
                    axios
                        .get(
                            `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/tlVerifyItems`
                        )
                        .then((result) => {
                            const extractedData = result?.data?.tlList.map(entry => {
                                const item = entry.item[0];
                                // console.log(entry.dailystatus.m_spec)
                                return {
                                    _id: entry._id,
                                    line: item.line,
                                    processNo: item.processNo,
                                    workDetail: item.workDetail,
                                    m_spec: entry.dailystatus.m_spec,
                                    remarks: entry.dailystatus.remarks,
                                    entryFor: entry.dailystatus.entryFor,
                                    result: entry.result
                                };
                            });


                            setTblData(extractedData)
                        })
                        .catch((err) => {

                            toast.error(`${err.message}`);
                        });
                    toast.success(`Added Successfully`);
                })
                .catch((err) => {

                    toast.error(`${err.message}`);
                });
        }
        else if (level == 30) {
            axios
                .post(
                    `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateGlComment`, data
                )
                .then((result) => {
                    axios
                        .get(
                            `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/glVerifyItems`
                        )
                        .then((result) => {
                            const extractedData = result?.data?.glList.map(entry => {
                                const item = entry.item[0];
                                // console.log(entry.dailystatus.m_spec)
                                return {
                                    _id: entry._id,
                                    line: item.line,
                                    processNo: item.processNo,
                                    workDetail: item.workDetail,
                                    m_spec: entry.dailystatus.m_spec,
                                    remarks: entry.dailystatus.remarks,
                                    entryFor: entry.dailystatus.entryFor,
                                    result: entry.result
                                };
                            });
                            setTblData(extractedData)

                        })
                        .catch((err) => {

                            toast.error(`${err.message}`);
                        });
                    toast.success(`Added Successfully`);

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
            }
            if (level >= 20 && level < 30) {
                axios
                    .post(
                        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateTlConfirm`, data
                    )
                    .then((result) => {
                        axios
                            .get(
                                `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/tlVerifyItems`
                            )
                            .then((result) => {
                                const extractedData = result?.data?.tlList.map(entry => {
                                    const item = entry.item[0];
                                    // console.log(entry.dailystatus.m_spec)
                                    return {
                                        _id: entry._id,
                                        line: item.line,
                                        processNo: item.processNo,
                                        workDetail: item.workDetail,
                                        m_spec: entry.dailystatus.m_spec,
                                        remarks: entry.dailystatus.remarks,
                                        entryFor: entry.dailystatus.entryFor,
                                        result: entry.result
                                    };
                                });


                                setTblData(extractedData)
                            })
                            .catch((err) => {

                                toast.error(`${err.message}`);
                            });
                        toast.success(`Approved`);
                    })
                    .catch((err) => {

                        toast.error(`${err.message}`);
                    });
            }
            else if (level == 30) {
                axios
                    .post(
                        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/updateGlConfirm`, data
                    )
                    .then((result) => {
                        axios
                            .get(
                                `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/glVerifyItems`
                            )
                            .then((result) => {
                                const extractedData = result?.data?.glList.map(entry => {
                                    const item = entry.item[0];
                                    // console.log(entry.dailystatus.m_spec)
                                    return {
                                        _id: entry._id,
                                        line: item.line,
                                        processNo: item.processNo,
                                        workDetail: item.workDetail,
                                        m_spec: entry.dailystatus.m_spec,
                                        remarks: entry.dailystatus.remarks,
                                        entryFor: entry.dailystatus.entryFor,
                                        result: entry.result
                                    };
                                });
                                setTblData(extractedData)

                            })
                            .catch((err) => {

                                toast.error(`${err.message}`);
                            });
                        toast.success(`Approved`);

                    })
                    .catch((err) => {

                        toast.error(`${err.message}`);
                    });
            }
        } else {
            toast.error(`Select rows`);
        }
    }


    const getStatusLabel = (data, type) => {
        if (!data || !type) return "";
        const verifyKey = `${type}Verify`;
        const atKey = `${type}At`;
        const commentKey = `${type}Comment`;
        // console.log(data)
        // console.log(data?.checkItem[verifyKey])
        if (data?.checkItem[verifyKey]) {
            if (data[atKey]) {
                // Check if the comment is empty, null, or undefined
                if (!data[commentKey] || data[commentKey].trim() === "") {
                    return `Approved`;
                } else {
                    return `Commented: ${data[commentKey]}`;
                }
            } else {
                return `Pending`;
            }
        } else {
            return "--"
        }

    };

    // Example usage with your data:
    // const resultTL = getStatusLabel(data, "tl");
    // const resultGL = getStatusLabel(data, "gl");

    // console.log(resultTL); // Output based on 'tlAt' and 'tlComment'
    // console.log(resultGL); // Output based on 'glAt' and 'glComment'


    return (<>



        <div className="overflow-auto" style={{ width: "95%", margin: "auto", height: "100%", paddingBottom: "15%", paddingTop: "2%" }}>
            <div>
                <div>
                    <ButtonGroup>
                        <ToggleButton
                            variant={activeList === "toBeApproved" ? "secondary" : "outline-secondary"}
                            onClick={() => setActiveList("toBeApproved")}
                        >
                            Show To Be Approved List
                        </ToggleButton>
                        <ToggleButton
                            variant={activeList === "general" ? "primary" : "outline-primary"}
                            onClick={() => setActiveList("general")}
                        >
                            Show General List
                        </ToggleButton>

                    </ButtonGroup>

                    <div className="mt-3">
                        {activeList === "toBeApproved" ? (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3>Completion Verification required from you</h3>
                            <div>
                                <button className="btn btn-success" onClick={approveSelected}>Approve Selected</button>&emsp;
                                <button onClick={handleShow} className="btn btn-danger">Comment Selected</button>
                            </div>
                        </div>
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped">
                                    <thead class="sticky-header">
                                        <tr>
                                            <th scope="col">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th scope="col">#</th>
                                            <th scope="col">Line</th>
                                            <th scope="col">Station</th>
                                            <th scope="col">Inspection Item</th>
                                            <th scope="col">Measurement</th>
                                            <th scope="col">Standard Value</th>
                                            <th scope="col">Actual Value</th>

                                            <th scope="col">Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Remarks</th>
                                            <th scope="col">Link For card</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tblData.length > 0 ? tblData.map((items, i) => (
                                            <tr key={items?._id}>
                                                <td onClick={() => handleSelectRow(items?._id)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(items?._id)}
                                                        onChange={() => handleSelectRow(items?._id)}
                                                    />
                                                </td>
                                                <th scope="row">{i + 1}</th>
                                                <td style={{ fontSize: "12px" }}>{items?.line}</td>
                                                <td style={{ fontSize: "12px" }}>{items?.processNo}</td>
                                                <td style={{ fontSize: "12px" }}>{items?.workDetail}</td>

                                                {/* Measurement */}
                                                <td style={{ fontSize: "12px" }}>
                                                    {items.m_spec.length > 0 ?
                                                        items.m_spec.map((item, index) => (
                                                            <span key={index}>
                                                                {item.m_lable ? item.m_lable : ""}
                                                                ({item.m_unit ? item.m_unit : ""})
                                                                {index < items.m_spec.length - 1 && ' '}
                                                                <br />
                                                            </span>
                                                        ))
                                                        : ""}
                                                </td>
                                                <td style={{ fontSize: "12px" }}>
                                                    {items.m_spec.length > 0 ?
                                                        items.m_spec.map((item, index) => (
                                                            <span key={index}>
                                                                <b>{item.m_criteria ? item.m_criteria : ""}</b>
                                                                {index < items.m_spec.length - 1 && ' '}
                                                                <br />
                                                            </span>
                                                        ))
                                                        : ""}
                                                </td>
                                                {/* Actual Value */}
                                                <td style={{ fontSize: "12px" }}>
                                                    {items.m_spec.length > 0 ?
                                                        items.m_spec.map((item, index) => (
                                                            <span key={index}>
                                                                {item.m_value ? item.m_value : 0}
                                                                {index < items.m_spec.length - 1 && ' '}
                                                                <br />
                                                            </span>
                                                        ))
                                                        : ""}
                                                </td>



                                                <td style={{ fontSize: "12px" }}>{items?.entryFor}</td>
                                                <td style={{
                                                    fontSize: "12px",
                                                    backgroundColor: items?.result === "NG" ? "red" : "transparent",
                                                    color: items?.result === "NG" ? "white" : "black"
                                                }}>
                                                    {items?.result}
                                                </td>

                                                <td style={{ fontSize: "12px" }}>{items?.remarks}</td>
                                                <td style={{ fontSize: "12px" }}>
                                                    <NavLink to={`/checkList?line=${items?.line}&processNo=${items?.processNo}`}>Click Here</NavLink>
                                                </td>
                                            </tr>
                                        )) : ""}
                                    </tbody>

                                </table>
                            </div>


                        </>)


                            :



                            //general table
                            (<><div style={{ height: "80vh" }}>
                                <div className="table-container">
                                    <table className="table table-fixed-header" style={{ tableLayout: "fixed", fontSize: "12px" }}>
                                        <thead>
                                            <tr>
                                                <th scope="col" style={{ width: "3%", }}>#</th>
                                                <th scope="col" style={{ width: "8%" }}>Line</th>
                                                <th scope="col" style={{ width: "5%" }}>Station</th>
                                                <th scope="col" style={{ width: "15%" }}>Inspection Item</th>
                                                <th scope="col" style={{ width: "10%" }}>Measurement</th>
                                                <th scope="col" style={{ width: "5%" }}>Standard Value</th>
                                                <th scope="col" style={{ width: "5%" }}>Actual Value</th>

                                                <th scope="col" style={{ width: "5%" }}>Date</th>
                                                <th scope="col" style={{ width: "5%" }}>Status</th>
                                                <th scope="col" style={{ width: "15%" }}>Remarks</th>
                                                <th scope="col" style={{ width: "5%" }}>TL Status</th>
                                                <th scope="col" style={{ width: "5%" }}>GL Status</th>
                                                <th scope="col" style={{ width: "5%" }}>Link For card</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comman.length > 0 ? comman.map((items, i) => (
                                                <tr key={i}>
                                                    <th scope="row">{i + 1}</th>
                                                    <td>{items?.checkItem?.line}</td>
                                                    <td>{items?.checkItem?.processNo}</td>
                                                    <td>{items?.checkItem?.workDetail}</td>

                                                    <td>
                                                        {items.m_spec?.length > 0 ?
                                                            items.m_spec.map((item, index) => (
                                                                <span key={index}>
                                                                    {item.m_lable ? item.m_lable : ""}
                                                                    ({item.m_unit ? item.m_unit : ""})
                                                                    {index < items.m_spec.length - 1 && ' '}
                                                                    <br />
                                                                </span>
                                                            ))
                                                            : ""}
                                                    </td>
                                                    {/* Criteria */}
                                                    <td>
                                                        {items.m_spec.length > 0 ?
                                                            items.m_spec.map((item, index) => (
                                                                <span key={index}>
                                                                    <b>{item.m_criteria ? item.m_criteria : ""}</b>
                                                                    {index < items.m_spec.length - 1 && ' '}
                                                                    <br />
                                                                </span>
                                                            ))
                                                            : ""}
                                                    </td>
                                                    {/* Actual Value */}
                                                    <td>
                                                        {items.m_spec.length > 0 ?
                                                            items.m_spec.map((item, index) => (
                                                                <span key={index}>
                                                                    {item.m_value ? item.m_value : 0}
                                                                    {index < items.m_spec.length - 1 && ' '}
                                                                    <br />
                                                                </span>
                                                            ))
                                                            : ""}
                                                    </td>



                                                    <td>{items?.entryFor}</td>
                                                    <td style={{
                                                        fontSize: "12px",
                                                        backgroundColor: items?.result === "NG" ? "red" : "transparent",
                                                        color: items?.result === "NG" ? "white" : "black"
                                                    }}>
                                                        {items?.result}
                                                    </td>
                                                    <td>{items?.remarks}</td>
                                                    <td>{getStatusLabel(items, "tl")}</td>
                                                    <td>{getStatusLabel(items, "gl")}</td>
                                                    <td><NavLink to={`/checkList?line=${items?.checkItem?.line}&processNo=${items?.checkItem?.processNo}`}>Click Here</NavLink></td>
                                                </tr>
                                            )) : ""}
                                        </tbody>
                                    </table>
                                </div>

                            </div></>)}
                    </div>
                </div>

            </div>
        </div>

        <Modal show={show} onHide={handleCloses}>
            <Modal.Header closeButton>
                <Modal.Title>Comment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formComment">
                    <Form.Label>Enter your comments:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloses}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    </>
    )
}

export default Verification