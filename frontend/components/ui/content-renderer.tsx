'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  // Default: all sections expanded
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

  const expandAll = () => {
    setExpandedSections(new Set(['MỞ ĐẦU', 'THÂN BÀI', 'KẾT LUẬN']));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Parse content into major sections only (MỞ ĐẦU, THÂN BÀI, KẾT LUẬN)
  const parseContent = (text: string) => {
    // Normalize section headers - remove markdown markers before section names
    text = text.replace(/^#{1,4}\s*(MỞ ĐẦU|MỞ\s*ĐẦU)/gim, 'MỞ ĐẦU');
    text = text.replace(/^#{1,4}\s*(THÂN BÀI|THÂN\s*BÀI)/gim, 'THÂN BÀI');
    text = text.replace(/^#{1,4}\s*(KẾT LUẬN|KẾT\s*LUẬN)/gim, 'KẾT LUẬN');
    
    // Remove any remaining markdown headers that aren't section headers
    text = text.replace(/^#{1,4}\s+/gm, '');

    const sections: Array<{ title: string; content: string }> = [];

    // Find major sections with more flexible patterns
    const moThanMatch = text.match(/MỞ\s*ĐẦU\s*:?\s*([\s\S]*?)(?=THÂN\s*BÀI|KẾT\s*LUẬN|$)/i);
    const thanBaiMatch = text.match(/THÂN\s*BÀI\s*:?\s*([\s\S]*?)(?=KẾT\s*LUẬN|$)/i);
    const ketLuanMatch = text.match(/KẾT\s*LUẬN\s*:?\s*([\s\S]*?)$/i);

    if (moThanMatch) {
      const content = moThanMatch[1].trim();
      if (content) sections.push({ title: 'MỞ ĐẦU', content });
    }
    if (thanBaiMatch) {
      const content = thanBaiMatch[1].trim();
      if (content) sections.push({ title: 'THÂN BÀI', content });
    }
    if (ketLuanMatch) {
      const content = ketLuanMatch[1].trim();
      if (content) sections.push({ title: 'KẾT LUẬN', content });
    }

    // If no sections found, return entire content as one section
    if (sections.length === 0) {
      // Clean up any markdown syntax for display
      const cleanedText = text.replace(/^#{1,4}\s+/gm, '').trim();
      sections.push({ title: 'Nội dung', content: cleanedText });
    }

    return sections;
  };

  const formatContent = (text: string) => {
    // Remove ** bold markers (keep content)
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');

    // Remove * italic markers (but not bullet points)
    text = text.replace(/(?<!^|\n)\*([^*\n]+?)\*(?!\*)/g, '$1');

    // Convert bullet points and numbered lists to proper list items
    const lines = text.split('\n');
    const formatted: JSX.Element[] = [];
    let listItems: string[] = [];
    let numberedItems: string[] = [];
    let currentListType: 'bullet' | 'numbered' | null = null;

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();
      
      // Check for bullet points (•, -, *)
      const bulletMatch = trimmedLine.match(/^[•\-\*]\s+(.+)$/);
      if (bulletMatch) {
        // If we were in a numbered list, flush it first
        if (currentListType === 'numbered' && numberedItems.length > 0) {
          formatted.push(
            <ol key={`ol-${idx}`} className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
              {numberedItems.map((item, i) => (
                <li key={i} className="ml-2">{item}</li>
              ))}
            </ol>
          );
          numberedItems = [];
        }
        
        currentListType = 'bullet';
        const item = bulletMatch[1].trim();
        listItems.push(item);
        return;
      }

      // Check for numbered lists (1., 2., 3. or 1) 2) 3))
      const numberedMatch = trimmedLine.match(/^(\d+)[\.\)]\s+(.+)$/);
      if (numberedMatch) {
        // If we were in a bullet list, flush it first
        if (currentListType === 'bullet' && listItems.length > 0) {
          formatted.push(
            <ul key={`ul-${idx}`} className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
              {listItems.map((item, i) => (
                <li key={i} className="ml-2">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
        }
        
        currentListType = 'numbered';
        const item = numberedMatch[2].trim();
        numberedItems.push(item);
        return;
      }

      // If we hit a non-list line, flush any pending lists
      if (currentListType === 'bullet' && listItems.length > 0) {
        formatted.push(
          <ul key={`ul-${idx}`} className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="ml-2">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
        currentListType = null;
      }

      if (currentListType === 'numbered' && numberedItems.length > 0) {
        formatted.push(
          <ol key={`ol-${idx}`} className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
            {numberedItems.map((item, i) => (
              <li key={i} className="ml-2">{item}</li>
            ))}
          </ol>
        );
        numberedItems = [];
        currentListType = null;
      }

      // Regular paragraph (skip empty lines)
      if (trimmedLine) {
        formatted.push(
          <p key={`p-${idx}`} className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    // Flush remaining lists at the end
    if (listItems.length > 0) {
      formatted.push(
        <ul key="ul-final" className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="ml-2">{item}</li>
          ))}
        </ul>
      );
    }

    if (numberedItems.length > 0) {
      formatted.push(
        <ol key="ol-final" className="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300 ml-4">
          {numberedItems.map((item, i) => (
            <li key={i} className="ml-2">{item}</li>
          ))}
        </ol>
      );
    }

    return formatted;
  };

  const sections = parseContent(content);

  return (
    <div className="space-y-4">
      {/* Control buttons */}
      {sections.length > 1 && (
        <div className="flex gap-2 justify-end mb-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all"
          >
            Mở tất cả
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 rounded-lg transition-all"
          >
            Đóng tất cả
          </button>
        </div>
      )}

      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.title);

        return (
          <div
            key={section.title}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <h3 className="text-lg font-bold text-white">
                {section.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {isExpanded ? 'Đóng' : 'Mở'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 bg-white dark:bg-gray-800 animate-fadeIn">
                {formatContent(section.content)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
