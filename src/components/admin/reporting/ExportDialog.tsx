import React, { useState } from "react";
import { useSendDailyReportEmailMutation } from "../../../api/api/apiReportingSlice";
import { Button, Input, Label } from "../../ui";
import { useToast } from "../../../contexts/ToastContext";
import { monolith_root_url } from "../../../utils/constants";

interface ExportDialogProps {
    date: string;
    onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ date, onClose }) => {
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [attachPdf, setAttachPdf] = useState(true);
    const [attachExcel, setAttachExcel] = useState(true);
    
    const [sendEmail, { isLoading }] = useSendDailyReportEmailMutation();

    const handleSendEmail = async () => {
        if (!email.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            await sendEmail({
                date,
                email: email.trim(),
                attachPdf,
                attachExcel,
            }).unwrap();
            
            toast.success(`Report sent successfully to ${email}`);
            onClose();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to send email'
                : 'Failed to send email';
            toast.error(errorMessage);
        }
    };

    const handleDownloadExcel = () => {
        const url = `${monolith_root_url}/api/reports/daily/${date}/export/excel`;
        window.open(url, "_blank");
    };

    const handleDownloadPdf = () => {
        const url = `${monolith_root_url}/api/reports/daily/${date}/export/pdf`;
        window.open(url, "_blank");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        Export Report
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Download Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            📥 Download
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="default"
                                onClick={handleDownloadExcel}
                                className="flex-1"
                            >
                                📊 Excel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleDownloadPdf}
                                className="flex-1"
                            >
                                📄 PDF
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            📧 Send via Email
                        </h3>
                        
                        {/* Email Input */}
                        <div className="mb-4">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@hospital.com"
                                className="mt-1"
                            />
                        </div>

                        {/* Attachments Checkboxes */}
                        <div className="space-y-2 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={attachPdf}
                                    onChange={(e) => setAttachPdf(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Attach PDF</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={attachExcel}
                                    onChange={(e) => setAttachExcel(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Attach Excel</span>
                            </label>
                        </div>

                        <Button
                            variant="submit"
                            onClick={handleSendEmail}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Sending..." : "📧 Send Email"}
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportDialog;
