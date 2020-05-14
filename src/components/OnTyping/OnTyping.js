import React from "react";
import "./OnTyping.css";

const OnTyping = () => {
    return (
        <div className="message-text message-text-left on-typing">
            <div id="circleG">
                <div id="circleG_1" className="circleG"></div>
                <div id="circleG_2" className="circleG"></div>
                <div id="circleG_3" className="circleG"></div>
            </div>
        </div>
    );
}

export default OnTyping;