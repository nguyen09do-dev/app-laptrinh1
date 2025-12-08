'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Citation {
  index: number;
  doc_id: string;
  title: string;
  snippet: string;
  url?: string;
}

interface ContentRendererWithCitationsProps {
  content: string;
  citations?: Citation[];
}

export function ContentRendererWithCitations({
  content,
  citations = [],
}: ContentRendererWithCitationsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['MỞ ĐẦU', 'THÂN BÀI', 'KẾT LUẬN', 'Nội dung'])
  );
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const parseContent = (text: string) => {
    text = text.replace(/^###\s+/gm, '').replace(/^##\s+/gm, '');

    const sections: Array<{ title: string; content: string }> = [];

    const moThanMatch = text.match(/MỞ ĐẦU([\s\S]*?)(?=THÂN BÀI|KẾT LUẬN|Nguồn tham khảo|$)/i);
    const thanBaiMatch = text.match(/THÂN BÀI([\s\S]*?)(?=KẾT LUẬN|Nguồn tham khảo|$)/i);
    const ketLuanMatch = text.match(/KẾT LUẬN([\s\S]*?)(?=Nguồn tham khảo|$)/i);

    if (moThanMatch) {
      sections.push({ title: 'MỞ ĐẦU', content: moThanMatch[1].trim() });
    }
    if (thanBaiMatch) {
      sections.push({ title: 'THÂN BÀI', content: thanBaiMatch[1].trim() });
    }
    if (ketLuanMatch) {
      sections.push({ title: 'KẾT LUẬN', content: ketLuanMatch[1].trim() });
    }

    if (sections.length === 0) {
      sections.push({ title: 'Nội dung', content: text });
    }

    return sections;
  };

  const scrollToCitation = (index: number) => {
    const element = document.getElementById(`citation-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-coral-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-coral-500');
      }, 2000);
    }
  };

  const renderCitationBadge = (citationIndex: number) => {
    const citation = citations.find((c) => c.index === citationIndex);

    return (
      <span
        className="relative inline-block ml-0.5 cursor-pointer group"
        onMouseEnter={() => setHoveredCitation(citationIndex)}
        onMouseLeave={() => setHoveredCitation(null)}
        onClick={(e) => {
          e.stopPropagation();
          scrollToCitation(citationIndex);
        }}
      >
        <span className="inline-flex items-center px-1.5 py-0.5 bg-coral-500/20 text-coral-400 text-xs font-bold rounded border border-coral-500/30 hover:bg-coral-500/30 hover:border-coral-500/50 transition-all">
          [{citationIndex}]
        </span>

        {/* Tooltip */}
        {hoveredCitation === citationIndex && citation && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-midnight-900 border border-midnight-700 rounded-lg shadow-xl">
            <p className="text-white font-semibold text-sm mb-1">{citation.title}</p>
            <p className="text-midnight-300 text-xs line-clamp-2">{citation.snippet}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-midnight-700"></div>
          </div>
        )}
      </span>
    );
  };

  const formatContentWithCitations = (text: string) => {
    // Remove markdown formatting
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');

    const lines = text.split('\n');
    const formatted: JSX.Element[] = [];
    let listItems: string[] = [];
    let numberedItems: string[] = [];

    const renderTextWithCitations = (lineText: string, key: string) => {
      // Parse citations [1], [2], etc.
      const citationRegex = /\[(\d+)\]/g;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = citationRegex.exec(lineText)) !== null) {
        // Add text before citation
        if (match.index > lastIndex) {
          parts.push(lineText.substring(lastIndex, match.index));
        }

        // Add citation badge
        const citationIndex = parseInt(match[1], 10);
        parts.push(renderCitationBadge(citationIndex));

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < lineText.length) {
        parts.push(lineText.substring(lastIndex));
      }

      return parts.length > 0 ? parts : lineText;
    };

    lines.forEach((line, idx) => {
      // Check for bullet points
      if (line.trim().match(/^[•\-\*]\s+/)) {
        const item = line.trim().replace(/^[•\-\*]\s+/, '');
        listItems.push(item);
        return;
      }

      // Check for numbered lists
      if (line.trim().match(/^\d+\.\s+/)) {
        const item = line.trim().replace(/^\d+\.\s+/, '');
        numberedItems.push(item);
        return;
      }

      // Flush bullet list
      if (listItems.length > 0) {
        formatted.push(
          <ul
            key={`ul-${idx}`}
            className="list-disc list-inside space-y-2 my-4 text-midnight-200"
          >
            {listItems.map((item, i) => (
              <li key={i} className="ml-4">
                {renderTextWithCitations(item, `li-${idx}-${i}`)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }

      // Flush numbered list
      if (numberedItems.length > 0) {
        formatted.push(
          <ol
            key={`ol-${idx}`}
            className="list-decimal list-inside space-y-2 my-4 text-midnight-200"
          >
            {numberedItems.map((item, i) => (
              <li key={i} className="ml-4">
                {renderTextWithCitations(item, `oli-${idx}-${i}`)}
              </li>
            ))}
          </ol>
        );
        numberedItems = [];
      }

      // Regular paragraph
      if (line.trim()) {
        formatted.push(
          <p key={`p-${idx}`} className="mb-4 text-midnight-200 leading-relaxed">
            {renderTextWithCitations(line, `p-${idx}`)}
          </p>
        );
      }
    });

    // Flush remaining lists
    if (listItems.length > 0) {
      formatted.push(
        <ul key="ul-final" className="list-disc list-inside space-y-2 my-4 text-midnight-200">
          {listItems.map((item, i) => (
            <li key={i} className="ml-4">
              {renderTextWithCitations(item, `li-final-${i}`)}
            </li>
          ))}
        </ul>
      );
    }

    if (numberedItems.length > 0) {
      formatted.push(
        <ol key="ol-final" className="list-decimal list-inside space-y-2 my-4 text-midnight-200">
          {numberedItems.map((item, i) => (
            <li key={i} className="ml-4">
              {renderTextWithCitations(item, `oli-final-${i}`)}
            </li>
          ))}
        </ol>
      );
    }

    return formatted;
  };

  const sections = parseContent(content);

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.title);

        return (
          <div
            key={section.title}
            className="glass-card rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-coral-500/20 to-coral-600/20 hover:from-coral-500/30 hover:to-coral-600/30 border-b border-midnight-700 transition-colors"
            >
              <h3 className="text-lg font-display font-bold text-white">
                {section.title}
              </h3>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-coral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-coral-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-6 py-4 bg-midnight-900/30">
                {formatContentWithCitations(section.content)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
