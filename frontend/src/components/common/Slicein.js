import React, { useEffect } from "react";
import "./SlideInNotification.css"; // Import the CSS file
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const SlideInNotification = ({ message, duration, type, handleDownloadExcel }) => {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            const notificationElement = document.getElementById("notification");
            if (notificationElement) {
                notificationElement.classList.remove("show");
                notificationElement.style.display = "none";
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);


    const changeLocation = () => {
        navigate('/pendingOld')
    }

    return (<>

        <div
            id="notification"
            className={`slide-in-notification show ${type}`
            }
        >
            <div style={{padding: "1%"}}>
                <h1>Some cards are pending </h1><br />
                <p style={{ borderBottom: "1px solid", borderTop: "1px solid", cursor: "pointer" }} onClick={() => handleDownloadExcel()} >Click here to Download</p>
            </div>
            {/* {message} */}
        </div>


    </>);
};

export default SlideInNotification;
