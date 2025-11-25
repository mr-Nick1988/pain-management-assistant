import React, { useState } from "react";
import {
    useGetAllApiKeysQuery,
    useGenerateApiKeyMutation,
    useDeactivateApiKeyMutation,
    useUpdateIpWhitelistMutation,
    useUpdateRateLimitMutation,
} from "../../api/api/apiExternalVasSlice";
import type { ApiKeyDTO } from "../../types/externalVas";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, LoadingSpinner, PageNavigation } from "../ui";
import { useToast } from "../../contexts/ToastContext";
import { Key as KeyIcon, CheckCircle2, XCircle, AlertTriangle, Plus } from "lucide-react";

const ApiKeyManagement: React.FC = () => {
    const toast = useToast();

    // State
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState<ApiKeyDTO | null>(null);

    // Form state
    const [systemName, setSystemName] = useState("");
    const [description, setDescription] = useState("");
    const [expiresInDays, setExpiresInDays] = useState<number | "">("");
    const [ipWhitelist, setIpWhitelist] = useState("*");
    const [rateLimit, setRateLimit] = useState(60);

    // Edit form state
    const [editIpWhitelist, setEditIpWhitelist] = useState("");
    const [editRateLimit, setEditRateLimit] = useState(60);

    // API hooks
    const { data: apiKeysData, isLoading } = useGetAllApiKeysQuery();
    const [generateApiKey, { isLoading: isGenerating }] = useGenerateApiKeyMutation();
    const [deactivateApiKey] = useDeactivateApiKeyMutation();
    const [updateIpWhitelist] = useUpdateIpWhitelistMutation();
    const [updateRateLimit] = useUpdateRateLimitMutation();

    // Handlers
    const handleGenerateKey = async () => {
        if (!systemName.trim()) {
            toast.error("System Name is required");
            return;
        }

        try {
            const result = await generateApiKey({
                systemName: systemName.trim(),
                description: description.trim() || undefined,
                expiresInDays: expiresInDays === "" ? undefined : Number(expiresInDays),
                createdBy: localStorage.getItem("username") || "admin",
            }).unwrap();

            if (result.status === "success" && result.apiKey) {
                setGeneratedKey(result.apiKey);
                setShowGenerateModal(false);
                setShowKeyModal(true);
                resetForm();
                toast.success("API Key generated successfully!");
            }
        } catch (error) {
            console.error("Failed to generate API key:", error);
            toast.error("Failed to generate API key");
        }
    };

    const handleDeactivate = async (apiKey: string) => {
        if (!confirm("Are you sure you want to deactivate this API key?")) return;

        try {
            await deactivateApiKey(apiKey).unwrap();
            toast.success("API key deactivated successfully");
        } catch (error) {
            console.error("Failed to deactivate API key:", error);
            toast.error("Failed to deactivate API key");
        }
    };

    const handleUpdateIpWhitelist = async () => {
        if (!selectedKey) return;

        try {
            await updateIpWhitelist({
                apiKey: selectedKey.apiKey,
                ipWhitelist: editIpWhitelist,
            }).unwrap();
            toast.success("IP Whitelist updated successfully");
            setShowEditModal(false);
        } catch (error) {
            console.error("Failed to update IP whitelist:", error);
            toast.error("Failed to update IP whitelist");
        }
    };

    const handleUpdateRateLimit = async () => {
        if (!selectedKey) return;

        try {
            await updateRateLimit({
                apiKey: selectedKey.apiKey,
                rateLimitPerMinute: editRateLimit,
            }).unwrap();
            toast.success("Rate Limit updated successfully");
            setShowEditModal(false);
        } catch (error) {
            console.error("Failed to update rate limit:", error);
            toast.error("Failed to update rate limit");
        }
    };

    const openEditModal = (key: ApiKeyDTO) => {
        setSelectedKey(key);
        setEditIpWhitelist(key.ipWhitelist);
        setEditRateLimit(key.rateLimitPerMinute);
        setShowEditModal(true);
    };

    const resetForm = () => {
        setSystemName("");
        setDescription("");
        setExpiresInDays("");
        setIpWhitelist("*");
        setRateLimit(60);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const getStatusBadge = (key: ApiKeyDTO) => {
        if (!key.active) {
            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800"><XCircle className="w-3.5 h-3.5"/> Deactivated</span>;
        }

        if (!key.expiresAt) {
            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800"><CheckCircle2 className="w-3.5 h-3.5"/> Active</span>;
        }

        const expiresDate = new Date(key.expiresAt);
        const now = new Date();
        const daysUntilExpiry = Math.floor((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5"/> Expired</span>;
        } else if (daysUntilExpiry < 30) {
            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3.5 h-3.5"/> Expiring Soon</span>;
        } else {
            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800"><CheckCircle2 className="w-3.5 h-3.5"/> Active</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                        <KeyIcon className="w-8 h-8"/> API Key Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage API keys for external VAS device integration
                    </p>
                </div>
                <Button variant="approve" onClick={() => setShowGenerateModal(true)}>
                    <Plus className="w-4 h-4 mr-2"/> Generate New API Key
                </Button>
            </div>

            {/* API Keys Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Active API Keys ({apiKeysData?.total || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {!apiKeysData || apiKeysData.keys.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No API keys found</p>
                            <p className="text-sm mt-2">Click "Generate New API Key" to create one</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">System Name</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">API Key</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Expires At</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">IP Whitelist</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Rate Limit</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Usage</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {apiKeysData.keys.map((key) => (
                                        <tr key={key.apiKey} className="hover:bg-gray-50">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-semibold">{key.systemName}</p>
                                                    {key.description && (
                                                        <p className="text-sm text-gray-600">{key.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                                    {key.apiKey}
                                                </code>
                                            </td>
                                            <td className="p-3 text-sm">
                                                {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}
                                            </td>
                                            <td className="p-3 text-sm font-mono">{key.ipWhitelist}</td>
                                            <td className="p-3 text-sm">{key.rateLimitPerMinute}/min</td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    <p className="font-semibold">{key.usageCount || 0} calls</p>
                                                    {key.lastUsedAt && (
                                                        <p className="text-xs text-gray-500">
                                                            Last: {new Date(key.lastUsedAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">{getStatusBadge(key)}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="update"
                                                        onClick={() => openEditModal(key)}
                                                        className="text-xs"
                                                    >
                                                        Edit
                                                    </Button>
                                                    {key.active && (
                                                        <Button
                                                            variant="reject"
                                                            onClick={() => handleDeactivate(key.apiKey)}
                                                            className="text-xs"
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate API Key Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <CardHeader>
                            <CardTitle>Generate New API Key</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="systemName">System Name *</Label>
                                <Input
                                    id="systemName"
                                    value={systemName}
                                    onChange={(e) => setSystemName(e.target.value)}
                                    placeholder="e.g., Hospital Monitor System"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., VAS monitors in Ward A and B"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="expiresInDays">Expires In Days</Label>
                                <Input
                                    id="expiresInDays"
                                    type="number"
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="Leave empty for never"
                                />
                            </div>

                            <div>
                                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                                <Input
                                    id="ipWhitelist"
                                    value={ipWhitelist}
                                    onChange={(e) => setIpWhitelist(e.target.value)}
                                    placeholder="* for any IP, or 192.168.1.0/24"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use * for any IP, or specify CIDR notation (e.g., 192.168.1.0/24)
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="rateLimit">Rate Limit (requests per minute)</Label>
                                <Input
                                    id="rateLimit"
                                    type="number"
                                    value={rateLimit}
                                    onChange={(e) => setRateLimit(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="approve"
                                    onClick={handleGenerateKey}
                                    disabled={isGenerating}
                                    className="flex-1"
                                >
                                    {isGenerating ? "Generating..." : "Generate"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowGenerateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Show Generated Key Modal (CRITICAL - SHOW ONLY ONCE) */}
            {showKeyModal && generatedKey && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> SAVE THIS KEY NOW!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-red-50 border-2 border-red-300 rounded">
                                <p className="font-bold text-red-800 mb-2">
                                    You won't be able to see this key again!
                                </p>
                                <p className="text-sm text-red-700">
                                    Make sure to copy and save this API key in a secure location.
                                    Once you close this window, the key will be masked and cannot be retrieved.
                                </p>
                            </div>

                            <div>
                                <Label>API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={generatedKey}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="update"
                                        onClick={() => copyToClipboard(generatedKey)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">System Name:</span>
                                    <p className="font-semibold">{systemName}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Expires At:</span>
                                    <p className="font-semibold">
                                        {expiresInDays === "" ? "Never" : `${expiresInDays} days`}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">IP Whitelist:</span>
                                    <p className="font-semibold font-mono">{ipWhitelist}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Rate Limit:</span>
                                    <p className="font-semibold">{rateLimit}/min</p>
                                </div>
                            </div>

                            <Button
                                variant="approve"
                                onClick={() => {
                                    setShowKeyModal(false);
                                    setGeneratedKey(null);
                                }}
                                className="w-full"
                            >
                                I've Saved the Key
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedKey && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit API Key Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">System Name:</p>
                                <p className="font-semibold">{selectedKey.systemName}</p>
                                <p className="text-sm text-gray-600 mt-2">API Key:</p>
                                <code className="text-sm font-mono">{selectedKey.apiKey}</code>
                            </div>

                            <div>
                                <Label htmlFor="editIpWhitelist">IP Whitelist</Label>
                                <Input
                                    id="editIpWhitelist"
                                    value={editIpWhitelist}
                                    onChange={(e) => setEditIpWhitelist(e.target.value)}
                                />
                                <Button
                                    variant="update"
                                    onClick={handleUpdateIpWhitelist}
                                    className="mt-2"
                                >
                                    Update IP Whitelist
                                </Button>
                            </div>

                            <div>
                                <Label htmlFor="editRateLimit">Rate Limit (requests per minute)</Label>
                                <Input
                                    id="editRateLimit"
                                    type="number"
                                    value={editRateLimit}
                                    onChange={(e) => setEditRateLimit(Number(e.target.value))}
                                />
                                <Button
                                    variant="update"
                                    onClick={handleUpdateRateLimit}
                                    className="mt-2"
                                >
                                    Update Rate Limit
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setShowEditModal(false)}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <PageNavigation />
        </div>
    );
};

export default ApiKeyManagement;
