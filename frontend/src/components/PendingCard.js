import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/smilecard.module.css";

function PendingCard(props) {
  const { processNo, line , counts, result } = props;

  let statusColor = "rgba(76,76,255)";
   

  return (
    <Fragment>
      <Link
        to={`/checkList?line=${line}&processNo=${processNo}`}
        style={{ textDecoration: "none" }}
      >
        <div
          className={`card  mx-3 mb-3  ${styles.bg} ${styles.translate}`}
          style={{ width: "8vmax", backgroundColor: statusColor, color:"white" }}
        >
          <div className="card-header">
            <h6 className="text-center">{processNo} </h6>
          </div>
          <div className="m-auto">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "3rem", color: "white" }}
            ></i>
          </div>
          <div className="text-center">Total {counts} </div>
          <div style={{
            height : 10
          }}></div>
          {result === 'PENDING' && <div className="text-center">
               PENDING
            </div>}
        </div>
      </Link>
    </Fragment>
  );
}

export default PendingCard;