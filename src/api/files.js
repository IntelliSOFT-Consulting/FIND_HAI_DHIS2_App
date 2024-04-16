import { useState } from "react";
import api from "axios";

const axios = api.create({
  baseURL: process.env.REACT_APP_FILE_UPLOAD_URL,
});

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/files");
      setFiles(response.data.files);
      setAllFiles(response.data.files);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      await axios.post("/api/v1/upload", formData);
      await getFiles();
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const deleteFile = async (filename) => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/files/${filename}`);
      await getFiles();
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const filterFiles = (searchTerm) => {
    setFiles(allFiles.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  return { files, error, loading, getFiles, uploadFile, deleteFile, filterFiles };
};

export default useFiles;
