import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Upload,
  Collapse,
  Table,
  Descriptions,
  Select,
  UploadProps,
  message,
  Card,
  Typography,
  Popover,
  Divider,
  Row,
  Col,
  Drawer,
} from "antd";
import React, { useEffect, useState } from "react";
import NiiVue from "../../../components/NiiVue/NiiVue";
import { context } from "../../../util/context";
import { Subject, SubjectsTree } from "../../../types";
import { API_URL } from "../../../core/constants";
import axios from "axios";

interface Props {
  subject: Subject;
  run: string;
  imageName: string[];
  session: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const { Panel } = Collapse;

const { Title, Paragraph, Text } = Typography;

const SubjectDetailDrawer: React.FC<Props> = ({
  subject,
  run,
  open,
  imageName,
  setOpen,
  session,
}) => {
  const [imageMetadata, setImageMetadata]: [any, any] = useState({});
  const [anatImage, setAnatImage] = useState(imageName[0]);

  useEffect(() => {
    const getMetadata = async () => {
      const metadataUrl = `${API_URL}/bids/${subject.subject}/${session}/anat/${anatImage}.json`;
      const response = await axios.get(metadataUrl);
      setImageMetadata(response.data);
    };
    if (open) {
      getMetadata();
    }
  }, [open]);

  const onChangeAnatImage = (e: any) => {
    setAnatImage(e);
  };

  const renderImageAndDescriptions = () => {
    const imageUrl = `${API_URL}/bids/${subject.subject}/${session}/anat/${anatImage}.nii`;
    const columns = [
      {
        title: "Field",
        dataIndex: "field",
        key: "field",
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
      },
    ];

    const dataSource = Object.keys(imageMetadata).map((key) => ({
      field: key,
      value: imageMetadata[key],
    }));

    return (
      <div>
        <Title style={{ marginTop: 10 }} level={3}>
          NIfTI Image
        </Title>
        <div style={{ maxHeight: "680px" }}>
          <NiiVue imageUrl={imageUrl} key={imageUrl} />
        </div>
        <br />
        <Title style={{ marginTop: 10 }} level={3}>
          Details
        </Title>
        <div>
          <Table
            columns={columns}
            dataSource={dataSource.sort((a, b) => {
              if (a.field < b.field) {
                return -1;
              }
              return 1;
            })}
            size="small"
          />
        </div>
      </div>
    );
  };

  const renderBody = () => {
    const imageOptions = imageName.map((image) => ({
      label: image,
      value: image,
    }));

    return (
      <div>
        <Title style={{ marginTop: 10 }} level={3}>
          Options
        </Title>
        <Drawer />
        <Title style={{ marginTop: 10 }} level={5}>
          Select an image:{" "}
        </Title>
        <Select
          value={anatImage}
          style={{ width: "100%" }}
          onChange={onChangeAnatImage}
          options={imageOptions}
        />
        <br />
        <br />
        {renderImageAndDescriptions()}
      </div>
    );
  };

  return (
    <div>
      <Drawer
        title={open ? `Subject: ${subject.subject} - Session: ${session}` : ""}
        placement="left"
        open={open}
        size="large"
        onClose={() => setOpen(false)}
      >
        {open ? renderBody() : <div />}
      </Drawer>
    </div>
  );
};

export default SubjectDetailDrawer;
