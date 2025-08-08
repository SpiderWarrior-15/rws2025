import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Music, Video, Image } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedTypes = ['.mp3', '.wav', '.ogg', '.mp4', '.mov', '.webm'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 5,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (uploadFiles.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const newUploadFiles: UploadFile[] = validFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'uploading'
      }));

      setUploadFiles(prev => [...prev, ...newUploadFiles]);
      
      // Simulate upload progress
      newUploadFiles.forEach(uploadFile => {
        simulateUpload(uploadFile);
      });

      onFileSelect(validFiles);
    }
  }, [uploadFiles.length, maxFiles, onFileSelect, acceptedTypes, maxFileSize]);

  const simulateUpload = (uploadFile: UploadFile) => {
    const interval = setInterval(() => {
      setUploadFiles(prev => prev.map(f => {
        if (f.id === uploadFile.id) {
          const newProgress = Math.min(f.progress + Math.random() * 20, 100);
          const newStatus = newProgress === 100 ? 'completed' : 'uploading';
          return { ...f, progress: newProgress, status: newStatus };
        }
        return f;
      }));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress: 100, status: 'completed' } : f
      ));
    }, 2000 + Math.random() * 3000);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setUploadFiles([]);
    setErrors([]);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) return Music;
    if (['mp4', 'mov', 'webm'].includes(extension || '')) return Video;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return Image;
    return File;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-500/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ y: isDragOver ? -5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragOver ? 'text-purple-500' : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Audio/Video Files'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files or click to browse
          </p>
          <div className="text-sm text-gray-500">
            <p>Supported: {acceptedTypes.join(', ')}</p>
            <p>Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB per file</p>
            <p>Max files: {maxFiles}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Uploading Files ({uploadFiles.length})
                </h4>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-red-500"
                >
                  Clear All
                </AnimatedButton>
              </div>
              
              <div className="space-y-3">
                {uploadFiles.map(uploadFile => {
                  const FileIcon = getFileIcon(uploadFile.file.name);
                  return (
                    <div key={uploadFile.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <FileIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {uploadFile.file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              uploadFile.status === 'completed' ? 'bg-green-500' :
                              uploadFile.status === 'error' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadFile.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {uploadFile.progress.toFixed(0)}%
                          </span>
                          <div className="flex items-center space-x-1">
                            {uploadFile.status === 'completed' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {uploadFile.status === 'error' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};