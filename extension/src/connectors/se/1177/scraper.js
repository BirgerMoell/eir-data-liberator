/**
 * 1177.se Scraper
 * 
 * Handles DOM scraping for 1177.se journal portal.
 * Contains all provider-specific selectors and scraping logic.
 */

class Scraper1177 {
  /**
   * Wait for journal data to load
   * @returns {Promise<void>}
   */
  async waitForJournalData() {
    return new Promise((resolve) => {
      const checkForData = () => {
        const timelineView = document.getElementById('timeline-view');
        if (timelineView && timelineView.children.length > 0) {
          console.log('1177: Journal data loaded');
          resolve();
        } else {
          console.log('1177: Waiting for journal data...');
          setTimeout(checkForData, 1000);
        }
      };
      
      // Start checking immediately
      checkForData();
      
      // Also check after a delay in case data loads later
      setTimeout(() => {
        console.log('1177: Timeout reached, proceeding with available data');
        resolve();
      }, 10000);
    });
  }
  
  /**
   * Load all available journal entries by clicking "Load More" button
   * @returns {Promise<void>}
   */
  async loadAllJournalEntries() {
    console.log('1177: Loading all available journal entries...');
    
    let loadMoreClicks = 0;
    const maxClicks = 50; // Safety limit to prevent infinite loops
    
    while (loadMoreClicks < maxClicks) {
      // Find the load more button (1177-specific selector)
      const loadMoreButtons = document.getElementsByClassName("load-more ic-button ic-button--secondary iu-px-xxl");
      
      if (loadMoreButtons.length === 0) {
        console.log('1177: No more "Load More" button found - all entries loaded');
        break;
      }
      
      const loadMoreButton = loadMoreButtons[0];
      
      // Check if button is visible and not disabled
      if (loadMoreButton.offsetParent === null || loadMoreButton.disabled) {
        console.log('1177: Load More button is hidden or disabled - all entries loaded');
        break;
      }
      
      try {
        console.log(`1177: Clicking "Load More" button (click ${loadMoreClicks + 1})`);
        loadMoreButton.click();
        loadMoreClicks++;
        
        // Wait for new content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if new entries were loaded by counting current entries
        const currentEntries = document.getElementsByClassName("icon-angle-down nu-list-nav-icon nu-list-nav-icon--journal-overview");
        console.log(`1177: Currently have ${currentEntries.length} journal entries loaded`);
        
      } catch (error) {
        console.log('1177: Error clicking Load More button:', error);
        break;
      }
    }
    
    if (loadMoreClicks >= maxClicks) {
      console.log('1177: Reached maximum load more clicks limit');
    }
    
    console.log(`1177: Finished loading entries after ${loadMoreClicks} clicks`);
  }
  
  /**
   * Get all journal entries by expanding them and extracting content
   * @returns {Promise<Array>} - Array of raw entry objects
   */
  async getAllJournalEntries() {
    const entries = [];
    
    // Find all clickable journal entry elements (1177-specific selector)
    const clickableElements = document.getElementsByClassName("icon-angle-down nu-list-nav-icon nu-list-nav-icon--journal-overview");
    
    console.log(`1177: Found ${clickableElements.length} journal entries to expand`);
    
    // Click each entry to expand it
    for (let i = 0; i < clickableElements.length; i++) {
      const element = clickableElements[i];
      
      try {
        console.log(`1177: Expanding entry ${i + 1}/${clickableElements.length}`);
        
        // Click to expand the entry
        element.click();
        
        // Wait for content to load after clicking
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Find the parent container of this entry to extract content
        const parentContainer = element.closest('.ic-block-list__item, .journal-entry, .timeline-item, [data-cy-id]') || element.parentElement;
        
        if (parentContainer) {
          const entryContent = this.extractEntryContent(parentContainer);
          if (entryContent) {
            entries.push(entryContent);
            console.log(`1177: Extracted content from entry ${i + 1}`);
          }
        }
        
      } catch (error) {
        console.log(`1177: Error processing entry ${i + 1}:`, error);
      }
    }
    
    // Also try to get any visible content that might not need clicking
    const timelineView = document.getElementById('timeline-view');
    if (timelineView) {
      const visibleEntries = timelineView.querySelectorAll('.ic-block-list__item, .journal-entry, .timeline-item');
      for (const entry of visibleEntries) {
        const content = this.extractEntryContent(entry);
        if (content && !entries.some(e => e.text === content.text)) {
          entries.push(content);
        }
      }
    }
    
    console.log(`1177: Total extracted ${entries.length} journal entries`);
    return entries;
  }
  
  /**
   * Extract content from a journal entry element
   * @param {HTMLElement} element - The DOM element containing the entry
   * @returns {Object|null} - Raw entry data or null if invalid
   */
  extractEntryContent(element) {
    const content = {
      date: '',
      title: '',
      text: '',
      category: '',
      source: '',
      details: ''
    };
    
    // Get all text content first
    const textContent = element.textContent || element.innerText || '';
    content.text = textContent.trim();
    
    // Try to parse the content more intelligently
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
    
    // Look for date patterns in the text (Swedish format)
    for (const line of lines) {
      // Look for Swedish date patterns like "17 mar 2025", "11 jun 2024"
      const dateMatch = line.match(/(\d{1,2})\s+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})/i);
      if (dateMatch && !content.date) {
        content.date = line;
        break;
      }
      
      // Look for ISO date patterns
      const isoDateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoDateMatch && !content.date) {
        content.date = line;
        break;
      }
    }
    
    // Try to find title - look for common patterns (1177-specific selectors)
    const titleElement = element.querySelector('.title, .journal-title, .entry-title, h3, h4, .ic-block-list__title, .nc-journal-title');
    if (titleElement) {
      content.title = titleElement.textContent.trim();
    } else {
      // Try to extract title from text content
      for (const line of lines) {
        if (line.length > 5 && line.length < 100 && !line.match(/\d{4}-\d{2}-\d{2}/) && !line.match(/\d{1,2}\s+\w{3}\s+\d{4}/)) {
          content.title = line;
          break;
        }
      }
    }
    
    // Try to find category - look for common patterns (1177-specific selectors)
    const categoryElement = element.querySelector('.category, .journal-category, .entry-category, .ic-badge, .nc-category');
    if (categoryElement) {
      content.category = categoryElement.textContent.trim();
    } else {
      // Try to extract category from text content (Swedish keywords)
      const categoryKeywords = ['Vårdkontakter', 'Anteckningar', 'Diagnoser', 'Vaccinationer', 'Läkemedel', 'Provsvar', 'Remisser', 'Tillväxt', 'Uppmärksamhetsinformation', 'Vårdplaner'];
      for (const line of lines) {
        for (const keyword of categoryKeywords) {
          if (line.includes(keyword)) {
            content.category = keyword;
            break;
          }
        }
        if (content.category) break;
      }
    }
    
    // Try to find source/provider (1177-specific)
    const sourceElement = element.querySelector('.source, .provider, .journal-source, .nc-source');
    if (sourceElement) {
      content.source = sourceElement.textContent.trim();
    } else {
      // Try to extract provider from text content (Swedish keywords)
      const providerKeywords = ['vårdcentral', 'sjukhus', 'akut', 'tandvård', 'folktandvården', 'SLSO', 'region', 'stockholm', 'uppsala', 'danderyd'];
      for (const line of lines) {
        for (const keyword of providerKeywords) {
          if (line.toLowerCase().includes(keyword)) {
            content.source = line;
            break;
          }
        }
        if (content.source) break;
      }
    }
    
    // Look for detailed content that appears after expansion (1177-specific selectors)
    const detailsElement = element.querySelector('.journal-details, .entry-details, .nc-details, .ic-block-list__content');
    if (detailsElement) {
      content.details = detailsElement.textContent.trim();
    }
    
    // Clean up the text content to remove navigation elements
    const cleanText = content.text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    content.text = cleanText;
    
    // Only return if we have some meaningful content
    if (content.text && content.text.length > 20) {
      return content;
    }
    
    return null;
  }
  
  /**
   * Get patient name from the page (1177-specific selector)
   * @returns {string} - Patient name or 'Unknown'
   */
  getPatientName() {
    const nameElement = document.querySelector('.ic-avatar-box__name');
    return nameElement ? nameElement.textContent.trim() : 'Unknown';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Scraper1177;
} else {
  window.Scraper1177 = Scraper1177;
}

