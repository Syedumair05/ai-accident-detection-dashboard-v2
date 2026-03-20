import React from 'react';

const Checkbox = ({ label, id, ...props }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    id={id}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-900/50 checked:border-blue-500 checked:bg-blue-500 transition-all"
                    {...props}
                />
                <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            {label && (
                <label htmlFor={id} className="cursor-pointer text-sm text-slate-300 hover:text-white transition-colors select-none">
                    {label}
                </label>
            )}
        </div>
    );
};

export default Checkbox;
