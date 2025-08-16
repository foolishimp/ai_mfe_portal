import React from 'react';
interface DiffViewerProps {
    oldContent: string;
    newContent: string;
    splitView?: boolean;
    title?: string;
}
declare const DiffViewer: React.FC<DiffViewerProps>;
export default DiffViewer;
