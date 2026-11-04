import React, { useEffect, useState, Fragment } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AlldelMachineSmileCardDetails from "./AlldelMachineCardDetails";
import axios from "axios";
import { toast } from "react-toastify";
import SmileCardModify from "../SmileCardModify";

export default function AlldelMachineSmileCard() {
  const [modify, setModify] = useState(false);
  const [image, setImage] = useState(null);
  const reduxProcessData = useSelector((state) => state.processData.processData);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  let processData = reduxProcessData;
  if (!processData || processData.length === 0) {
    if (location.state?.processData) {
      processData = location.state.processData;
    } else if (window.history.state?.processData) {
      processData = window.history.state.processData;
    }
  }
  processData = processData || [];

  const urlPage = parseInt(searchParams.get("page"), 10);
  const initialPage = (!isNaN(urlPage) && urlPage > 0) ? urlPage : 1;
  const [page, setPage] = useState(initialPage);
  const [list, setList] = useState();

  // Sync state with URL search parameters
  useEffect(() => {
    const p = parseInt(searchParams.get("page"), 10);
    if (!isNaN(p) && p > 0 && p !== page) {
      setPage(p);
    }
  }, [searchParams]);

  // Handle popstate for back button
  useEffect(() => {
    const handlePopState = (e) => {
      const statePage = e.state?.page;
      const params = new URLSearchParams(window.location.search);
      const paramPage = parseInt(params.get("page"), 10);
      const target = statePage || (!isNaN(paramPage) && paramPage > 0 ? paramPage : 1);
      setPage(target);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Ensure history has page state
  useEffect(() => {
    const currentState = window.history.state || {};
    if (currentState.page !== page || !currentState.processData) {
      window.history.replaceState({ ...currentState, page, processData }, "", window.location.href);
    }
  }, [page, processData]);

  const idIndex = page - 1;

  const getMachineById = async () => {
    if (!processData[idIndex] || !processData[idIndex].id) return;
    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/machine/${processData[idIndex].id}`
      );
      let data = response.data;
      setList(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMachineById();
  }, [page, modify, processData]);

  const changePage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const newParams = new URLSearchParams(location.search);
    newParams.set("page", String(nextPage));
    window.history.pushState(
      { ...(window.history.state || {}), page: nextPage, processData },
      "",
      `${location.pathname}?${newParams.toString()}`
    );
  };

  const changePageMinus = () => {
    if (page > 1) {
      if (window.history.state && window.history.state.page === page) {
        window.history.back();
      } else {
        const prevPage = page - 1;
        setPage(prevPage);
        const newParams = new URLSearchParams(location.search);
        newParams.set("page", String(prevPage));
        window.history.pushState(
          { ...(window.history.state || {}), page: prevPage, processData },
          "",
          `${location.pathname}?${newParams.toString()}`
        );
      }
    }
  };

  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;

  const counts = processData.length;

  let disabledPrevious = page < 2 ? "disabled" : null;
  let disabledNext = page < counts ? null : "disabled";

  const modifyHandler = () => {
    setModify(!modify);
  };

  // const deleteItem = (itemId) => {
  //   axios
  //     .delete(
  //       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/delete/${itemId}`
  //     )
  //     .then((result) => {
      
  //       toast.success("deleted check item ");
  //     })
  //     .catch((err) => {
        
  //       toast.error("error deleting check item ");
  //     });
  // };

  // const deleteConfirmation = () => {
  //   if (window.confirm("Are you sure you want to Delete this item?")) {
  //     deleteItem(list._id);
  //   } else {
  //     // Do nothing!
  //   }
  // };

  return (
    <Fragment>
      <div className="d-flex flex-wrap my-2">
        <div className="d-flex allign-middle">
          <button
            className={`btn btn-sm btn-info mx-2 ${disabledPrevious} `}
            onClick={changePageMinus}
          >
            <i
              className="bi bi-arrow-left-circle-fill px-1"
              style={{ fontSize: "1.1rem", color: "dark" }}
            ></i>{" "}
            {`Previous Page`}
          </button>
          <p>
            Page {page} of {counts}
          </p>
          <button
            className={`btn btn-sm btn-info mx-2 ${disabledNext}`}
            onClick={changePage}
          >
            {`Next page`}
            <i
              className="bi bi-arrow-right-circle-fill px-1"
              style={{ fontSize: "1.1rem", color: "dark" }}
            ></i>
          </button>
        </div>


        {level >= 20 && (
          <button className="btn btn-warning mx-2" onClick={modifyHandler}>
            <i
              className="bi bi-pencil"
              style={{ fontSize: "1rem", color: "dark" }}
            ></i>
            {modify ? " Back" : " Modify"}
          </button>
        )}

        {/* {level >= 100 && (
          <button
            className="btn btn-danger"
            onClick={deleteConfirmation}
            // data-toggle="tooltip"
            // data-placement="top"
            title="Delete the entry"
          >
            <i
              className="bi bi-trash"
              style={{ fontSize: "1.3rem", color: "white" }}
            ></i>
            Delete
          </button>
        )} */}
      </div>
      {modify ? (
        <SmileCardModify list={list} image={image} setImage={setImage} />
      ) : list ? (
        <AlldelMachineSmileCardDetails list={list} />
      ) : (
        <div>No data found</div>
      )}
    </Fragment>
  );
}
