import React, { useEffect, useRef, useState } from "react";
import { Drawer, Spin, message } from "antd";
import io from "socket.io-client";
import { API_URL } from "../../../core/constants";

interface Props {
  openOngoingLog: boolean;
  setOpenOngoingLog: any;
}

const OngoingRunLogs = (props: Props) => {
  const { openOngoingLog, setOpenOngoingLog } = props;

  // const [socket, setSocket]: [any, any] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState("");

  const endRef = useRef(null);

  useEffect(() => {
    const socket = io(`${API_URL}/inProgress`);
    socket.on("receiveFile", function (data) {
      console.log(new Date().toISOString() + " receiveFile ", data);
      setData(data);
    });
    console.log(data);
  }, []);

  const renderBody = () => {
    return (
      <div>
        {loading && <Spin size="large" />}
        <br />
        {(data || "").split("\n").map((x) => {
          return (
            <div>
              {x}
              <br />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Drawer
      title="Run Logs"
      size="large"
      placement="right"
      onClose={() => {
        setOpenOngoingLog(false);
      }}
      open={openOngoingLog}
    >
      {openOngoingLog ? renderBody() : <div />}
    </Drawer>
  );
};

export default OngoingRunLogs;
