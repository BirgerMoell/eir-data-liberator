/**
 * UI Manager
 * 
 * Handles the floating button UI and user interactions.
 * Provider-agnostic - works with any connector.
 */

class UIManager {
  constructor(connector, downloadCallback, downloadFilesOnlyCallback, viewOnEirSpaceCallback) {
    this.connector = connector;
    this.downloadCallback = downloadCallback;
    this.downloadFilesOnlyCallback = downloadFilesOnlyCallback;
    this.viewOnEirSpaceCallback = viewOnEirSpaceCallback;
    this.button = null;
  }
  
  /**
   * Initialize the UI - create floating button if connector matches
   */
  init() {
    if (!this.connector) {
      console.log('No connector available, UI not initialized');
      return;
    }
    
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createFloatingButton());
    } else {
      this.createFloatingButton();
    }
    
    // Also check periodically in case the page loads dynamically
    setTimeout(() => this.createFloatingButton(), 2000);
  }
  
  /**
   * Create the floating download button
   */
  createFloatingButton() {
    // Check if button already exists
    if (document.getElementById('journal-downloader-btn')) {
      return;
    }
    
    const providerName = this.connector.constructor.providerName || 'Provider';
    console.log(`Creating floating button for ${providerName}`);
    
    const button = document.createElement('div');
    button.id = 'journal-downloader-btn';
    button.className = 'floating-button';
    button.innerHTML = `
      <div class="button-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span class="button-text">Download Journals</span>
      </div>
      <div class="button-actions" style="display: none;">
        <button class="action-btn download-btn" title="Download Files">📥</button>
        <button class="action-btn view-btn" title="View on eir.space">👁️</button>
      </div>
    `;
    
    // Add click event for main button
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.downloadCallback) {
        this.downloadCallback();
      }
    });
    
    // Add click events for action buttons
    const downloadBtn = button.querySelector('.download-btn');
    const viewBtn = button.querySelector('.view-btn');
    
    if (downloadBtn && this.downloadFilesOnlyCallback) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadFilesOnlyCallback();
      });
    }
    
    if (viewBtn && this.viewOnEirSpaceCallback) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewOnEirSpaceCallback();
      });
    }
    
    // Make button draggable
    this.makeDraggable(button);
    
    // Position button on the right side
    button.style.position = 'fixed';
    button.style.right = '20px';
    button.style.top = '50%';
    button.style.transform = 'translateY(-50%)';
    button.style.zIndex = '999999';
    
    document.body.appendChild(button);
    this.button = button;
    
    console.log(`${providerName} Extension: Button created and added to page!`);
  }
  
  /**
   * Make element draggable
   */
  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
      if (e.target.closest('.button-content')) {
        return; // Don't drag if clicking on the button content
      }
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === element) {
        isDragging = true;
        element.style.cursor = 'grabbing';
      }
    }
    
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }
    
    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      element.style.cursor = 'grab';
    }
  }
  
  /**
   * Update button state during download
   */
  setDownloading(isDownloading) {
    if (!this.button) return;
    
    if (isDownloading) {
      this.button.style.opacity = '0.7';
      const textElement = this.button.querySelector('.button-text');
      if (textElement) {
        textElement.textContent = 'Downloading...';
      }
    } else {
      this.button.style.opacity = '1';
      const textElement = this.button.querySelector('.button-text');
      if (textElement) {
        textElement.textContent = 'Download Journals';
      }
    }
  }
  
  /**
   * Show success state
   */
  showSuccess(message = 'Ready!') {
    if (!this.button) return;
    
    this.button.style.opacity = '1';
    const textElement = this.button.querySelector('.button-text');
    if (textElement) {
      textElement.textContent = message;
    }
    
    // Show action buttons
    this.showActionButtons();
  }
  
  /**
   * Show action buttons after successful download
   */
  showActionButtons() {
    if (!this.button) return;
    
    const actionsDiv = this.button.querySelector('.button-actions');
    if (actionsDiv) {
      actionsDiv.style.display = 'flex';
      actionsDiv.style.flexDirection = 'column';
      actionsDiv.style.gap = '5px';
      actionsDiv.style.marginTop = '10px';
    }
  }
  
  /**
   * Show error state
   */
  showError(message = 'Error') {
    if (!this.button) return;
    
    this.button.style.opacity = '1';
    const textElement = this.button.querySelector('.button-text');
    if (textElement) {
      textElement.textContent = message;
      setTimeout(() => {
        textElement.textContent = 'Download Journals';
      }, 3000);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
} else {
  window.UIManager = UIManager;
}

