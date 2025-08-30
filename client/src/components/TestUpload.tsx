import { useState } from "react";

export function TestUpload() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  const handleFileClick = () => {
    const input = document.getElementById('test-file-input') as HTMLInputElement;
    input?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer" onClick={handleFileClick}>
      <input
        id="test-file-input"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <div className="text-center">
        <p className="text-blue-600 font-medium">Click to test file upload</p>
        {selectedFile && <p className="text-green-600 mt-2">Selected: {selectedFile}</p>}
      </div>
    </div>
  );
}