import axios from "axios";
import {
  CARD_FETCH_REQUEST,
  CARD_FETCH_SUCCESS,
  CARD_FETCH_FAIL,
} from "./cardTypes";

// const host = "localhost";
const host = "10.82.126.73"
const port = 5051;

export const cardFetchRequest = () => {
  return {
    type: CARD_FETCH_REQUEST,
  };
};

export const cardFetchSuccess = (cards) => {
  return {
    type: CARD_FETCH_SUCCESS,
    payload: cards,
  };
};

export const cardFetchFail = (error) => {
  return {
    type: CARD_FETCH_FAIL,
    error: error,
  };
};

export const getCards = (fromDateSt, toDateSt) => {
  return (dispatch) => {
    dispatch(cardFetchRequest());
    axios
      .get(`http://${host}:${port}/card/find/fromDate/${fromDateSt}/toDate/${toDateSt}`)
      .then((result) => {
        dispatch(cardFetchSuccess(result.data));
      })
      .catch((error) => {
        dispatch(cardFetchFail(error.message));
      });
  };
};
