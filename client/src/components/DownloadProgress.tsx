import React from 'react';
import { DownloadingState } from './DownloadingState';
import type { MediaMetadata, DownloadProgress as DownloadProgressType } from '../types/media';

export interface DownloadProgressProps {
  media: MediaMetadata;
  progress: DownloadProgressType;
  onCancel: () => void;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = (props) => {
  return <DownloadingState {...props} />;
};

export { DownloadingState };
export default DownloadProgress;
