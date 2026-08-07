import React from "react";

export default function ArchiveProjectModal({
    open,
    project,
    onClose,
    onConfirm
}) {

    if (!open) return null;

    const restoring = project?.archived;

    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95"
            >

                <div className="flex justify-center mb-5">

                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            restoring
                                ? "bg-green-100"
                                : "bg-amber-100"
                        }`}
                    >

                        <span className="text-3xl">
                            {restoring ? "✅" : "📦"}
                        </span>

                    </div>

                </div>

                <h2 className="text-2xl font-bold text-center">

                    {restoring
                        ? "Restore Project"
                        : "Archive Project"}

                </h2>

                <p className="text-center text-gray-500 mt-4">

                    {restoring
                        ? "Do you want to restore"
                        : "Do you want to archive"}

                </p>

                <p className="text-center font-semibold text-lg mt-1">

                    "{project?.name}"

                </p>

                <div
                    className={`rounded-xl p-4 mt-6 border ${
                        restoring
                            ? "bg-green-50 border-green-200"
                            : "bg-amber-50 border-amber-200"
                    }`}
                >

                    <p
                        className={`font-semibold ${
                            restoring
                                ? "text-green-700"
                                : "text-amber-700"
                        }`}
                    >

                        {restoring
                            ? "The project will become active again."
                            : "Archived projects can still be viewed and restored later."}

                    </p>

                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 rounded-xl text-white ${
                            restoring
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-amber-500 hover:bg-amber-600"
                        }`}
                    >

                        {restoring
                            ? "Restore"
                            : "Archive"}

                    </button>

                </div>

            </div>

        </div>

    );

}
