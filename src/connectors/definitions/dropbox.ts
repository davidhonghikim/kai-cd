import type { ServiceDefinition, StorageCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

// Note: The Dropbox API uses different domains for API calls and content transfer.
// - api.dropboxapi.com for metadata
// - content.dropboxapi.com for upload/download
// The client implementation will need to handle this.
const storageCapability: StorageCapability = {
  capability: 'storage',
  endpoints: {
    listFiles: { path: 'https://api.dropboxapi.com/2/files/list_folder', method: 'POST' },
    uploadFile: { path: 'https://content.dropboxapi.com/2/files/upload', method: 'POST' },
    downloadFile: { path: 'https://content.dropboxapi.com/2/files/download', method: 'POST' },
    deleteFile: { path: 'https://api.dropboxapi.com/2/files/delete_v2', method: 'POST' },
  },
  parameters: {
    listFiles: [
      {
        key: 'path',
        label: 'Path',
        type: 'string',
        defaultValue: '',
        description: 'The path to the folder you want to list. The root folder is an empty string.',
      },
    ],
    uploadFile: [
      {
        key: 'path',
        label: 'File Path',
        type: 'string',
        defaultValue: '',
        description: 'The full path to the file you are uploading, including the file name.',
      },
      {
        key: 'mode',
        label: 'Write Mode',
        type: 'select',
        defaultValue: 'add',
        options: ['add', 'overwrite', 'update'],
        description: 'Selects what to do if a file already exists at the given path.',
      },
    ],
    downloadFile: [
      {
        key: 'path',
        label: 'File Path',
        type: 'string',
        defaultValue: '',
        description: 'The full path to the file you want to download.',
      },
    ],
    deleteFile: [
      {
        key: 'path',
        label: 'File Path',
        type: 'string',
        defaultValue: '',
        description: 'The full path to the file or folder to be deleted.',
      },
    ],
  },
};

const dropboxDefinition: ServiceDefinition = {
  type: 'dropbox',
  name: 'Dropbox',
  category: SERVICE_CATEGORIES.STORAGE,
  docs: {
    api: 'https://www.dropbox.com/developers/documentation/http/documentation',
  },
  authentication: {
    type: 'bearer_token',
    help: 'Generate an access token from the App Console in your Dropbox Developer account.',
  },
  capabilities: [storageCapability],
  defaultPort: 0, // Dropbox is a cloud service
};

export { dropboxDefinition }; 