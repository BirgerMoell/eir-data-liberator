/**
 * 1177.se Normalizer
 * 
 * Converts raw 1177.se scraped data into EIR standard format.
 * Handles Swedish-specific field mappings and extractions.
 */

class Normalizer1177 {
  /**
   * Format date string to ISO format (YYYY-MM-DD)
   * Handles Swedish date formats like "17 mar 2025"
   * @param {string} dateString - Date string in Swedish format
   * @returns {string} - ISO format date (YYYY-MM-DD) or 'Unknown'
   */
  static formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    // Clean the date string
    const cleanDate = dateString.replace(/\s+/g, ' ').trim();
    
    // Swedish month names mapping
    const monthMap = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'maj': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
    };
    
    // First try to find a clean date pattern (Swedish format: "17 mar 2025")
    const dateMatch = cleanDate.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const monthNum = monthMap[month.toLowerCase()];
      if (monthNum) {
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    }
    
    // Look for YYYY-MM-DD format
    const isoMatch = cleanDate.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      return isoMatch[1];
    }
    
    // Look for YYYY-MM-DD in the beginning of the string
    const isoStartMatch = cleanDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoStartMatch) {
      return isoStartMatch[1];
    }
    
    // If the date string contains a lot of text, try to extract just the date part
    if (cleanDate.length > 20) {
      // Look for date patterns within longer strings
      const embeddedDateMatch = cleanDate.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
      if (embeddedDateMatch) {
        const [, day, month, year] = embeddedDateMatch;
        const monthNum = monthMap[month.toLowerCase()];
        if (monthNum) {
          return `${year}-${monthNum}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    // If we can't parse it, return Unknown
    return 'Unknown';
  }
  
  /**
   * Extract time from text (Swedish format: "klockan 10:52")
   * @param {string} text - Text that may contain time information
   * @returns {string} - Time in HH:MM format or 'Unknown'
   */
  static extractTime(text) {
    if (!text) return 'Unknown';
    
    // Look for time patterns like "klockan 10:52", "10:52", etc.
    const timeMatch = text.match(/(?:klockan\s+)?(\d{1,2}:\d{2})/);
    if (timeMatch) {
      return timeMatch[1];
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract region from source/provider name (Swedish regions)
   * @param {string} source - Provider/source name
   * @returns {string} - Region name or 'Unknown'
   */
  static extractRegion(source) {
    if (!source) return 'Unknown';
    
    // Look for Swedish region patterns
    if (source.includes('Region Uppsala')) return 'Region Uppsala';
    if (source.includes('Stockholm')) return 'Stockholm';
    if (source.includes('Danderyd')) return 'Danderyd';
    if (source.includes('Västerbotten')) return 'Västerbotten';
    if (source.includes('Region')) {
      // Try to extract region name
      const regionMatch = source.match(/Region\s+([^,]+)/);
      if (regionMatch) {
        return `Region ${regionMatch[1].trim()}`;
      }
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract status from text (Swedish status keywords)
   * @param {string} text - Entry text
   * @returns {string} - Status or 'Unknown'
   */
  static extractStatus(text) {
    if (!text) return 'Unknown';
    
    if (text.includes('Nytt')) return 'Nytt';
    if (text.includes('Osignerad')) return 'Osignerad';
    if (text.includes('Signerad')) return 'Signerad';
    
    return 'Unknown';
  }
  
  /**
   * Extract responsible person from text (Swedish patterns)
   * @param {string} text - Entry text
   * @returns {string} - Person name or 'Unknown'
   */
  static extractResponsiblePerson(text) {
    if (!text) return 'Unknown';
    
    // Look for patterns like "Antecknad av Therese Karlberg (Distriktssköterska)"
    const personMatch = text.match(/Antecknad av ([^(]+)\s*\(/);
    if (personMatch) {
      return personMatch[1].trim();
    }
    
    // Look for other patterns
    const otherMatch = text.match(/(?:Vaccinerad av|Ordinatör|Ansvarig för kontakten)\s+([^(]+)/);
    if (otherMatch) {
      return otherMatch[1].trim();
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract role from text (Swedish patterns)
   * @param {string} text - Entry text
   * @returns {string} - Role or 'Unknown'
   */
  static extractRole(text) {
    if (!text) return 'Unknown';
    
    // Look for role patterns in parentheses
    const roleMatch = text.match(/\(([^)]+)\)/);
    if (roleMatch) {
      return roleMatch[1].trim();
    }
    
    return 'Unknown';
  }
  
  /**
   * Generate summary for entry
   * @param {Object} entry - Raw entry object
   * @returns {string} - Summary text
   */
  static generateSummary(entry) {
    const category = entry.category || '';
    const type = entry.title || '';
    
    if (category && type) {
      return `${category} - ${type}`;
    } else if (category) {
      return category;
    } else if (type) {
      return type;
    }
    
    return 'Journal Entry';
  }
  
  /**
   * Extract notes from text
   * @param {string} text - Entry text
   * @returns {Array<string>} - Array of note strings
   */
  static extractNotes(text) {
    if (!text) return [];
    
    const notes = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Look for specific note patterns
    for (const line of lines) {
      if (line.includes(':') && !line.includes('http') && line.length > 10) {
        notes.push(line);
      }
    }
    
    return notes.slice(0, 10); // Limit to 10 notes per entry
  }
  
  /**
   * Generate tags for entry (Swedish keywords)
   * @param {Object} entry - Raw entry object
   * @returns {Array<string>} - Array of tag strings
   */
  static generateTags(entry) {
    const tags = [];
    
    // Category-based tags
    if (entry.category) {
      tags.push(entry.category.toLowerCase());
    }
    
    // Content-based tags (Swedish keywords)
    const text = entry.text || '';
    
    if (text.includes('akut') || text.includes('Akut')) tags.push('akut');
    if (text.includes('vaccination') || text.includes('Vaccination')) tags.push('vaccination');
    if (text.includes('tandvård') || text.includes('Tandvård')) tags.push('tandvård');
    if (text.includes('diagnos') || text.includes('Diagnos')) tags.push('diagnos');
    if (text.includes('besök') || text.includes('Besök')) tags.push('besök');
    if (text.includes('osignerad') || text.includes('Osignerad')) tags.push('osignerad');
    if (text.includes('distriktssköterska')) tags.push('distriktssköterska');
    if (text.includes('tandläkare')) tags.push('tandläkare');
    if (text.includes('läkare')) tags.push('läkare');
    
    // Remove duplicates and return
    return [...new Set(tags)];
  }
  
  /**
   * Normalize raw 1177 entry data to EIR format
   * @param {Object} rawEntry - Raw entry from scraper
   * @param {number} index - Entry index (for ID generation)
   * @returns {Object} - Normalized entry in EIR format
   */
  static normalizeEntry(rawEntry, index) {
    return {
      id: `entry_${String(index + 1).padStart(3, '0')}`,
      date: this.formatDate(rawEntry.date),
      time: this.extractTime(rawEntry.text),
      category: rawEntry.category || 'Unknown',
      type: rawEntry.title || 'Unknown',
      provider: {
        name: rawEntry.source || 'Unknown',
        region: this.extractRegion(rawEntry.source),
        location: rawEntry.source || 'Unknown'
      },
      status: this.extractStatus(rawEntry.text),
      responsible_person: {
        name: this.extractResponsiblePerson(rawEntry.text),
        role: this.extractRole(rawEntry.text)
      },
      content: {
        summary: this.generateSummary(rawEntry),
        details: rawEntry.text ? (rawEntry.text.substring(0, 200) + (rawEntry.text.length > 200 ? '...' : '')) : '',
        notes: this.extractNotes(rawEntry.text)
      },
      attachments: [],
      tags: this.generateTags(rawEntry),
      // Keep original text for reference
      text: rawEntry.text
    };
  }
  
  /**
   * Normalize array of raw entries to EIR format
   * @param {Array} rawEntries - Array of raw entries from scraper
   * @returns {Array} - Array of normalized entries
   */
  static normalize(rawEntries) {
    return rawEntries.map((entry, index) => this.normalizeEntry(entry, index));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Normalizer1177;
} else {
  window.Normalizer1177 = Normalizer1177;
}

