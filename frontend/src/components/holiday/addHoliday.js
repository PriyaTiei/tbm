import React, { useEffect, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from "react-date-picker";
import { Button, FloatingLabel, Form, Table, Toast } from 'react-bootstrap';
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
  const [showToast, setShowToast] = useState(false);
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
  const { holidaydata, holidaySingledata } = useSelector((state) => state.holiday)
  const [complete, setComplete] = useState([])
  const [editComp, setEditComp] = useState("")
  const [selected, setSelected] = useState()

  useEffect(() => {
    const year = toDate.getFullYear();
    const month = String(toDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(toDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;
    setHdata({ ...hdata, date: formattedDate });

  }, [toDate]);

  const handleAutoGenerateClick = () => {
    setShowInput(true);
  };

  const handleSubmitClick = () => {
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/holidays/prepopulate`,
        { year: inputValue }
      )
      .then((result) => {

        if (result.data.success) {
          toast.success("saved data");
          setShowInput(false)
          setInputValue("")
        }
      })
      .catch((err) => {

        setShowInput(false)
        setInputValue("")
        toast.error(`Data could not be saved , ${err.message}`);
      });
    // const response = axios.post(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}holidays/prepopulate`, { year: inputValue });
    // if (response.data.success) {
    //   setShowToast(true);
    //   setShowInput(false);
    // } else {
    //   // Handle error case
    //   alert("Failed to submit");
    // }

  };

  useEffect(() => {
    if (holidaydata?.holidays) {

      setComplete(holidaydata?.holidays)
    }
  }, [holidaydata])




  useEffect(() => {
    if (holidaySingledata && holidaySingledata?.holiday) {
      setHdata(holidaySingledata?.holiday)

      // const formattedDate = new Date(holidaySingledata?.holiday?.date);
      const dateString = holidaySingledata?.holiday?.date;
      const dateOnly = dateString.split("T")[0];
      const formattedDate = new Date(dateOnly);
      setToDate(formattedDate);
    }

  }, [holidaySingledata])

  const validate = () => {
    let errors = {};

    // Validate date
    if (!hdata.date || isNaN(new Date(hdata.date).getTime())) {
      errors.date = "Valid date is required.";
    }

    // Validate reason
    if (!hdata.reason.trim()) {
      errors.reason = "Reason is required.";
    }

    // Validate adhoc (Assuming it must be "true" or "false")


    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (validate()) {


      dispatch(createData({ ...hdata, user: users?._id }))
        .then((status) => {

          toast.success("Holiday Added successfully");
          dispatch(fetchData())
          handleClear(); // Clear form after successful submission
        })
        .catch((error) => {
          console.error("Submission failed:", error);
          toast.error(error);
        });
    } else {

    }
  };


  const handleSave = (e) => {
    // e.preventDefault(); // Prevent default form submission behavior

    if (validate()) {


      dispatch(updateData(selected, { ...hdata, user: users?._id }))
        .then((status) => {

          toast.success("Holiday Updated successfully");
          dispatch(fetchData())
          handleClear(); // Clear form after successful submission
        })
        .catch((error) => {
          console.error("Submission failed:", error);
          toast.error(error);
        });
    } else {

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
    dispatch(fetchSingleData(item))
    setSelected(item)
    setCards("edit")

    // Implement edit functionality here
  };

  const handleDeleteClick = (item) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {

      dispatch(deleteData(item)).then(() => dispatch(fetchData()))
      // Implement delete functionality here
      // For example, you might setItem to null or remove it from a list
    }
  };
  return (
    <div className="overflow-auto" style={{ height: "85vh", paddingBottom: "10%" }}>
      {cards && cards === 'add' ? (
        <Card style={{ width: '30rem', margin: "auto", marginTop: "2%", position: "relative" }}>
          <Card.Body>
            <i className="bi bi-x-circle cross" onClick={handleClear} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}></i>
            <Card.Title>Add Holiday</Card.Title>

            <div style={{ display: "block", width: "100%" }}>
              Select A Date
              <DatePicker
                format="dd/MM/yyyy"
                className={"newar"}
                value={toDate}
                onChange={setToDate}
                clearIcon={null}
                calendarIcon={null}
                style={{ width: "100%!important", boxSizing: "border-box" }}
              />
            </div>
            <span style={{ color: "red" }}>{errors.date}</span>

            <FloatingLabel controlId="floatingSelect" label="Adhoc">
              <Form.Select
                aria-label="Floating label select example"
                onChange={(e) => {
                  setHdata({ ...hdata, adhoc: e.target.value });
                }}
              >
                <option value="">Please select Ad Hoc Holiday Nature</option>
                <option value="false">Scheduled</option>
                <option value="true">Spontaneous</option>
              </Form.Select>
            </FloatingLabel>
            {/* <span style={{ color: "red" }}>{errors.adhoc}</span> */}

            <FloatingLabel controlId="floatingTextarea2" label="Reason for Holiday" className='cheecc'>
              <Form.Control
                as="textarea"
                placeholder="Leave a comment here"
                style={{ height: '100px' }}
                onChange={(e) => {
                  setHdata({ ...hdata, reason: e.target.value });
                }}
              />
            </FloatingLabel>
            <span style={{ color: "red" }}>{errors.reason}</span>

            <Button variant="primary" className='cheecc' style={{ width: "100%" }} onClick={handleSubmit}>Save</Button>
          </Card.Body>
        </Card>
      ) : cards == "edit" ?
        (<Card style={{ width: '30rem', margin: "auto", marginTop: "2%", position: "relative" }}>
          <Card.Body>
            <i className="bi bi-x-circle cross" onClick={handleClear} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}></i>
            <Card.Title>Edit Holiday</Card.Title>

            <div style={{ display: "block", width: "100%" }}>
              Select A Date
              <DatePicker
                format="dd/MM/yyyy"
                className={"newar"}
                value={toDate}
                onChange={setToDate}
                clearIcon={null}
                calendarIcon={null}
                style={{ width: "100%!important", boxSizing: "border-box" }}
              />
            </div>
            <span style={{ color: "red" }}>{errors.date}</span>

            <FloatingLabel controlId="floatingSelect" label="Adhoc">
              <Form.Select
                aria-label="Floating label select example"
                onChange={(e) => {
                  setHdata({ ...hdata, adhoc: e.target.value });
                }}
                value={hdata?.adhoc}
              >
                <option value="">Please select Ad Hoc Holiday Nature</option>
                <option value="false">Scheduled</option>
                <option value="true">Spontaneous</option>
              </Form.Select>
            </FloatingLabel>
            <span style={{ color: "red" }}>{errors.adhoc}</span>

            <FloatingLabel controlId="floatingTextarea2" label="Reason for Holiday" className='cheecc'>
              <Form.Control
                as="textarea"
                placeholder="Leave a comment here"
                style={{ height: '100px' }}
                onChange={(e) => {
                  setHdata({ ...hdata, reason: e.target.value });
                }}
                ref={textareaRef} 
                value={hdata?.reason}
              />
            </FloatingLabel>
            <span style={{ color: "red" }}>{errors.reason}</span>

            <Button variant="primary" className='cheecc' style={{ width: "100%" }} onClick={() => handleSave()}>Update Holiday</Button>
          </Card.Body>
        </Card>) : null}

      <div style={{ display: "flex" }}>
        <div style={{ height: "50px" }}>
          {cards !== 'add' ? (
            <Button variant="warning" style={{ position: "absolute", right: 30 }} onClick={() => setCards("add")}>Add Holiday</Button>
          ) : null}
        </div>

        <div>
          {!showInput && (
            <Button variant="warning" style={{ position: "absolute", right: 150 }} onClick={handleAutoGenerateClick}>
              Auto Generate
            </Button>
          )}

          {showInput && (
            <div style={{ position: "absolute", right: 150 }}>
              <Form.Control
                type="text"
                placeholder="Enter the year"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button variant="primary" onClick={handleSubmitClick} style={{ marginTop: "10px" }}>
                Submit
              </Button>
              <Button variant="danger" onClick={() => { setShowInput(false); setInputValue("") }} style={{ marginTop: "10px" }}>
                Cancel
              </Button>
            </div>
          )}

          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <Toast.Header>
              <strong className="mr-auto">Success</strong>
            </Toast.Header>
            <Toast.Body>API call was successful!</Toast.Body>
          </Toast>
        </div>
      </div>

      <div style={{ width: "80%", margin: "1% auto" }}>
        <h4 style={{ marginBottom: "1%" }}>Holidays List</h4>
        <Table striped bordered hover >

          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Adhoc Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complete?.map((item, i) =>
              <tr>

                <td>{new Date(item?.date).toISOString().slice(0, 10)}</td>
                <td>{item?.reason}</td>
                {/* <td>{item?.user}</td> */}
                <td>{item.adhoc ? "Spontaneous" : "Scheduled"}</td>
                <td>
                  <i
                    className="bi bi-pencil-square"
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={(e) => handleEditClick(item?._id)}
                  ></i>&emsp;
                  <i
                    className="bi bi-trash"
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={(e) => handleDeleteClick(item?._id)}
                  ></i>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
