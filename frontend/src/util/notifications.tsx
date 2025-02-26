import React from "react";
import { JobNotification, JobStatus, JobType } from "../types";
import { notification } from "antd";
import { NavigateFunction } from "react-router-dom";
import { Page } from "./context";

export const handleJobNotification = (
  jobNotification: JobNotification,
  navigate: NavigateFunction,
) => {
  const { job } = jobNotification;
  if (job.status === JobStatus.NOT_STARTED) {
    notification.info({
      message: `${job.type} job added to queue`,
      description: (
        <div>
          View the queue in the{" "}
          <a
            onClick={() => {
              navigate(`/${Page.Run}`);
            }}
          >
            Run Page
          </a>
        </div>
      ),
      placement: "topRight",
      duration: 6,
    });
  } else if (job.status === JobStatus.COMPLETE) {
    let description = <div />;
    if (job.type === JobType.DICOM_SORT) {
      description = <div>Dicom conversion will now commence</div>;
    } else if (
      job.type === JobType.DICOM_CONVERT ||
      job.type === JobType.BIDS_COPY
    ) {
      description = (
        <div>
          Subject data are now viewable in{" "}
          <a
            onClick={() => {
              navigate(`/${Page.Data}`);
            }}
          >
            Data
          </a>
        </div>
      );
    } else if (job.type === JobType.QSM) {
      description = (
        <div>
          QSMs are now viewable in{" "}
          <a
            onClick={() => {
              navigate(`/${Page.Results}`);
            }}
          >
            Results
          </a>
        </div>
      );
    } else if (job.type === JobType.SEGMENTATION) {
      description = (
        <div>
          Analyses are now viewable in{" "}
          <a
            onClick={() => {
              navigate(`/${Page.Results}`);
            }}
          >
            Results
          </a>
        </div>
      );
    }
    notification.success({
      message: `${job.type} succesfully finished`,
      description,
      placement: "topRight",
      duration: 6,
    });
  } else if (job.status === JobStatus.FAILED) {
    notification.error({
      message: `${job.type} failed`,
      description: (
        <div>
          <a
            onClick={() => {
              navigate(`/${Page.Run}?openView=history&openJob=${job.id}`);
            }}
          >
            View the Logs
          </a>{" "}
          to determine the cause
        </div>
      ),
      placement: "topRight",
      duration: 6,
    });
  }
};
