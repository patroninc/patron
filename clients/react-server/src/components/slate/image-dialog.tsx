import { JSX, useState, useRef, useEffect } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

/**
 * Dialog component for image insertion with upload and URL options
 *
 * @param props - Dialog props
 * @param props.isOpen - Whether the dialog is open
 * @param props.onClose - Close handler
 * @param props.onInsert - Insert handler with URL and alt text
 * @returns Image dialog component
 */
const ImageDialog = ({ isOpen, onClose, onInsert }: ImageDialogProps): JSX.Element => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle escape key to close dialog
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  /**
   * Process uploaded file
   */
  const processFile = async (file: File): Promise<void> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setUrl(preview);

      // In a real application, you would upload the file to your server here
      // For now, we'll use the object URL as a placeholder
      console.log('File uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (event: React.DragEvent): void => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (): void => {
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent): Promise<void> => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  /**
   * Handle URL change
   */
  const handleUrlChange = (newUrl: string): void => {
    setUrl(newUrl);
    if (newUrl.trim()) {
      setPreviewUrl(newUrl);
    } else {
      setPreviewUrl('');
    }
  };

  /**
   * Handle insert
   */
  const handleInsert = (): void => {
    if (url.trim()) {
      onInsert(url.trim(), alt.trim());
      handleClose();
    }
  };

  /**
   * Handle close and reset
   */
  const handleClose = (): void => {
    setUrl('');
    setAlt('');
    setPreviewUrl('');
    setIsUploading(false);
    onClose();
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: 'upload' | 'url'): void => {
    setActiveTab(tab);
    setUrl('');
    setAlt('');
    setPreviewUrl('');
  };

  if (!isOpen) return <></>;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Insert Image</h2>
          <Button onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('upload')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('url')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === 'url'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            URL
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-4"
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="image-url" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Alt Text */}
        <div className="mt-4">
          <label htmlFor="alt-text" className="block text-sm font-medium text-gray-700">
            Alt Text
          </label>
          <input
            id="alt-text"
            type="text"
            placeholder="Describe the image for accessibility..."
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Preview</label>
              <Button
                onClick={() => {
                  setPreviewUrl('');
                  setUrl('');
                }}
                variant="secondary"
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            <div className="mt-1 max-h-48 overflow-hidden rounded border">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={() => setPreviewUrl('')}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert Image
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageDialog;
