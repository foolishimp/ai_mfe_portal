import React from 'react';
interface TimeAgoProps {
    timestamp?: string;
    date?: string;
    typography?: boolean;
    variant?: 'body1' | 'body2' | 'caption';
}
declare const TimeAgo: React.FC<TimeAgoProps>;
export default TimeAgo;
