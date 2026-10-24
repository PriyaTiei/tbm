import React, { useEffect, useState, Fragment, useReducer } from "react";
// import FlowSmileCard from "./FlowSmileCard";
import { useDispatch, useSelector } from "react-redux";
import { getCheckItem } from "../redux/checkItem/checkItemsActions";
import { useLocation, useSearchParams } from "react-router-dom";
import Loading from "./Loading";
import SmileCardDetails from "./SmileCardDetails";
import SmileCardModify from "./SmileCardModify";
import axios from "axios";
import AbnormalityRecordModalForm from "./AbnormalityRecordModalForm";
import { toast } from "react-toastify";
import { setCheckedBy } from "../redux/checkedBy"
import JudgementHistoryModel from "./JudgementHistoryModel";
import { Card } from "react-bootstrap";


function SmileCard() {
  const [modify, setModify] = useState(false);
  const [image, setImage] = useState(null);
  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;

  const [mspecs, setMspecs] = useState([])

  // get query string from link
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showJudgementHistoryModel, setShowJudgementHistoryModel] = useState(false);

  const filters = useSelector((state) => state.filters);

  // If processNo was cut off by an unencoded '#' into location.hash, or unencoded '&' in location.search, recover it:
  let processNoParam = searchParams.get("processNo");
  if ((!processNoParam || processNoParam === "") && location.hash) {
    processNoParam = location.hash;
  }
  if (location.search && location.search.includes("processNo=")) {
    try {
      const searchRaw = location.search.substring(1);
      const idx = searchRaw.indexOf("processNo=");
      if (idx !== -1) {
        const afterProcess = searchRaw.substring(idx + "processNo=".length);
        const nextParamMatch = afterProcess.match(/&(?:line|d|w|m|y|pS|rS|page)=/i);
        let extracted = nextParamMatch ? afterProcess.substring(0, nextParamMatch.index) : afterProcess;
        extracted = decodeURIComponent(extracted.replace(/\+/g, " "));
        if (extracted && extracted.length > (processNoParam || "").length) {
          processNoParam = extracted;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const queryParams = [];
  if (filters.d !== undefined && filters.d !== null && filters.d !== "") queryParams.push(`d=${filters.d}`);
  if (filters.w !== undefined && filters.w !== null && filters.w !== "") queryParams.push(`w=${filters.w}`);
  if (filters.m !== undefined && filters.m !== null && filters.m !== "") queryParams.push(`m=${filters.m}`);
  if (filters.y !== undefined && filters.y !== null && filters.y !== "") queryParams.push(`y=${filters.y}`);
  if (filters.pS !== undefined && filters.pS !== null && filters.pS !== "") queryParams.push(`pS=${filters.pS}`);
  if (filters.rS !== undefined && filters.rS !== null && filters.rS !== "") queryParams.push(`rS=${filters.rS}`);

  let processNoAdded = false;
  for (const [key, val] of searchParams.entries()) {
    if (key === "processNo") {
      const pVal = processNoParam || val;
      if (pVal !== "" && pVal !== undefined && pVal !== null) {
        queryParams.push(`processNo=${encodeURIComponent(pVal)}`);
        processNoAdded = true;
      }
    } else if (val !== "" && val !== undefined && val !== null) {
      // Avoid pushing leftover fragment keys caused by unencoded '&' in processNo
      if (!processNoParam || !processNoParam.includes(key)) {
        queryParams.push(`${key}=${encodeURIComponent(val)}`);
      }
    }
  }

  if (!processNoAdded && processNoParam) {
    queryParams.push(`processNo=${encodeURIComponent(processNoParam)}`);
  }

  let queryStr = queryParams.join("&");
  let entryForQueryStr = `${filters.y}-${filters.m}-${filters.dt}`;
  for (const [f, v] of searchParams.entries()) {
    if (!queryParams.some((item) => item.startsWith(`${f}=`))) {
      queryStr = queryStr + (queryStr ? "&" : "") + f + "=" + encodeURIComponent(v);
    }
  }

  //use hooks
  const [page, setPage] = useState(1);

  let disabledPrevious = page < 2 ? "disabled" : null;

  const dispatch = useDispatch();
  const checkItems = useSelector((state) => state.checkItems);
  const [relativeUrl, setRelativeUrl] = useState('');

  useEffect(() => {
    if ("changedPage" in localStorage) {
      setPage(localStorage.getItem("changedPage"))
      localStorage.removeItem("changedPage")
    }
  }, []);
  // const {checkedBy} = checkItems.checkItem.headCheckList[0] ? checkItems.checkItem.headCheckList[0] :""

  // console.log("checkItems", checkItems)

  useEffect(() => {
    dispatch(getCheckItem(queryStr, page, entryForQueryStr));
  }, [
    dispatch,
    page,
    searchParams,
    location.hash,
    filters,
    modify,
    entryForQueryStr,
    queryStr,
  ]);

  // unpack object
  const { loading, checkItem } = checkItems;


  const checkedBy = useSelector(state => state.checkedBy)
  const [checkedByCurrent, setCheckedByCurrent] = useState(checkedBy);




  let list = loading
    ? {}
    : checkItem.success
      ? (checkItems.checkItem.headCheckList && checkItems.checkItem.headCheckList[0]) || {}
      : {};

  let totalCount = loading
    ? 0
    : checkItem.success
      ? checkItems.checkItem.totalCount || 0
      : 0;
  let disabledNext = page < totalCount ? null : "disabled";
  const changePage = () => {
    setPage(page + 1);
  };
  const changePageMinus = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  const modifyHandler = () => {
    setModify(!modify);
  };

  const deleteItem = (itemId) => {
    axios
      .delete(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/delete/${itemId}`
      )
      .then((result) => {
        toast.success("deleted check item ");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      })
      .catch((err) => {
        toast.error("error deleting check item ");
      });
  };

  const deleteConfirmation = () => {
    if (window.confirm("Are you sure you want to Delete this item?")) {
      deleteItem(list._id);
    } else {
      // Do nothing!
    }
  }

  const getStatusLabel = (list, type) => {
    if (!list || list.length === 0) return "";

    const check = list[0];  // Assuming you want to check only the first item

    const verifyKey = `${type}Verify`;
    const atKey = `${type}At`;
    const commentKey = `${type}Comment`;

    if (check[verifyKey] && (check.dailyStatus === "OK" || check.dailyStatus === "NG")) {
      if (check[atKey]) {
        if (!check[commentKey] || check[commentKey].trim() === "") {
          return `${type.toUpperCase()} Approved`;
        } else {
          return `${type.toUpperCase()} Commented: ${check[commentKey]}`;
        }
      } else {
        return `${type.toUpperCase()} Pending from their side`;
      }
    }

    return ""; // Default return if none of the conditions are met
  };


  const checkedByHandler = (e) => {
    setCheckedByCurrent(e.target.value);
  };

  useEffect(() => {
    dispatch(setCheckedBy(checkedByCurrent))
  }, [checkedByCurrent])

  return (
    <Fragment>
      <div className="overflow-auto" style={{ height: "85vh", paddingBottom: "10%" }}>
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
              Page {page} of {totalCount}
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

          {auth.isAuthenticated && (
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i
                className="bi bi-record-btn pe-2"
                style={{ fontSize: "1rem", color: "dark" }}
              ></i>
              Record Abnormality
            </button>
          )}
          {level >= 20 && (
            <button className="btn btn-warning mx-2" onClick={modifyHandler}>
              <i
                className="bi bi-pencil"
                style={{ fontSize: "1rem", color: "dark" }}
              ></i>
              {modify ? " Back" : " Modify"}
            </button>
          )}

          {level >= 100 && (
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
          )}

          {level >= 10 && (
            <input
              type="text"
              className="mx-2"
              placeholder="Checked by"
              value={checkedByCurrent}
              onChange={checkedByHandler}
            />
          )}

          <button
            className="btn btn-success"
            onClick={() => setShowJudgementHistoryModel(true)}
            // data-toggle="tooltip"
            // data-placement="top"
            title="History"
          >
            Judgement History
          </button>
          {console.log("checkItemcheckItem", checkItem?.headCheckList && checkItem?.headCheckList[0])}
          <div className="p-3 bg-light rounded text-center" style={{ fontFamily: "Arial, sans-serif" }}>
            <p className="mb-2 font-weight-bold text-dark">
              {getStatusLabel(checkItem?.headCheckList, "tl")}
            </p>
            <p className="mb-0 font-weight-bold text-dark">
              
            </p>
          </div>
          <Card className="p-1 text-center" style={{ maxWidth: "400px", margin: "auto" }}>
            <Card.Body>
              <Card.Subtitle className="text-muted" style={{ fontSize: "16px", fontWeight: "500" }}>
                {getStatusLabel(checkItem?.headCheckList, "tl")} <br />
                {getStatusLabel(checkItem?.headCheckList, "gl")}
              </Card.Subtitle>
            </Card.Body>
          </Card>

        </div>
        {loading ? (
          <Loading />
        ) : (
          <Fragment>
            {checkItem.success && totalCount > 0 ? (
              modify ? (
                <SmileCardModify list={list} image={image} setImage={setImage} />
              ) : (
                <div >
                  <SmileCardDetails
                    list={list}
                    image={image}
                    setImage={setImage}
                    setRecordAbnormalityShowModal={setShowModal}
                    checkItems={checkItems}
                    setMspecsAbnormal={setMspecs}
                  />

                  {showModal ? (
                    <AbnormalityRecordModalForm
                      showModal={showModal}
                      setShowModal={setShowModal}
                      workDetail={list.workDetail}
                      itemId={list._id}
                      mspecs={mspecs}
                    />
                  ) : null}
                  {
                    showJudgementHistoryModel && (
                      <JudgementHistoryModel showModal={showJudgementHistoryModel} setShowModal={setShowJudgementHistoryModel} checkItem={list._id} />
                    )
                  }
                </div>
              )
            ) : (
              <div className="alert alert-warning text-center m-4 p-4 shadow-sm">
                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: "2rem" }}></i>
                <h5 className="mt-2">No Checklist Cards Found</h5>
                <p className="text-muted mb-0">
                  No cards found matching current filters (Line: {searchParams.get("line") || "All"}, Process: {searchParams.get("processNo") || location.hash || "All"}).
                </p>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

export default SmileCard;
