/**
 * Convert markdown text to HTML for email/blog publishing
 * Supports: bold, italic, bullets, numbered lists, line breaks, paragraphs
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  // Step 1: Convert **bold** to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Step 2: Convert *italic* to <em> (but not after conversion to avoid breaking <strong>)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Step 3: Split into lines for list and paragraph processing
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // Handle bullet points (-, *, •)
    if (/^[-*•]\s+/.test(line)) {
      if (!inUnorderedList) {
        processedLines.push('<ul style="margin: 10px 0; padding-left: 20px;">');
        inUnorderedList = true;
      }
      const content = line.replace(/^[-*•]\s+/, '').trim();
      processedLines.push(`<li style="margin: 5px 0;">${content}</li>`);
      
      // Check if next line is not a bullet point
      if (!/^[-*•]\s+/.test(nextLine) && nextLine !== '') {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
    }
    // Handle numbered lists (1., 2., etc.)
    else if (/^\d+\.\s+/.test(line)) {
      if (!inOrderedList) {
        processedLines.push('<ol style="margin: 10px 0; padding-left: 20px;">');
        inOrderedList = true;
      }
      const content = line.replace(/^\d+\.\s+/, '').trim();
      processedLines.push(`<li style="margin: 5px 0;">${content}</li>`);
      
      // Check if next line is not a numbered item
      if (!/^\d+\.\s+/.test(nextLine) && nextLine !== '') {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
    }
    // Handle empty lines
    else if (line === '') {
      // Close any open lists
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      // Add line break for spacing
      if (processedLines.length > 0 && !processedLines[processedLines.length - 1].startsWith('<br')) {
        processedLines.push('<br/>');
      }
    }
    // Regular paragraph text
    else {
      // Close any open lists first
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      
      // Wrap in paragraph tags with styling
      processedLines.push(`<p style="margin: 10px 0; line-height: 1.6;">${line}</p>`);
    }
  }

  // Close any remaining open lists
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }
  if (inOrderedList) {
    processedLines.push('</ol>');
  }

  html = processedLines.join('\n');

  // Step 4: Handle links [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #0066cc; text-decoration: none;">$1</a>');

  // Step 5: Clean up multiple consecutive <br/> tags
  html = html.replace(/(<br\s*\/?>\s*){3,}/g, '<br/><br/>');

  // Step 6: Wrap entire content in a container div with basic styling
  html = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 600px;">
${html}
</div>`;

  return html;
}

/**
 * Convert markdown to plain text (strip all formatting)
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let text = markdown;

  // Remove bold markers
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');

  // Remove italic markers
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1');

  // Remove link markdown [text](url) -> text
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  // Clean up bullet points
  text = text.replace(/^[-*•]\s+/gm, '• ');

  return text.trim();
}

/**
 * Extract first paragraph from markdown (useful for email subject/preview)
 */
export function getFirstParagraph(markdown: string, maxLength: number = 150): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Get plain text first
  const plainText = markdownToPlainText(markdown);

  // Split by double newlines to get paragraphs
  const paragraphs = plainText.split(/\n\n+/);

  // Get first non-empty paragraph
  const firstParagraph = paragraphs.find((p) => p.trim().length > 0) || '';

  // Truncate if too long
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength).trim() + '...';
  }

  return firstParagraph.trim();
}

