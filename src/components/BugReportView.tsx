import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { generateBugReport } from '../utils/bugReportGenerator';

const BugReportView: React.FC = () => {
    const [description, setDescription] = useState('');
    const [reportOptions, setReportOptions] = useState({
        systemInfo: true,
        extensionInfo: true,
        settings: true,
        logs: true,
    });

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReportOptions({ ...reportOptions, [e.target.name]: e.target.checked });
    };

    const handleGenerateAndCopy = async () => {
        if (!description.trim()) {
            toast.error('Please provide a description of the bug.');
            return;
        }
        const report = await generateBugReport(reportOptions, description);
        navigator.clipboard.writeText(report);
        toast.success('Bug report copied to clipboard!');
    };

    return (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mt-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Report a Bug</h3>
            <p className="text-sm text-slate-400 mb-4">
                This tool helps you generate a bug report with relevant system and application data. 
                Review the options and provide a detailed description of the issue.
            </p>

            <div className="mb-4">
                <label htmlFor="bug-description" className="block text-sm font-medium text-slate-300 mb-1">
                    Bug Description
                </label>
                <textarea
                    id="bug-description"
                    rows={5}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the bug in as much detail as possible..."
                />
            </div>

            <div className="mb-4">
                <p className="block text-sm font-medium text-slate-300 mb-2">Include in Report:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(reportOptions).map(key => (
                        <label key={key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name={key}
                                checked={reportOptions[key as keyof typeof reportOptions]}
                                onChange={handleOptionChange}
                                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span className="text-sm text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerateAndCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-500"
                disabled={!description.trim()}
            >
                <ClipboardDocumentIcon className="h-5 w-5" />
                Generate & Copy Report
            </button>
        </div>
    );
};

export default BugReportView; 