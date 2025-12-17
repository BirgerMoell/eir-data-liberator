/**
 * File Downloader
 * 
 * Handles downloading files (text, EIR format) to the user's computer.
 * Provider-agnostic utility functions.
 */

class FileDownloader {
  /**
   * Download content as a text file
   * @param {string} content - The file content
   * @param {string} filename - The filename (e.g., 'journal-content.txt')
   */
  static downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`Downloaded ${filename} (${content.length} characters)`);
  }
  
  /**
   * Format journal entries into a readable text format
   * @param {Array} entries - Array of normalized journal entries
   * @param {Object} metadata - Patient and export metadata
   * @returns {string} - Formatted text content
   */
  static formatJournalContent(entries, metadata = {}) {
    const patientName = metadata.patient?.name || 'Unknown';
    const providerName = metadata.source || 'Unknown Provider';
    const downloadDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const header = `
=== ${providerName.toUpperCase()} JOURNAL DOWNLOAD ===
Downloaded: ${downloadDate}
Patient: ${patientName}
Total Entries: ${entries.length}

========================================

`;
    
    let content = header;
    
    entries.forEach((entry, index) => {
      content += `\n--- ENTRY ${index + 1} ---\n`;
      
      if (entry.date) {
        content += `Date: ${entry.date}\n`;
      }
      
      if (entry.time && entry.time !== 'Unknown') {
        content += `Time: ${entry.time}\n`;
      }
      
      if (entry.title || entry.type) {
        content += `Title: ${entry.title || entry.type}\n`;
      }
      
      if (entry.category) {
        content += `Category: ${entry.category}\n`;
      }
      
      if (entry.provider?.name) {
        content += `Provider: ${entry.provider.name}\n`;
      }
      
      if (entry.provider?.region) {
        content += `Region: ${entry.provider.region}\n`;
      }
      
      if (entry.responsible_person?.name) {
        content += `Responsible: ${entry.responsible_person.name}`;
        if (entry.responsible_person.role) {
          content += ` (${entry.responsible_person.role})`;
        }
        content += '\n';
      }
      
      if (entry.status) {
        content += `Status: ${entry.status}\n`;
      }
      
      if (entry.content?.summary) {
        content += `\nSummary:\n${entry.content.summary}\n`;
      }
      
      if (entry.content?.details) {
        content += `\nDetails:\n${entry.content.details}\n`;
      }
      
      if (entry.content?.notes && entry.content.notes.length > 0) {
        content += `\nNotes:\n`;
        entry.content.notes.forEach(note => {
          content += `  - ${note}\n`;
        });
      }
      
      if (entry.tags && entry.tags.length > 0) {
        content += `\nTags: ${entry.tags.join(', ')}\n`;
      }
      
      content += `\n${'='.repeat(50)}\n`;
    });
    
    // Add page metadata
    content += `\n\n=== PAGE METADATA ===\n`;
    content += `URL: ${window.location.href}\n`;
    content += `Download Time: ${new Date().toISOString()}\n`;
    content += `User Agent: ${navigator.userAgent}\n`;
    
    return content;
  }
  
  /**
   * Download both text and EIR format files
   * @param {Array} entries - Normalized journal entries
   * @param {Object} eirData - EIR format data object
   * @param {string} baseFilename - Base filename (without extension)
   */
  static downloadAllFormats(entries, eirData, baseFilename = 'journal-content') {
    // Download text format
    const textContent = this.formatJournalContent(entries, eirData.metadata);
    this.downloadTextFile(textContent, `${baseFilename}.txt`);
    
    // Download EIR format (YAML)
    // Note: EIR formatter should be used to convert eirData to YAML
    // This will be called from the main content script with the YAML string
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileDownloader;
} else {
  window.FileDownloader = FileDownloader;
}

