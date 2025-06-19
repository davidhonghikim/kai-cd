import React from 'react';
import { useServiceStore } from '../store/serviceStore';
import { TrashIcon, DownloadIcon } from '@heroicons/react/24/solid';

const ImageGalleryView: React.FC = () => {
  const { imageGallery, removeImageFromGallery, getServiceById } = useServiceStore();

  const handleDownload = (imageData: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    const safePrompt = prompt.replace(/[^a-z0-9_]/gi, '_').slice(0, 50);
    link.download = `kai-cd-gen-${safePrompt}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 bg-gray-900 text-white h-full">
      <h2 className="text-2xl font-bold mb-4">Image Gallery</h2>
      {imageGallery.length === 0 ? (
        <p className="text-gray-400">No images generated yet. Go generate some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageGallery.map((image) => {
            const service = getServiceById(image.serviceId);
            return (
              <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden group relative">
                <img
                  src={`data:image/png;base64,${image.imageData}`}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-300">
                      {service?.name || 'Unknown Service'}
                    </p>
                    <p className="text-sm font-semibold line-clamp-3">{image.prompt}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(image.imageData, image.prompt)}
                      className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"
                      title="Download"
                    >
                      <DownloadIcon className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => removeImageFromGallery(image.id)}
                      className="p-2 bg-red-600 rounded-full hover:bg-red-700"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryView; 