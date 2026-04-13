import React from "react";

const OutputView = ({ content, type, isLoading, hasResults }) => (
  <div className="output-view min-h-30">
    {isLoading ? (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
      </div>
    ) : hasResults ? (
      type === "quiz" ? (
        <div>{content}</div>
      ) : type === "notes" ? (
        <ul className="list-disc pl-6 space-y-2">{content}</ul>
      ) : (
        <p className="whitespace-pre-line leading-relaxed">{content}</p>
      )
    ) : (
      <div className="text-slate-400 text-sm md:text-base text-center py-10">
        Generate content to see results here.
      </div>
    )}
  </div>
);

export default OutputView;
