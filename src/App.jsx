
import { useMemo, useState } from "react";
import InputBox from "./components/InputBox";
import Tabs from "./components/Tabs";
import OutputView from "./components/OutputView";
import { summarizeText } from "./utils/summarizer";
import { generateNotes } from "./utils/notesGenerator";
import { generateQuiz } from "./utils/quizGenerator";
import jsPDF from "jspdf";
import "./index.css";

const TABS = ["Summary", "Notes", "Quiz"];
const CHAR_LIMIT = 5000;
const AVERAGE_READING_WPM = 200;
const STOPWORDS = new Set([
  "the","is","in","at","of","a","and","to","it","for","on","with","as","by","an","be","this","that","from","or","are","was","but","not","have","has","had","were","which","will","would","can","could","should","may","might","do","does","did","so","if","than","then","about","into","more","most","such","no","nor","too","very","also","just","any","all","each","other","some","own","same","over","after","before","between","both","few","because","while","during","where","when","how","what","who","whom","whose","why","these","those","he","she","they","we","you","i","me","him","her","them","us","my","your","his","their","our","its"
]);

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState([]);
  const [quiz, setQuiz] = useState([]);

  const words = useMemo(() => input.match(/\b\w+\b/g) || [], [input]);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / AVERAGE_READING_WPM));

  const keywordCounts = useMemo(() => {
    const counts = {};
    for (const word of words) {
      const normalized = word.toLowerCase();
      if (!STOPWORDS.has(normalized)) {
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
    return counts;
  }, [words]);

  const topKeywords = useMemo(
    () => Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).map(([keyword]) => keyword).slice(0, 5),
    [keywordCounts]
  );

  const hasResults = summary.length > 0 || notes.length > 0 || quiz.length > 0;

  function highlightKeywords(text, keywords) {
    if (!keywords.length) return text;
    const re = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    return text.replace(re, (match) => `<mark class='bg-amber-200 text-black rounded px-1'>${match}</mark>`);
  }

  const generateContent = (mode = "all") => {
    if (!input.trim()) return;

    setLoading(true);
    window.setTimeout(() => {
      if (mode === "summary" || mode === "all") {
        setSummary(summarizeText(input));
      }
      if (mode === "notes" || mode === "all") {
        setNotes(generateNotes(input));
      }
      if (mode === "quiz" || mode === "all") {
        setQuiz(generateQuiz(input));
      }
      setActiveTab(mode === "summary" ? 0 : mode === "notes" ? 1 : mode === "quiz" ? 2 : 0);
      setLoading(false);
    }, 250);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 18;

    const ensureSpace = (needed = 10) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text("Study Converter Output", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated from ${TABS[activeTab]} view`, margin, y);
    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    if (activeTab === 0) {
      ensureSpace(12);
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("Summary", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(doc.splitTextToSize(summary, pageWidth - margin * 2), margin, y);
    } else if (activeTab === 1) {
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("Notes", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      notes.forEach((n) => {
        ensureSpace(16);
        doc.setFont(undefined, "bold");
        doc.text(`• ${n.heading}`, margin, y);
        y += 7;
        doc.setFont(undefined, "normal");
        n.points.forEach((p) => {
          const lines = doc.splitTextToSize(`- ${p}`, pageWidth - margin * 2 - 4);
          ensureSpace(lines.length * 6 + 4);
          doc.text(lines, margin + 4, y);
          y += lines.length * 6;
        });
        y += 2;
      });
    } else if (activeTab === 2) {
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("Quiz", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      quiz.forEach((q, i) => {
        const questionLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, pageWidth - margin * 2);
        ensureSpace(questionLines.length * 6 + 30);
        doc.setFont(undefined, "bold");
        doc.text(questionLines, margin, y);
        y += questionLines.length * 6 + 2;
        doc.setFont(undefined, "normal");
        y += 7;
        q.options.forEach((opt, j) => {
          const optionLine = `${String.fromCharCode(65 + j)}. ${opt}`;
          const optionLines = doc.splitTextToSize(optionLine, pageWidth - margin * 2 - 8);
          ensureSpace(optionLines.length * 6 + 4);
          doc.text(optionLines, margin + 6, y);
          y += optionLines.length * 6;
        });
        ensureSpace(12);
        doc.setTextColor(22, 163, 74);
        doc.text(`Answer: ${q.answer}`, margin + 6, y + 2);
        doc.setTextColor(51, 65, 85);
        y += 11;
      });
    }
    doc.save("study-converter-output.pdf");
  };

  // Render output for each tab
  let outputContent;
  if (activeTab === 0) {
    outputContent = summary || <span className="text-gray-400">Your summary will appear here after generation.</span>;
  } else if (activeTab === 1) {
    outputContent = notes.length ? (
      notes.map((n, i) => (
        <li key={i}>
          <span className="font-semibold">{n.heading}:</span>
          <ul className="list-disc pl-6">
            {n.points.map((p, j) => (
              <li key={j}>{p}</li>
            ))}
          </ul>
        </li>
      ))
    ) : (
      <span className="text-gray-400">Your notes will appear here after generation.</span>
    );
  } else if (activeTab === 2) {
    outputContent = quiz.length ? (
      <ol className="space-y-4">
        {quiz.map((q, i) => (
          <li key={i}>
            <div className="mb-1 font-medium">{i + 1}. {q.question}</div>
            <ul className="pl-4">
              {q.options.map((opt, j) => (
                <li key={j}>{String.fromCharCode(65 + j)}. {opt}</li>
              ))}
            </ul>
            <div className="mt-1 text-green-600 text-sm">Answer: {q.answer}</div>
          </li>
        ))}
      </ol>
    ) : (
      <span className="text-gray-400">Your quiz will appear here after generation.</span>
    );
  }

  return (
    <div className="app-shell min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,#dbeafe,transparent_35%),radial-gradient(circle_at_85%_0%,#ede9fe,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)]">
      <main className="app-main flex-1 py-10 px-4 md:py-14">
        <div className="app-container w-full max-w-4xl mx-auto">
          <div className="app-card rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.14)] p-6 md:p-10">
            <header className="app-header mb-10">
              <div className="hero-badge">Rule-based study workflow</div>
              <h1 className="app-title text-center text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">Study Converter</h1>
              <p className="app-subtitle mt-4 text-center text-slate-600 text-base md:text-lg">Turn raw study text into summaries, structured notes, and quick quizzes in seconds.</p>
            </header>

            <section className="stats-grid mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 mb-7 md:grid-cols-3">
              <div className="stat-card rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Words</p>
                <p className="text-2xl font-bold text-slate-900">{wordCount}</p>
              </div>
              <div className="stat-card rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reading Time</p>
                <p className="text-2xl font-bold text-slate-900">{readingTime} min</p>
              </div>
              <div className="stat-card rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Top Keywords</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5 min-h-7">
                  {topKeywords.length ? topKeywords.map((k) => (
                    <span key={k} className="rounded-full bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1">{k}</span>
                  )) : <span className="text-slate-400 text-sm">None</span>}
                </div>
              </div>
            </section>

            <div className="input-section mb-5">
              <InputBox
                value={input}
                onChange={e => setInput(e.target.value)}
                onProcess={() => generateContent("all")}
                charLimit={CHAR_LIMIT}
                loading={loading}
                onGenerateSummary={() => generateContent("summary")}
                onGenerateNotes={() => generateContent("notes")}
                onGenerateQuiz={() => generateContent("quiz")}
              />
            </div>

            {input && (
              <section className="highlight-panel mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800">Highlighted Keywords</h2>
                <div className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightKeywords(input, topKeywords) }} />
              </section>
            )}

            <div className="tabs-wrap mx-auto mb-4 w-full max-w-2xl">
              <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="output-wrap mx-auto mb-8 w-full max-w-3xl">
              <OutputView
                content={outputContent}
                type={TABS[activeTab].toLowerCase()}
                isLoading={loading}
                hasResults={hasResults}
              />
            </div>

            <div className="actions-row sticky bottom-4 flex justify-end">
              <button
                className="export-btn px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExportPDF}
                disabled={loading || !hasResults}
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="app-footer w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} Study Converter. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
