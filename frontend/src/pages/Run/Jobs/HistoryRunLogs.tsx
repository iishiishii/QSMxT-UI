import { Drawer, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../core/constants";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

interface Props {
  historyLogOpened: string | null;
  setHistoryLogOpened: any;
}

const HistoryRunLogs: React.FC<Props> = (props: Props) => {
  const { historyLogOpened, setHistoryLogOpened } = props;

  const [logs, setLogs] = useState("");

  useEffect(() => {
    const getLogs = async () => {
      try {
        const x = await axios.get(`${API_URL}/logs/${historyLogOpened}.log`);
        console.log(x.data);
        setLogs(x.data);
      } catch (err) {
        setLogs("No logs available");
      }
    };
    getLogs();
  }, [historyLogOpened]);

  const renderLogs = (logs: string) => {
    return logs.split("\n").map((x) => {
      return (
        <div>
          {x.toLowerCase().includes("error") ? (
            <span style={{ color: "red" }}>{x}</span>
          ) : (
            x
          )}
          <br />
        </div>
      );
    });
  };

  const renderBody = () => {
    // let dateTime = new Date().toISOString();
    // const error = dateTime + ": " + logs.split('\n').find(line => line.includes("error"));
    return (
      <div>
        {/* {error && (
          <div>
            <Title style={{ marginTop: 0 }} level={5}>Error Occured:</Title>
            <span style={{ color: 'red' }}>{error}</span>
            <br />
            <br />
          </div>
        )} */}
        <Title style={{ marginTop: 0 }} level={5}>
          Logs
        </Title>
        {renderLogs(logs)}
      </div>
    );
  };

  return (
    <Drawer
      title="Run Logs"
      size="large"
      placement="right"
      onClose={() => setHistoryLogOpened(null)}
      open={!!historyLogOpened}
    >
      {!!historyLogOpened ? renderBody() : <div />}
    </Drawer>
  );
};

export default HistoryRunLogs;
