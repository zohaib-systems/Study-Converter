import React from "react";


const InputBox = ({
  value,
  onChange,
  onProcess,
  onGenerateSummary,
  onGenerateNotes,
  onGenerateQuiz,
  charLimit,
  loading,
}) => (
  <div className="input-box w-full my-4">
    <textarea
      className="input-box__textarea w-full h-44 md:h-52 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base resize-vertical bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
      maxLength={charLimit}
      value={value}
      onChange={onChange}
      placeholder="Paste your study content here..."
      disabled={loading}
      spellCheck={true}
      autoFocus
    />
    <div className="input-box__footer flex flex-col gap-3 mt-3">
      <div className="input-box__actions flex flex-wrap gap-2">
        <button className="input-box__button input-box__button--secondary" onClick={onGenerateSummary} disabled={loading || value.length === 0}>
          Generate Summary
        </button>
        <button className="input-box__button input-box__button--secondary" onClick={onGenerateNotes} disabled={loading || value.length === 0}>
          Generate Notes
        </button>
        <button className="input-box__button input-box__button--secondary" onClick={onGenerateQuiz} disabled={loading || value.length === 0}>
          Generate Quiz
        </button>
      </div>
      <div className="input-box__meta flex flex-col md:flex-row justify-between items-center gap-2">
      <span className="input-box__count text-xs md:text-sm text-gray-500 dark:text-gray-400 tracking-wide">
        {value.length} / {charLimit} characters
      </span>
      <button
        className="input-box__button input-box__button--primary"
        onClick={onProcess}
        disabled={loading || value.length === 0}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Processing...
          </span>
        ) : "Generate All"}
      </button>
      </div>
    </div>
  </div>
);

export default InputBox;
