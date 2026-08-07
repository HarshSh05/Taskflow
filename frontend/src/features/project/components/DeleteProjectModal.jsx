import React from 'react';

export default function DeleteProjectModal({
    open,
    project,
    onClose,
    onConfirm
}) {

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"  onClick={onClose} >

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 " onClick={(e) => e.stopPropagation()} >

                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-3xl">🗑️</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Delete Project
                </h2>

                <p className="text-center text-gray-500 mt-3">
                    Are you sure you want to permanently delete
                </p>

                <p className="text-center font-semibold text-lg text-gray-900 mt-1">
                    "{project?.name}"
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-5">

                    <p className="text-red-700 font-semibold mb-2">
                        This action will permanently remove:
                    </p>

                    <ul className="text-sm text-red-600 space-y-1">
                        <li>• All Tasks</li>
                        <li>• All Board Columns</li>
                        <li>• Activity Logs</li>
                        <li>• Project Members</li>
                    </ul>

                    <p className="mt-4 text-xs text-red-500 font-medium">
                        This action cannot be undone.
                    </p>

                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Delete Project
                    </button>

                </div>

            </div>

        </div>
    );
}
