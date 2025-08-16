import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Paper, Typography } from '@mui/material';
import { createTwoFilesPatch } from 'diff';
const DiffViewer = ({ oldContent, newContent, splitView = true, title }) => {
    // Generate the diff
    const diffText = createTwoFilesPatch('Previous Version', 'Current Version', oldContent, newContent);
    // Simple syntax highlighting for the diff
    const formatDiff = (diff) => {
        return diff.split('\n').map((line, index) => {
            if (line.startsWith('+')) {
                return _jsx("div", { style: { backgroundColor: '#e6ffed' }, children: line }, index);
            }
            else if (line.startsWith('-')) {
                return _jsx("div", { style: { backgroundColor: '#ffdce0' }, children: line }, index);
            }
            else if (line.startsWith('@')) {
                return _jsx("div", { style: { backgroundColor: '#f1f8ff' }, children: line }, index);
            }
            return _jsx("div", { children: line }, index);
        });
    };
    if (splitView) {
        return (_jsxs(Box, { children: [title && _jsx(Typography, { variant: "h6", gutterBottom: true, children: title }), _jsxs(Box, { sx: { display: 'flex', height: '400px' }, children: [_jsxs(Box, { flex: 1, p: 2, border: "1px solid", borderColor: "divider", mr: 1, overflow: "auto", children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Previous Version" }), _jsx("pre", { style: { margin: 0 }, children: oldContent })] }), _jsxs(Box, { flex: 1, p: 2, border: "1px solid", borderColor: "divider", overflow: "auto", children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Current Version" }), _jsx("pre", { style: { margin: 0 }, children: newContent })] })] })] }));
    }
    return (_jsxs(Box, { children: [title && _jsx(Typography, { variant: "h6", gutterBottom: true, children: title }), _jsx(Paper, { variant: "outlined", sx: { p: 2, maxHeight: '400px', overflow: 'auto' }, children: _jsx("pre", { style: { fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0 }, children: formatDiff(diffText) }) })] }));
};
export default DiffViewer;
