import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import axios from "axios";
import {
    Upload, FileText, CheckCircle, AlertCircle, ScanLine, ArrowRight, User
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ScorecardOcr() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
                setError("Please upload an image (JPG/PNG) or PDF file.");
                return;
            }
            setFile(selectedFile);

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null); // No preview for PDF right now
            }
        }
    };

    const handleScan = async () => {
        if (!file) return;

        setIsScanning(true);
        setError(null);
        setExtractedData(null);
        setSaveSuccess(false);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://127.0.0.1:5001/extract_scorecard", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                setExtractedData(response.data.data);
            } else {
                setError(response.data.error || "Failed to extract data from document.");
            }
        } catch (err: any) {
            console.error("OCR API Error:", err);
            setError(err.response?.data?.error || "Failed to communicate with prediction server. Ensure python backend is running.");
            setIsScanning(false);
            return;
        }

        setIsScanning(false);
    };

    const handleSaveToProfile = async () => {
        if (!extractedData) return;

        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/login");
                return;
            }

            const updates: any = {
                updated_at: new Date().toISOString()
            };

            if (extractedData.category) updates.category = extractedData.category;

            if (extractedData.exam_type === "CET") {
                if (extractedData.score) updates.cet_score = String(extractedData.score);
                if (extractedData.rank) updates.cet_rank = String(extractedData.rank);
            } else if (extractedData.exam_type === "Diploma") {
                if (extractedData.score) updates.diploma_score = String(extractedData.score);
                if (extractedData.rank) updates.diploma_rank = String(extractedData.rank);
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', session.user.id);

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => {
                navigate("/profile");
            }, 2000);

        } catch (err: any) {
            console.error("Error saving profile:", err);
            setError("Failed to save extracted data to your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar activeTab="automation" />

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <ScanLine className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Smart Auto-Fill</h1>
                            <p className="text-lg text-gray-600 mt-1">Upload your scorecard and let AI extract your ranks & percentiles instantly.</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* Upload Section */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">1. Upload Scorecard</h2>

                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        const droppedFile = e.dataTransfer.files[0];
                                        handleFileSelect({ target: { files: [droppedFile] } } as any);
                                    }
                                }}
                            >
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Scorecard preview" className="max-h-48 mx-auto rounded shadow-sm opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-indigo-600 bg-white rounded-full p-1" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">Drag and drop your file here</p>
                                        <p className="text-gray-500 text-sm mb-4">Supports JPG, PNG, PDF up to 5MB</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/png,application/pdf"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    {file ? 'Change File' : 'Browse Files'}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleScan}
                                disabled={!file || isScanning}
                                className="w-full mt-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isScanning ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Extracting Data...
                                    </>
                                ) : (
                                    <>
                                        <ScanLine className="w-5 h-5" />
                                        Scan Document
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Section */}
                        <div className="p-8 bg-slate-50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">2. Extracted Data</h2>

                            {!extractedData && !isScanning && (
                                <div className="h-full flex flex-col items-center justify-center text-center pb-12 opacity-50">
                                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="text-gray-500 font-medium">Scan a document to see extracted details here.</p>
                                </div>
                            )}

                            {isScanning && (
                                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                        <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Running AI Vision...</h3>
                                    <p className="text-gray-500 text-sm mt-2">Identifying application ID, category, and scores.</p>
                                </div>
                            )}

                            {extractedData && !isScanning && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Candidate Name</p>
                                            <p className="font-bold text-gray-900">{extractedData.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Exam Type</p>
                                            <p className="font-bold text-gray-900">{extractedData.exam_type}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Category</p>
                                            <p className="font-bold text-gray-900">{extractedData.category}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50 text-emerald-900">
                                            <p className="text-xs opacity-70 font-bold uppercase tracking-wider mb-1">Score / Percentile</p>
                                            <p className="font-black text-2xl">{extractedData.score}%</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50 text-purple-900">
                                            <p className="text-xs opacity-70 font-bold uppercase tracking-wider mb-1">State Merit Rank</p>
                                            <p className="font-black text-2xl">{extractedData.rank}</p>
                                        </div>
                                    </div>

                                    <hr className="my-6 border-gray-200" />

                                    {saveSuccess ? (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-semibold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Profile Updated Successfully!
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSaveToProfile}
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? "Saving..." : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" /> Save to Profile
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {!saveSuccess && (
                                        <p className="text-center text-xs text-gray-500 mt-3">
                                            This will overwrite the current scores in your profile.
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
