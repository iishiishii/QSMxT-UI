import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Popover,
  Radio,
  Select,
  Steps,
  Typography,
} from "antd";
import React, { useContext, useState } from "react";
import apiClient from "../../../util/apiClient";
import { Page, context } from "../../../util/context";
import ContentCard from "../../../containers/ContentCard";
import { SubjectUploadFormat } from "../../../types";

const { Text } = Typography;

const stepItems = [
  { title: "Data Type" },
  { title: "Configure" },
  { title: "Copy" },
];

const uploadHelperText = (
  <Text>
    Data for subjects can be uploaded in either the
    <br />
    BIDS or DICOM format.
  </Text>
);

const patientNamesHelperText = (
  <Text>
    Use the DICOM 'PatientName' field rather than 'PatientID' to identify
    subjects
  </Text>
);

const checkAllFilesHelperText = (
  <Text>
    Ignores the DICOM file extensions .dcm and .IMA and instead reads all files
    for valid
    <br />
    DICOM headers. This is useful if some of your DICOM files have unusual file
    extensions
    <br />
    or none at all.
  </Text>
);

const t2wHelperText = (
  <Text>
    Patterns used to identify series acquired for QSM, which must be
    T2*-weighted.
    <br />
    These patterns will be used to match the 'ProtocolName' field.
  </Text>
);

const t1wHelperText = (
  <Text>
    Patterns used to identify T1-weighted series acquired for segmentation.
    <br />
    These patterns will be used to match the 'ProtocolName' field.
  </Text>
);

const copyPathHelpererText = <Text>The path to your data.</Text>;

const styles = {
  smallHelpIcon: {
    color: "#1677ff",
    marginTop: 2,
    marginLeft: 5,
    fontSize: 13,
  },
  flexBox: { display: "flex", flexDirection: "row" as "row" },
};

const defaultT2ProtocolPatterns = ["*t2starw*", "*qsm*"];
const defaultT1ProtocolPatterns = ["*t1w*"];

const optionPrompt = {
  label: "Type a value to enter...",
  value: "STUB",
};

const dropZone = document.body;
if (dropZone) {
    const hoverClassName = "hover";

    // Handle drag* events to handle style
    // Add the css you want when the class "hover" is present
    dropZone.addEventListener("dragenter", function (e) {
        e.preventDefault();
        dropZone.classList.add(hoverClassName);
    });

    dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropZone.classList.add(hoverClassName);
    });

    dropZone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        dropZone.classList.remove(hoverClassName);
    });

    // This is the most important event, the event that gives access to files
    dropZone.addEventListener("drop", async function (e) {
      e.preventDefault();
      console.log("!!!!!!     ", e)
      dropZone.classList.remove(hoverClassName);
      console.log(await getFilesAsync(e.dataTransfer));
    });
};

async function getFilesAsync(dataTransfer: DataTransfer | null) {
  const files: File[] = [];
  console.log(dataTransfer)
  if (dataTransfer)
  {
    for (let i = 0; i < dataTransfer.items.length; i++) {
        const item = dataTransfer.items[i];
        console.log(item)
        if (item.kind === "file") {
            if (typeof item.webkitGetAsEntry === "function") {
                const entry = item.webkitGetAsEntry();
                console.log("entry is: ", entry)
                const entryContent = await readEntryContentAsync(entry as FileSystemEntry);
                files.push(...entryContent);
                continue;
            }

            const file = item.getAsFile();
            if (file) {
                files.push(file);
            }
        }
    }

    return files;
  }
}

// Returns a promise with all the files of the directory hierarchy
function readEntryContentAsync(entry: FileSystemEntry) {
  return new Promise<File[]>((resolve, reject) => {
      let reading = 0;
      const contents: File[] = [];

      readEntry(entry);

      function readEntry(entry: FileSystemEntry) {
          if (isFile(entry)) {
              reading++;
              entry.file(file => {
                  reading--;
                  contents.push(file);

                  if (reading === 0) {
                      resolve(contents);
                  }
              });
          } else if (isDirectory(entry)) {
              readReaderContent(entry.createReader());
          }
      }

      function readReaderContent(reader: FileSystemDirectoryReader) {
          reading++;

          reader.readEntries(function (entries) {
              reading--;
              for (const entry of entries) {
                  readEntry(entry);
              }

              if (reading === 0) {
                  resolve(contents);
              }
          });
      }
  });
}

// for TypeScript typing (type guard function)
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isDirectory(entry: FileSystemEntry): entry is FileSystemDirectoryEntry {
  return entry.isDirectory;
}

function isFile(entry: FileSystemEntry): entry is FileSystemFileEntry {
  return entry.isFile;
}

const UploadDataCard: React.FC = () => {
  const { navigate } = useContext(context);
  const [step, setStep] = useState(1);
  const [dataType, setDataType] = useState(SubjectUploadFormat.DICOM);
  const [usePatientNames, setUsePatientNames] = useState(false);
  const [useSessionDates, setUseSessionDates] = useState(false);
  const [checkAllFiles, setCheckAllFiles] = useState(false);
  const [t2starwProtocolPattern, setT2starwProtocol] = useState(
    defaultT2ProtocolPatterns,
  );
  const [t1wProtocolPattern, setT1wProtocolPattern] = useState(
    defaultT1ProtocolPatterns,
  );
  const [t2Options, setT2Options]: [any, any] = useState([optionPrompt]);
  const [t1Options, setT1Options]: [any, any] = useState([optionPrompt]);
  const [uploadPath, setUploadPath]: [string, (uploadPath: string) => void] =
    useState("");

  const badUploadPath = !!(
    uploadPath &&
    !uploadPath.includes("neurodesktop-storage") &&
    uploadPath.includes(":\\")
  );

  function handleUploadPath() {
    let input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;


  }

  const previousStep = () => {
    setStep(step - 1);
  };

  const nextStep = async () => {
    if (step === 3) {
      let success = false;
      if (dataType === SubjectUploadFormat.DICOM) {
        success = await apiClient.copyDicoms(
          uploadPath,
          usePatientNames,
          useSessionDates,
          checkAllFiles,
          t2starwProtocolPattern,
          t1wProtocolPattern,
        );
      }
      if (dataType === SubjectUploadFormat.BIDS) {
        success = await apiClient.copyBids(uploadPath);
      }
      // TODO - nifit data type
      if (success) {
        setStep(1);
      }
    } else {
      setStep(step + 1);
      setUploadPath("");
    }
  };

  const updateT2ProtocolOptions = (
    t2starwProtocolPattern: string[],
    input: string = "",
  ) => {
    const defaultOptions = defaultT2ProtocolPatterns
      .filter((pattern) => !t2starwProtocolPattern.includes(pattern))
      .map((pattern) => ({ label: pattern, value: pattern }));
    if (input) {
      setT2Options([
        ...defaultOptions,
        {
          label: input,
          value: input,
        },
      ]);
    } else {
      if (defaultOptions.length) {
        setT2Options([optionPrompt, ...defaultOptions]);
      } else {
        setT2Options([optionPrompt]);
      }
    }
  };

  const onChangeT2Protocol = (input: string) => {
    updateT2ProtocolOptions(t2starwProtocolPattern, input);
  };

  const onSelectT2Protocol = (protocol: string) => {
    if (protocol !== "STUB") {
      const newProtocols = [...t2starwProtocolPattern, protocol];
      setT2starwProtocol(newProtocols);
      updateT2ProtocolOptions(newProtocols);
    }
  };

  const onDeselectT2Protocol = (protocol: string) => {
    const newProtocols = t2starwProtocolPattern.filter((t2) => t2 !== protocol);
    setT2starwProtocol(newProtocols);
    updateT2ProtocolOptions(newProtocols);
  };

  const updateT1ProtocolOptions = (
    t1wProtocolPattern: string[],
    input: string = "",
  ) => {
    const defaultOptions = defaultT1ProtocolPatterns
      .filter((pattern) => !t1wProtocolPattern.includes(pattern))
      .map((pattern) => ({ label: pattern, value: pattern }));
    if (input) {
      setT1Options([
        ...defaultOptions,
        {
          label: input,
          value: input,
        },
      ]);
    } else {
      if (defaultOptions.length) {
        setT1Options([optionPrompt, ...defaultOptions]);
      } else {
        setT1Options([optionPrompt]);
      }
    }
  };

  const onChangeT1Protocol = (input: string) => {
    updateT1ProtocolOptions(t1wProtocolPattern, input);
  };

  const onSelectT1Protocol = (protocol: string) => {
    if (protocol !== "STUB") {
      const newProtocols = [...t1wProtocolPattern, protocol];
      setT1wProtocolPattern(newProtocols);
      updateT1ProtocolOptions(newProtocols);
    }
  };

  const onDeselectT1Protocol = (protocol: string) => {
    const newProtocols = t1wProtocolPattern.filter((t2) => t2 !== protocol);
    setT1wProtocolPattern(newProtocols);
    updateT1ProtocolOptions(newProtocols);
  };

  const renderDataTypeStep = () => {
    return (
      <div>
        <Text>Which type of subject data are you uploading?</Text>
        <br />
        <Radio.Group
          onChange={(e) => setDataType(e.target.value)}
          value={dataType}
        >
          <Radio value={SubjectUploadFormat.DICOM}>DICOM</Radio>
          <Radio value={SubjectUploadFormat.BIDS}>BIDS</Radio>
          {/* <Radio value={SubjectDataType.NIFTI}>Nifti</Radio> */}
        </Radio.Group>
      </div>
    );
  };

  const renderDicomConfigureStep = () => {
    return (
      <div>
        <div style={styles.flexBox}>
          <Text>Use patient names?</Text>
          <Popover title={null} content={patientNamesHelperText}>
            <QuestionCircleOutlined style={styles.smallHelpIcon} />
          </Popover>
        </div>
        <Radio.Group
          onChange={(e) => setUsePatientNames(e.target.value)}
          value={usePatientNames}
        >
          <Radio.Button value={true}>Yes</Radio.Button>
          <Radio.Button value={false}>No</Radio.Button>
        </Radio.Group>
        <br />
        <br />
        <div style={styles.flexBox}>
          <Text>Check all files?</Text>
          <Popover title={null} content={checkAllFilesHelperText}>
            <QuestionCircleOutlined style={styles.smallHelpIcon} />
          </Popover>
        </div>
        <Radio.Group
          onChange={(e) => setCheckAllFiles(e.target.value)}
          value={checkAllFiles}
        >
          <Radio.Button value={true}>Yes</Radio.Button>
          <Radio.Button value={false}>No</Radio.Button>
        </Radio.Group>
        <br />
        <br />
        <div style={styles.flexBox}>
          <Text>T2*-Weighted Protocol Pattern?</Text>
          <Popover title={null} content={t2wHelperText}>
            <QuestionCircleOutlined style={styles.smallHelpIcon} />
          </Popover>
        </div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please entere a protocol pattern..."
          value={t2starwProtocolPattern}
          options={t2Options}
          onSearch={onChangeT2Protocol}
          onSelect={onSelectT2Protocol}
          onDeselect={onDeselectT2Protocol}
        />
        <br />
        <br />
        <div style={styles.flexBox}>
          <Text>T1-Weighted Protocol Pattern?</Text>
          <Popover title={null} content={t1wHelperText}>
            <QuestionCircleOutlined style={styles.smallHelpIcon} />
          </Popover>
        </div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please entere a protocol pattern..."
          value={t1wProtocolPattern}
          options={t1Options}
          onSearch={onChangeT1Protocol}
          onSelect={onSelectT1Protocol}
          onDeselect={onDeselectT1Protocol}
        />
      </div>
    );
  };

  const renderBidsConfigureStep = () => {
    return <div></div>;
  };

  const renderNiftiConfigureStep = () => {
    return <div>TODO</div>;
  };

  const renderConfigureStep = () => {
    if (dataType === SubjectUploadFormat.DICOM) {
      return renderDicomConfigureStep();
    }
    if (dataType === SubjectUploadFormat.BIDS) {
      return renderBidsConfigureStep();
    }
    if (dataType === SubjectUploadFormat.NIFTI) {
      return renderNiftiConfigureStep();
    }
    return <div />;
  };

  const renderUploadStep = () => {
    return (
      <div>
        <div style={styles.flexBox}>
          <Text>Enter a file path to copy files from</Text>
          <Popover title={null} content={copyPathHelpererText}>
            <QuestionCircleOutlined style={styles.smallHelpIcon} />
          </Popover>
        </div>
        <Input
          placeholder="Enter a path..."
          onChange={(e) => setUploadPath(e.target.value)}
          value={uploadPath}
        />
        {badUploadPath && (
          <div style={{ color: "red" }}>
            Folder must be within your "neurodesktop-storage" folder
          </div>
        )}
      </div>
    );
  };

  return (
    <ContentCard
      title={"Upload Data"}
      width={530}
      Icon={UploadOutlined}
      helperText={uploadHelperText}
      loading={false}
    >
      <Steps size="small" current={step - 1} items={stepItems} />
      <br />
      {step === 1 && renderDataTypeStep()}
      {step === 2 && renderConfigureStep()}
      {step === 3 && renderUploadStep()}
      <br />
      <Button
        disabled={step === 1}
        onClick={previousStep}
        style={{ marginRight: 1 }}
      >
        Previous
      </Button>
      <Button
        type="primary"
        disabled={step === 3 && (badUploadPath || !uploadPath)}
        onClick={nextStep}
      >
        {step !== 3 ? "Next" : " Finish"}
      </Button>
    </ContentCard>
  );
};

export default UploadDataCard;
