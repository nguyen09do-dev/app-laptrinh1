'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  // Parse markdown sections and expand all by default
  const sections = parseContent(content);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.title))
  );

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  // Parse content into sections based on markdown headers (## and ###)
  function parseContent(text: string) {
    const sections: Array<{ title: string; content: string; level: number }> = [];

    // Split by ## headers (main sections)
    const h2Regex = /^##\s+(.+)$/gm;
    const parts: Array<{ title: string; content: string; index: number }> = [];

    let match;
    let lastIndex = 0;

    while ((match = h2Regex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        // Content before first header
        const beforeContent = text.substring(lastIndex, match.index).trim();
        if (beforeContent) {
          parts.push({
            title: 'Giới thiệu',
            content: beforeContent,
            index: lastIndex
          });
        }
      }

      parts.push({
        title: match[1].trim(),
        content: '',
        index: match.index
      });

      lastIndex = match.index + match[0].length;
    }

    // Extract content for each section
    for (let i = 0; i < parts.length; i++) {
      const start = parts[i].index + (text.substring(parts[i].index).indexOf('\n') + 1 || 0);
      const end = i < parts.length - 1 ? parts[i + 1].index : text.length;
      parts[i].content = text.substring(start, end).trim();
    }

    // If no headers found, treat entire content as one section
    if (parts.length === 0) {
      sections.push({
        title: 'Nội dung',
        content: text.trim(),
        level: 2
      });
    } else {
      parts.forEach(part => {
        sections.push({
          title: part.title,
          content: part.content,
          level: 2
        });
      });
    }

    return sections;
  }

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const formatted: JSX.Element[] = [];
    let listItems: string[] = [];
    let numberedItems: string[] = [];
    let lineIndex = 0;

    const renderInline = (text: string) => {
      // Process bold **text**
      const parts: (string | JSX.Element)[] = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-gray-900 dark:text-white">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    };

    const flushLists = (idx: number) => {
      if (listItems.length > 0) {
        formatted.push(
          <ul key={`ul-${idx}`} className="list-disc list-outside space-y-2 my-4 ml-6 text-gray-700 dark:text-gray-300">
            {listItems.map((item, i) => (
              <li key={i}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }

      if (numberedItems.length > 0) {
        formatted.push(
          <ol key={`ol-${idx}`} className="list-decimal list-outside space-y-2 my-4 ml-6 text-gray-700 dark:text-gray-300">
            {numberedItems.map((item, i) => (
              <li key={i}>{renderInline(item)}</li>
            ))}
          </ol>
        );
        numberedItems = [];
      }
    };

    lines.forEach((line, idx) => {
      lineIndex = idx;

      // Check for ### subheadings
      if (line.trim().match(/^###\s+/)) {
        flushLists(idx);
        const heading = line.trim().replace(/^###\s+/, '');
        formatted.push(
          <h4 key={`h4-${idx}`} className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">
            {heading}
          </h4>
        );
        return;
      }

      // Check for #### subheadings
      if (line.trim().match(/^####\s+/)) {
        flushLists(idx);
        const heading = line.trim().replace(/^####\s+/, '');
        formatted.push(
          <h5 key={`h5-${idx}`} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            {heading}
          </h5>
        );
        return;
      }

      // Check for bullet points (-, *, •)
      if (line.trim().match(/^[-\*•]\s+/)) {
        const item = line.trim().replace(/^[-\*•]\s+/, '');
        listItems.push(item);
        return;
      }

      // Check for numbered lists
      if (line.trim().match(/^\d+\.\s+/)) {
        const item = line.trim().replace(/^\d+\.\s+/, '');
        numberedItems.push(item);
        return;
      }

      // Flush lists before paragraph
      flushLists(idx);

      // Regular paragraph
      if (line.trim()) {
        formatted.push(
          <p key={`p-${idx}`} className="mb-3 text-gray-800 dark:text-gray-200 leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
    });

    // Flush remaining lists
    flushLists(lineIndex + 1);

    return formatted;
  };

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
