'use client';

import { useCallback, useState, useRef } from 'react';

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  label?: string;
}

export default function FileDropZone({
  accept,
  multiple = false,
  maxFiles,
  onFilesSelected,
  label = 'Glissez vos fichiers ici ou cliquez pour parcourir',
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const limited = maxFiles ? droppedFiles.slice(0, maxFiles) : droppedFiles;
      onFilesSelected(limited);
    },
    [maxFiles, onFilesSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const selectedFiles = Array.from(e.target.files);
      const limited = maxFiles ? selectedFiles.slice(0, maxFiles) : selectedFiles;
      onFilesSelected(limited);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [maxFiles, onFilesSelected]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-600 hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
