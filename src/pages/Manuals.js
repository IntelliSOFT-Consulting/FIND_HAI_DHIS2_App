import { useState, useEffect } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import useFiles from "../api/files";
import { Upload, Input, Button, Popconfirm, Table } from "antd";
import { DownloadOutlined, DeleteOutlined, FileAddOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

function Manuals() {
  const { files, error, loading, getFiles, uploadFile, deleteFile, filterFiles } = useFiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getFiles();
  }, []);

  const uploadProps = {
    onChange: (info) => {
      setUploading(true);
      if (info.file.status === "done") {
        getFiles();
        setUploading(false);
      }
    },
    multiple: false,
    showUploadList: false,
  };

  const handleDelete = async (filename) => {
    setDeleting(true);
    await deleteFile(filename);
    setDeleting(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterFiles(e.target.value);
  };

  const columns = [
    {
      title: "",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        return (
          <div className="file-icon">
            <FileIcon extension={record.name?.split(".")?.pop()} {...defaultStyles[record.name?.split(".")?.pop()]} />
          </div>
        );
      },
    },
    {
      title: "Filename",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <p className="truncate" style={{ maxWidth: "200px" }}>
          {text}
        </p>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (text) => <p>{text} MB</p>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <p>{new Date(text).toDateString()}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div className="flex">
          <a href={`/server/files/${record.name}`} target="_blank" rel="noreferrer" download={record.name} className="mr-2">
            <Button className="download-btn" icon={<DownloadOutlined />} />
          </a>
          <Popconfirm
            title="Are you sure you want to delete this file?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger className="action-btn" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="uploader">
      <div className="my-6">
        <Dragger action="/server/upload" {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <FileAddOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload a file</p>
          <p className="ant-upload-hint">The uploaded file will be available for download by all users.</p>
        </Dragger>
      </div>
      {uploading && <p>Uploading...</p>}
      {deleting && <p>Deleting...</p>}
      {loading && <p>Loading...</p>}

      <Input placeholder="Search files" value={searchTerm} onChange={handleSearch} size="large" />
      <div className="my-10 overflow-x-auto">
        <Table
          dataSource={files}
          columns={columns}
          size="small"
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          locale={{
            emptyText: "No files",
          }}
        />
      </div>
    </div>
  );
}

export default Manuals;
