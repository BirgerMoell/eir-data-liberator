/**
 * EIR Formatter
 * 
 * Converts normalized journal entries into EIR (YAML) format.
 * This is the universal standard format that all connectors output to.
 */

class EIRFormatter {
  /**
   * Generate EIR format data structure from normalized entries
   * @param {Array} entries - Normalized journal entries
   * @param {Object} metadata - Patient and export metadata
   * @returns {Object} - EIR format data structure
   */
  static generateEIRContent(entries, metadata = {}) {
    const currentDate = new Date().toISOString();
    
    // Extract date range from entries
    const validDates = entries
      .map(entry => entry.date)
      .filter(date => date && date !== 'Unknown' && date.match(/^\d{4}-\d{2}-\d{2}$/))
      .sort();
    
    const dateRange = {
      start: validDates[0] || 'Unknown',
      end: validDates[validDates.length - 1] || 'Unknown'
    };
    
    // Extract unique healthcare providers
    const providers = [...new Set(entries
      .map(entry => entry.provider?.name)
      .filter(name => name && name !== 'Unknown')
    )];
    
    // Build EIR structure
    const eirData = {
      metadata: {
        format_version: metadata.format_version || "1.0",
        created_at: metadata.created_at || currentDate,
        source: metadata.source || 'Unknown Provider',
        patient: {
          name: metadata.patient?.name || 'Unknown',
          birth_date: metadata.patient?.birth_date || null,
          personal_number: metadata.patient?.personal_number || null
        },
        export_info: {
          total_entries: entries.length,
          date_range: dateRange,
          healthcare_providers: providers
        }
      },
      entries: entries.map((entry, index) => ({
        id: entry.id || `entry_${String(index + 1).padStart(3, '0')}`,
        date: entry.date || 'Unknown',
        time: entry.time || 'Unknown',
        category: entry.category || 'Unknown',
        type: entry.type || entry.title || 'Unknown',
        provider: {
          name: entry.provider?.name || 'Unknown',
          region: entry.provider?.region || 'Unknown',
          location: entry.provider?.location || entry.provider?.name || 'Unknown'
        },
        status: entry.status || 'Unknown',
        responsible_person: {
          name: entry.responsible_person?.name || 'Unknown',
          role: entry.responsible_person?.role || 'Unknown'
        },
        content: {
          summary: entry.content?.summary || entry.title || 'Journal Entry',
          details: entry.content?.details || entry.text || '',
          notes: entry.content?.notes || []
        },
        attachments: entry.attachments || [],
        tags: entry.tags || []
      }))
    };
    
    return eirData;
  }
  
  /**
   * Convert JavaScript object to YAML string
   * Simple YAML conversion - for production, consider using a proper YAML library
   * @param {Object} obj - JavaScript object to convert
   * @returns {string} - YAML string
   */
  static convertToYAML(obj) {
    function yamlify(obj, indent = 0) {
      const spaces = '  '.repeat(indent);
      
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj.map(item => {
          if (typeof item === 'object' && item !== null) {
            const itemYaml = yamlify(item, indent + 1);
            // Handle multi-line objects in arrays
            if (itemYaml.includes('\n')) {
              return `${spaces}- ${itemYaml.split('\n').join('\n' + spaces + '  ')}`;
            }
            return `${spaces}- ${itemYaml}`;
          } else {
            const valueStr = typeof item === 'string' ? `"${item}"` : item;
            return `${spaces}- ${valueStr}`;
          }
        }).join('\n');
      }
      
      if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';
        
        return entries.map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              return `${spaces}${key}:\n${yamlify(value, indent + 1)}`;
            } else {
              return `${spaces}${key}:\n${yamlify(value, indent + 1)}`;
            }
          } else {
            const valueStr = typeof value === 'string' ? `"${value}"` : value;
            return `${spaces}${key}: ${valueStr}`;
          }
        }).join('\n');
      }
      
      return typeof obj === 'string' ? `"${obj}"` : obj;
    }
    
    return yamlify(obj);
  }
  
  /**
   * Format date string to ISO format (YYYY-MM-DD)
   * Generic date formatter - connectors can override with provider-specific logic
   * @param {string} dateString - Date string in various formats
   * @returns {string} - ISO format date (YYYY-MM-DD) or 'Unknown'
   */
  static formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    // Try ISO format first
    const isoMatch = dateString.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      return isoMatch[1];
    }
    
    // Try common formats
    // This is a basic implementation - connectors should override with provider-specific parsing
    return 'Unknown';
  }
  
  /**
   * Extract time from text
   * Generic time extractor - connectors can override
   * @param {string} text - Text that may contain time information
   * @returns {string} - Time in HH:MM format or 'Unknown'
   */
  static extractTime(text) {
    if (!text) return 'Unknown';
    
    // Look for time patterns like "10:52", "klockan 10:52", etc.
    const timeMatch = text.match(/(?:klockan\s+)?(\d{1,2}:\d{2})/);
    if (timeMatch) {
      return timeMatch[1];
    }
    
    return 'Unknown';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EIRFormatter;
} else {
  window.EIRFormatter = EIRFormatter;
}

