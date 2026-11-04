import React, { useEffect, useState, Fragment } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";  
import PendingSmileCardDetails from "./PendingSmileCardDetails";  
import { setCheckedBy } from "../../redux/checkedBy";
import axios from "axios"; 

export default function PendingSmileCard() { 
  const reduxProcessData = useSelector((state) => state.processData.processData);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Recover processData from location.state, history.state, or sessionStorage if Redux is empty
  let processData = reduxProcessData;
  if (!processData || processData.length === 0) {
    if (location.state?.processData) {
      processData = location.state.processData;
    } else if (window.history.state?.processData) {
      processData = window.history.state.processData;
    } else {
      try {
        const stored = sessionStorage.getItem("tbm_pending_processData");
        if (stored) processData = JSON.parse(stored);
      } catch (e) {}
    }
  }
  processData = processData || [];

  const urlPage = parseInt(searchParams.get("page"), 10);
  const initialPage = (!isNaN(urlPage) && urlPage > 0) ? urlPage : 1;
  const [page, setPage] = useState(initialPage);
  const [list, setList] = useState();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;

  const checkedBy = useSelector(state => state.checkedBy)
  const [checkedByCurrent, setCheckedByCurrent] = useState(checkedBy);

  // Sync state with URL search parameters (for back / forward navigation)
  useEffect(() => {
    const p = parseInt(searchParams.get("page"), 10);
    if (!isNaN(p) && p > 0 && p !== page) {
      setPage(p);
    }
  }, [searchParams]);

  // Listen to standard browser popstate events
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

  // Ensure current history entry has page state and processData
  useEffect(() => {
    const currentState = window.history.state || {};
    if (currentState.page !== page || !currentState.processData) {
      window.history.replaceState({ ...currentState, page, processData }, "", window.location.href);
    }
  }, [page, processData]);

  const idIndex = page - 1;

  const getMachineById = async () => {
    if (!processData[idIndex] || !processData[idIndex].checkItem) return;
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/machine/${processData[idIndex].checkItem}`); 
      let data = response.data;
      setList(data.data);
    } catch (error) {
      console.error(error);
    }
  }; 

  useEffect(() => {
    getMachineById();
  }, [page, processData]);

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

  const counts = processData.length; 

  let disabledPrevious = page < 2 ? "disabled" : null;
  let disabledNext = page < counts ? null : "disabled"; 


  const checkedByHandler = (e) => {
    setCheckedByCurrent(e.target.value);
  };

  useEffect(() => {
    dispatch(setCheckedBy(checkedByCurrent))
  }, [checkedByCurrent]) 

  return (
    <Fragment>
      <div className="d-flex flex-wrap my-2 ">
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
        {level >= 10 && (
            <input
              type="text"
              className="mx-2"
              placeholder="Checked by"
              value={checkedByCurrent}
              onChange={checkedByHandler}
            />
          )}

      </div>
      {list ? (
        <PendingSmileCardDetails list={list}  entryFor={processData[idIndex]?.entryDates?.[0]}  />
      ) : (
        <div>No data found</div>
      )}
    </Fragment>
  );
}
