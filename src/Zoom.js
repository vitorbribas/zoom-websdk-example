import "./Zoom.css";
import { ZoomMtg } from "@zoomus/websdk";
import { useEffect } from "react";

const crypto = require("crypto"); // crypto comes with Node.js

function generateSignature(apiKey, apiSecret, meetingNumber, role) {
  return new Promise((res, rej) => {
    // Prevent time sync issue between client signature generation and zoom
    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString(
      "base64"
    );
    const hash = crypto
      .createHmac("sha256", apiSecret)
      .update(msg)
      .digest("base64");
    const signature = Buffer.from(
      `${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`
    ).toString("base64");

    res(signature);
  });
}

var apiKey = "3zpEJzm4RqmfojlML2UMOw";
var apiSecret = "xm31V2jxKRD7GWG2kblwD5DhlARbk4qJ4Kbb";
var meetingNumber = 72351186265;
var leaveUrl = "http://localhost:3000"; // our redirect url
var userName = "Special Guest";
var signature = "";
generateSignature(apiKey, apiSecret, meetingNumber, 0).then((res) => {
  signature = res;
}); // need to generate based on meeting id - using - role by default 0 = javascript

const Zoom = () => {
  // loading zoom libraries before joining on component did mount
  useEffect(() => {
    showZoomDIv();
    ZoomMtg.setZoomJSLib("https://source.zoom.us/1.9.1/lib", "/av");
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();
    initiateMeeting();
  }, []);

  const showZoomDIv = () => {
    document.getElementById("zmmtg-root").style.display = "block";
  };

  const initiateMeeting = () => {
    ZoomMtg.init({
      leaveUrl: leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success);

        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          apiKey: apiKey,
          success: (success) => {
            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  };

  return <div className="App">Zoom</div>;
};

export default Zoom;
