import React from 'react';

export default function EditProjectModal({
    open,
    form,
    setForm,
    onClose,
    onSave
}) {

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        ✏️
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Edit Project
                        </h2>

                        <p className="text-sm text-gray-500">
                            Update your project details.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name: e.target.value
                                })
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value
                                })
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onSave}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>
    );
}
