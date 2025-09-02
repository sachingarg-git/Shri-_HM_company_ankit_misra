import { useState, useRef } from "react";

interface FileUploadButtonProps {
  label: string;
  documentType: string;
  onFileSelected?: (file: File, documentType: string) => void;
  isUploading?: boolean;
  isUploaded?: boolean;
}

export function FileUploadButton({ label, documentType, onFileSelected, isUploading = false, isUploaded = false }: FileUploadButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked for:', documentType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed for:', documentType);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      setSelectedFile(file);
      onFileSelected?.(file, documentType);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        data-testid={`file-input-${documentType}`}
        tabIndex={-1}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`upload-button-${documentType}`}
      >
        {isUploading ? (
          <>
            <span className="animate-spin">⟳</span>
            Uploading...
          </>
        ) : isUploaded || selectedFile ? (
          <>
            <span className="text-green-600">✓</span>
            {selectedFile ? selectedFile.name : `${label} uploaded`}
          </>
        ) : (
          <>
            <span>📁</span>
            Click to upload {label.toLowerCase()}
          </>
        )}
      </button>
      
      {selectedFile && (
        <p className="text-sm text-green-600">
          File selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}