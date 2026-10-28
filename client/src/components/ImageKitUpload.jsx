import React, { useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { imagekitService } from '../services/api';

const ImageKitUpload = ({ onUploadSuccess, initialImage = '', label = 'Upload Image' }) => {
  const [preview, setPreview] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onUploadSuccess) {
          onUploadSuccess(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Attempt ImageKit auth check
      await imagekitService.getAuthParams();
    } catch (err) {
      console.warn('ImageKit auth note:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    if (onUploadSuccess) onUploadSuccess('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {preview ? (
        <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          <img src={preview} alt="Uploaded preview" className="w-32 h-32 object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-1" />
            ) : (
              <Upload className="w-7 h-7 text-slate-400 mb-1" />
            )}
            <p className="text-xs text-slate-600 font-medium">
              Click to upload image <span className="text-slate-400">(Max 5MB)</span>
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default ImageKitUpload;
