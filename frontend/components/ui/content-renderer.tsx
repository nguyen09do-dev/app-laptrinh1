'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['MỞ ĐẦU', 'THÂN BÀI', 'KẾT LUẬN']));

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  // Parse content into major sections only (MỞ ĐẦU, THÂN BÀI, KẾT LUẬN)
  const parseContent = (text: string) => {
    // Remove ### and ## markers from the content
    text = text.replace(/^###\s+/gm, '').replace(/^##\s+/gm, '');

    const sections: Array<{ title: string; content: string }> = [];

    // Find major sections
    const moThanMatch = text.match(/MỞ ĐẦU([\s\S]*?)(?=THÂN BÀI|KẾT LUẬN|$)/i);
    const thanBaiMatch = text.match(/THÂN BÀI([\s\S]*?)(?=KẾT LUẬN|$)/i);
    const ketLuanMatch = text.match(/KẾT LUẬN([\s\S]*?)$/i);

    if (moThanMatch) {
      sections.push({ title: 'MỞ ĐẦU', content: moThanMatch[1].trim() });
    }
    if (thanBaiMatch) {
      sections.push({ title: 'THÂN BÀI', content: thanBaiMatch[1].trim() });
    }
    if (ketLuanMatch) {
      sections.push({ title: 'KẾT LUẬN', content: ketLuanMatch[1].trim() });
    }

    // If no sections found, return entire content as one section
    if (sections.length === 0) {
      sections.push({ title: 'Nội dung', content: text });
    }

    return sections;
  };

  const formatContent = (text: string) => {
    // Remove ** bold markers
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');

    // Remove * italic markers
    text = text.replace(/\*(.+?)\*/g, '$1');

    // Convert bullet points to proper list items
    const lines = text.split('\n');
    const formatted: JSX.Element[] = [];
    let listItems: string[] = [];
    let numberedItems: string[] = [];

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
          <ul key={`ul-${idx}`} className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
            {listItems.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }

      // Flush numbered list
      if (numberedItems.length > 0) {
        formatted.push(
          <ol key={`ol-${idx}`} className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
            {numberedItems.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ol>
        );
        numberedItems = [];
      }

      // Regular paragraph
      if (line.trim()) {
        formatted.push(
          <p key={`p-${idx}`} className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    // Flush remaining lists
    if (listItems.length > 0) {
      formatted.push(
        <ul key="ul-final" className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
          {listItems.map((item, i) => (
            <li key={i} className="ml-4">{item}</li>
          ))}
        </ul>
      );
    }

    if (numberedItems.length > 0) {
      formatted.push(
        <ol key="ol-final" className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">
          {numberedItems.map((item, i) => (
            <li key={i} className="ml-4">{item}</li>
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
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              <h3 className="text-lg font-bold text-white">
                {section.title}
              </h3>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </button>

            {isExpanded && (
              <div className="px-6 py-4 bg-white dark:bg-gray-800">
                {formatContent(section.content)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
