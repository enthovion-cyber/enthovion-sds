'use client';
import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props { onUpload: (file: File) => Promise<void>; isLoading: boolean; }

export default function SdsUploadZone({ onUpload, isLoading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${dragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload size={28} className="text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">Drop your SDS file here or click to browse</p>
        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, scanned images — up to 20MB</p>
        <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff" onChange={handleFileChange} />
      </div>

      {file && (
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
          <FileText size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
          <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}

      {file && (
        <Button onClick={handleSubmit} isLoading={isLoading} className="w-full">
          {isLoading ? 'Extracting with AI...' : 'Upload and extract SDS'}
        </Button>
      )}
    </div>
  );
}
