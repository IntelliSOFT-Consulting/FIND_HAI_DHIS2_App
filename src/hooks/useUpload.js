import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";

const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const engine = useDataEngine();

  const upload = async (file) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadFile = await engine.mutate({
        resource: "fileResources",
        type: "create",
        data: {
          file,
        },
      });

      setSuccess("Upload successful");
      return uploadFile?.response?.fileResource?.id;
    } catch (e) {
      console.error(e);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return { uploading, error, success, upload };
};

export default useUpload;
