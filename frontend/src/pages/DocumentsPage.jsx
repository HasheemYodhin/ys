import { useState } from 'react';
import { FileText, Download, Search, Filter, HardDrive, Share2, Trash2 } from 'lucide-react';

const DOCUMENTS = [
    { id: 1, name: 'Employee_Handbook_2025.pdf', category: 'Policy', size: '2.4 MB', date: '2025-01-10' },
    { id: 2, name: 'Medical_Insurance_Plan.pdf', category: 'Benefits', size: '1.8 MB', date: '2025-02-15' },
    { id: 3, name: 'IT_Policy_v2.docx', category: 'Policy', size: '450 KB', date: '2025-03-05' },
    { id: 4, name: 'Holiday_Calendar_2025.pdf', category: 'General', size: '1.2 MB', date: '2025-01-01' },
];

export default function DocumentsPage() {
    return (
        <div className="documents-page">
            <div className="page-header flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Document Repository</h1>
                    <p className="page-subtitle">Access and manage organization documents</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter size={18} /> Filter
                    </button>
                    <button className="btn-premium flex items-center gap-2">
                        <HardDrive size={18} /> Upload New
                    </button>
                </div>
            </div>

            <div className="card mb-8 p-4 flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search documents by name or category..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {['All Files', 'Policies', 'Benefits', 'Legal'].map((cat, i) => (
                    <div key={i} className={`card p-6 cursor-pointer hover:border-primary-500 transition-all ${i === 0 ? 'border-primary-500 bg-primary-50/10' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${i === 0 ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <FileText size={24} />
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-900">{cat}</h4>
                        <p className="text-sm text-muted">{i === 0 ? '24' : i * 4 + 2} documents</p>
                    </div>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-4 font-semibold text-slate-600">File Name</th>
                                <th className="p-4 font-semibold text-slate-600">Category</th>
                                <th className="p-4 font-semibold text-slate-600">Size</th>
                                <th className="p-4 font-semibold text-slate-600">Uploaded</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DOCUMENTS.map((doc) => (
                                <tr key={doc.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-primary-600"><FileText size={20} /></div>
                                            <span className="font-medium text-slate-900">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted">{doc.size}</td>
                                    <td className="p-4 text-muted">{doc.date}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                                <Share2 size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .documents-page { animation: fadeIn 0.4s ease-out; }
                .table-responsive { width: 100%; overflow-x: auto; }
            `}</style>
        </div>
    );
}
