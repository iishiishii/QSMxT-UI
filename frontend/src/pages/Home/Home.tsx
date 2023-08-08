import React from "react";
import { Image, Typography, Divider } from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

// TODO - add loading for the image
const Home = () => {
  return (
    <div style={{ paddingLeft: 30 }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Image
          // width={200}
          preview={false}
          height={200}
          src="https://qsmxt-ui-images.s3.ap-southeast-2.amazonaws.com/logo.PNG"
        />
        <Title
          style={{
            fontSize: 100,
            paddingTop: 25,
            paddingLeft: 20,
            marginTop: 20,
          }}
        >
          QSMxT
        </Title>
      </div>
      <Divider />

      <Paragraph>
        <Text>
          QSMxT is an end-to-end software toolbox for QSM that excels at
          automatically reconstructing and processing QSM across large groups of
          participants using sensible defaults.
        </Text>
      </Paragraph>
      <Paragraph>
        <Text>
          Go to <Link to="/data">Data</Link> to upload either DICOMs or BIDS
          datasets for QSM.
        </Text>
      </Paragraph>

      <Paragraph>
        <Text>
          Go to <Link to="/run">Run</Link> to select and run your desired QSM
          reconstruction pipeline.
        </Text>
      </Paragraph>

      <Paragraph>
        <Text>
          Go to <Link to="/results">Results</Link> to view QSM images and
          analysis results.
        </Text>
      </Paragraph>
    </div>
  );
};

export default Home;
