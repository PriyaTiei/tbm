import React, { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { NavLink } from 'react-router-dom';
import DatePicker from "react-date-picker";
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import axios from 'axios';

const Verification = ({ showModals, setShowModals }) => {
    const [show, setShow] = useState(false);
    const [comment, setComment] = useState('');
    const [fromDate, setFromDate] = useState(new Date(Date.now()));
    const [toDate, setToDate] = useState(new Date(Date.now()));
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);


    const handleCloses = () => setShow(false);
    const auth = useSelector((state) => state.auth);
    const level = auth.user ? auth.user.level : 0;

    const [tblData, setTblData] = useState([])




    useEffect(() => {
        if (level >= 20 && level <= 40) {
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
        else if (level >= 40) {
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
        if (level >= 20 && level <= 40) {
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
        else if (level >= 40) {
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
            if (level >= 20 && level <= 40) {
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
            else if (level >= 40) {
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

    return (<>



        <div className="overflow-auto" style={{ width: "80%", margin: "2% auto", height: "85vh" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Completion Verification required from you</h3>
                <div>
                    <button className="btn btn-success" onClick={approveSelected}>Approve Selected</button>&emsp;
                    <button onClick={handleShow} className="btn btn-danger">Comment Selected</button>
                </div>
            </div>


            <div style={{ width: "80vw", height: "80vh" }}>
                <table className="table">
                    <thead>
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
                            <th scope="col">Specifications</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">remarks</th>
                            <th scope="col">Link For card</th>
                            {/* <th scope="col">Options</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {tblData.length > 0 ? tblData.map((items, i) => (<tr>
                            <td onClick={() => handleSelectRow(items?._id)}>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(items?._id)}
                                    onChange={() => handleSelectRow(items?._id)}
                                />
                            </td>
                            {/* {console.log("itemsitemsitems", selectedRows)} */}
                            <th scope="row">{i + 1}</th>
                            <td>{items?.line}</td>
                            <td>{items?.processNo}</td>
                            <td>{items?.workDetail}</td>
                            {/* <td>Feeler gauges, precision calipers</td> */}
                            <td>
                                {items.m_spec.length > 0 ?
                                    items.m_spec.map((item, index) => (
                                        <span key={index}>
                                            {item.m_lable ? item.m_lable : ""}
                                            ({item.m_unit ? item.m_unit : ""})-{item.m_value ? item.m_value : "-"}
                                            <b>({item.m_criteria ? item.m_criteria : "-"})</b>

                                            {index < items.m_spec.length - 1 && ', '}
                                            <br /> </span>
                                    ))
                                    : ""}
                            </td>
                            <td>{items?.entryFor}</td>
                            <td>{items?.result}</td>
                            <td>{items?.remarks}</td>
                            <td><NavLink to={`/checkList?line=${items?.line}&processNo=${items?.processNo}`}>Click Here</NavLink></td>

                        </tr>)) : ""}

                        {/* Add more rows as needed */}
                    </tbody>
                </table>
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