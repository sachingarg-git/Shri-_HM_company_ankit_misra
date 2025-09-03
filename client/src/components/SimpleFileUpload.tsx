import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleFileUploadProps {
  documentType: string;
  onUploadComplete: (documentType: string, success: boolean) => void;
}

export function SimpleFileUpload({ documentType, onUploadComplete }: SimpleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'gstCertificate': 'GST Certificate',
      'panCopy': 'PAN Copy',
      'securityCheque': 'Security Cheque',
      'aadharCard': 'Aadhar Card',
      'agreement': 'Agreement',
      'poRateContract': 'PO / Rate Contract'
    };
    return names[type] || type;
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type - be more flexible with MIME types
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'];
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Word documents, or images only",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10485760) { // 10MB
      toast({
        title: "File Too Large", 
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    setUploadSuccess(false);

    try {
      console.log('Getting upload URL...');
      
      // Get upload URL from backend
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get upload URL:', response.status, errorText);
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }

      const { uploadURL } = await response.json();
      console.log('Got upload URL, starting upload...');

      // Upload file to object storage with simplified headers
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      console.log('Upload response status:', uploadResult.status);

      if (uploadResult.ok) {
        console.log('Upload successful!');
        setUploadSuccess(true);
        onUploadComplete(documentType, true);
        toast({
          title: "Success",
          description: `${getDisplayName(documentType)} uploaded successfully`,
        });
      } else {
        let errorText = 'Unknown error';
        try {
          errorText = await uploadResult.text();
        } catch (e) {
          errorText = `HTTP ${uploadResult.status} ${uploadResult.statusText}`;
        }
        console.error('Upload failed:', uploadResult.status, errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error details:', error);
      onUploadComplete(documentType, false);
      setUploadSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
    
    // Reset the input to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        {getDisplayName(documentType)}
      </label>
      
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
          ${uploadSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}
          ${isUploading ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/30' : ''}
          hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploadSuccess ? (
            <Check className="h-6 w-6 text-green-600" />
          ) : (
            <Upload className={`h-6 w-6 ${isUploading ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
          )}
          
          {isUploading ? (
            <div className="text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-1"></div>
              Uploading {fileName}...
            </div>
          ) : uploadSuccess ? (
            <div className="text-sm text-green-600 font-medium">
              ✓ {fileName} uploaded successfully
            </div>
          ) : (
            <div className="text-sm">
              <div className="font-medium text-blue-600">Click to upload {getDisplayName(documentType)}</div>
              <div className="text-xs text-gray-500 mt-1">PDF, Word, Images (max 10MB)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}