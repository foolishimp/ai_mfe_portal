import { jsx as _jsx } from "react/jsx-runtime";
import { Tooltip, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
const TimeAgo = ({ timestamp, date, typography = true, variant = 'body2' }) => {
    const dateString = timestamp || date;
    if (!dateString) {
        return null;
    }
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            console.error(`Invalid date: ${dateString}`);
            return null;
        }
        const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true });
        const formattedDate = dateObj.toLocaleString();
        const content = (_jsx(Tooltip, { title: formattedDate, children: _jsx("span", { children: timeAgo }) }));
        if (typography) {
            return _jsx(Typography, { variant: variant, children: content });
        }
        return content;
    }
    catch (error) {
        console.error(`Error parsing date: ${dateString}`, error);
        return null;
    }
};
export default TimeAgo;
