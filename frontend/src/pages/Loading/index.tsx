import React, { useEffect, useState } from "react";
import { Image, Progress, Spin } from "antd";
import apiClient from "../../util/apiClient";

interface Props {
  setLoading: (loading: boolean) => void;
}

// rewrite useeffect hook to wait till status is ok
export async function waitUntilServerIsUp(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    async function checkUrl() {
      const { status } = await apiClient.getStatus();
      if (status === "ok") {
        return resolve(true);
      } else {
        console.log("Server is not up yet");
        setTimeout(async () => {
          await checkUrl();
        }, 6500);
      }
    }

    checkUrl();
  });
}

export async function waitForDuration(duration: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, duration);
  });
}

const LoadingPage: React.FC<Props> = ({ setLoading }) => {
  Promise.race([waitUntilServerIsUp(), waitForDuration(10000)]).then(
    (up: boolean) => {
      if (up) {
        console.log("Server is up");
        setLoading(false);
      } else {
        console.debug("Server didn't start in time");
      }
    },
  );

  return (
    <div
      style={{
        minWidth: "100%",
        minHeight: "100%",
        marginTop: 80,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <div style={{ minWidth: 350, minHeight: 350 }}>
        <Image
          preview={false}
          // width={200}
          height={350}
          src="https://qsmxt-ui-images.s3.ap-southeast-2.amazonaws.com/logo.PNG"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 30 }}>
        <Progress
          size={200}
          type="circle"
          percent={75}
          style={{ marginLeft: 25, marginBottom: 18 }}
        />
        <b style={{ fontSize: 60 }}>
          Loading <Spin size="large" />
        </b>
      </div>
    </div>
  );
};

export default LoadingPage;
