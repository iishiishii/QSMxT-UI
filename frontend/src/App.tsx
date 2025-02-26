import { Layout, Menu, Image } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Data from "./pages/Data";
import Run from "./pages/Run";
import Results from "./pages/Results";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import apiClient from "./util/apiClient";
import { Page, SiteContext, context } from "./util/context";
import SelectorTree from "./components/SelectorTree/SelectorTree";
import io from "socket.io-client";
import { API_URL } from "./core/constants";
import Loading from "./pages/Loading";
import {
  FolderOpenOutlined,
  HomeOutlined,
  InsertRowLeftOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import { Cohorts, Job, JobNotification, QsmResult, Subject } from "./types";
import { handleJobNotification } from "./util/notifications";

const { Header, Content } = Layout;

const menuItems = [
  {
    key: Page.Home,
    label: "Home",
    icon: <HomeOutlined />,
  },
  {
    key: Page.Data,
    label: "Data",
    icon: <FolderOpenOutlined />,
  },
  {
    key: Page.Run,
    label: "Run",
    icon: <PlaySquareOutlined />,
  },
  {
    key: Page.Results,
    label: "Results",
    icon: <InsertRowLeftOutlined />,
  },
];

const styles = {
  content: {
    minHeight: "calc(100vh - 104px)", // diff = 50 pixels
    maxHeight: "calc(100vh - 104px)",
    padding: "24px",
    background: "#fff",
    width: "calc(100% - 38px)",
    margin: 20,
  },
  contentBody: {
    display: "flex",
    flexDirection: "row" as "row",
    width: "100%",
    minHeight: "calc(100vh - 154px)",
    maxHeight: "calc(100vh - 154px)",
  },
  flexBoxRow: {
    display: "flex",
    flexDirection: "row" as "row",
  },
};

const App = () => {
  const [cohorts, setCohorts] = useState<Cohorts | null>(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [queue, setQueue] = useState<Job[] | null>(null);
  const [qsmResults, setQsmResults] = useState<QsmResult[] | null>(null);
  const [history, setHistory] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<JobNotification>();

  const navigate = useNavigate();

  const fetchHistory = async () => {
    const history = await apiClient.getHistory();
    setHistory(history);
  };

  const fetchSubjectData = async () => {
    const subjects = await apiClient.getSubjects();
    setSubjects(subjects);
  };

  const fetchCohortData = async () => {
    const cohorts = await apiClient.getCohorts();
    setCohorts(cohorts);
  };

  const fetchQueueData = async () => {
    const newQueue = await apiClient.getJobsQueue();
    setQueue(newQueue);
  };

  const fetchQsmResults = async () => {
    const qsmResults = await apiClient.getQsmResults();
    setQsmResults(qsmResults);
  };

  const fetchAllData = async () => {
    fetchSubjectData();
    fetchCohortData();
    fetchQueueData();
    fetchHistory();
    fetchQsmResults();
  };

  useEffect(() => {
    fetchAllData();
    setInterval(() => {
      fetchAllData();
    }, 15 * 1000);
  }, []);

  useEffect(() => {
    if (!loading) {
      const notificationSocket = io(`${API_URL}/notifications`);
      notificationSocket.on("connect", () => {
        console.log("Connected");
        notificationSocket.on("data", (data: string) => {
          // console.log("notifications ", data);
          const jobNotification: JobNotification = JSON.parse(data);
          if (jobNotification !== undefined) {
            setNotification(jobNotification)
            handleJobNotification(notification as JobNotification, navigate);
          }
          fetchAllData();
        });
      });
    }
  }, [loading]);

  const selectedKey =
    window.location.pathname.split("/")[
      window.location.pathname.split("/").length - 1
    ] || "";

  const contextValue: SiteContext = {
    cohorts,
    subjects,
    selectedSubjects,
    selectedCohorts,
    queue,
    history,
    qsmResults,
    setSelectedCohorts,
    setSelectedSubjects,
    fetchSubjectData,
    fetchCohortData,
    navigate,
    fetchQueueData,
    page: selectedKey as Page,
  };

  return (
    <Layout>
      <div style={styles.flexBoxRow}>
        <Header style={{ width: "calc(100% - 320px)" }}>
          <Menu
            theme="dark"
            mode="horizontal"
            onClick={({ key }) => {
              navigate(`/${key}`);
            }}
            selectedKeys={[selectedKey]}
            items={loading ? [] : menuItems}
          />
        </Header>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            background: "#001529",
            color: "rgb(255, 255, 255)",
          }}
        >
          <b style={{ fontSize: 32, lineHeight: "64px", minHeight: "64px" }}>
            QSMxT
          </b>
          <div style={{ width: 112 }}>
            <Image
              preview={false}
              width={90}
              style={{ marginTop: 11, marginRight: 11, marginLeft: 11 }}
              height={42}
              src={`https://qsmxt-ui-images.s3.ap-southeast-2.amazonaws.com/menuBar.PNG`}
            />
          </div>
        </div>
      </div>
      <Content style={styles.content}>
        <context.Provider value={contextValue as any}>
          <div style={styles.contentBody}>
            {loading ? (
              <Loading setLoading={setLoading} />
            ) : (
              <>
                <SelectorTree />
                <div
                  style={{
                    overflowY: "scroll",
                    width: "100%",
                    paddingRight: 14,
                  }}
                >
                  <Routes>
                    <Route path={`/${Page.Home}`} element={<Home />} />
                    <Route path={`/${Page.Run}`} element={<Run />} />
                    <Route path={`/${Page.Data}`} element={<Data />} />
                    <Route path={`/${Page.Results}`} element={<Results />} />
                    <Route
                      path={"*"}
                      element={<Navigate to={`/${Page.Home}`} replace={true} />}
                    />
                  </Routes>
                </div>
              </>
            )}
          </div>
        </context.Provider>
      </Content>
    </Layout>
  );
};

export default App;
