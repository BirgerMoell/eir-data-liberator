/**
 * Main Content Script Entry Point
 * 
 * Initializes the extension, finds the appropriate connector,
 * and coordinates UI, scraping, and file downloads.
 */

// Initialize data transfer manager
let dataTransferManager = null;
let uiManager = null;
let activeConnector = null;

/**
 * Initialize the extension
 */
async function init() {
  console.log('Eir Data Liberator: Initializing...');
  
  // Wait for all modules to load
  if (typeof ConnectorRegistry === 'undefined' || typeof UIManager === 'undefined') {
    console.log('Waiting for modules to load...');
    setTimeout(init, 100);
    return;
  }
  
  // Find matching connector for current URL
  activeConnector = ConnectorRegistry.getActiveConnector();
  
  if (!activeConnector) {
    console.log('No connector found for current URL:', window.location.href);
    return;
  }
  
  const providerName = activeConnector.constructor.providerName;
  console.log(`Active connector: ${providerName}`);
  
  // Initialize UI manager
  uiManager = new UIManager(
    activeConnector,
    downloadAllJournalContent,
    downloadFilesOnly,
    viewOnEirSpace
  );
  
  uiManager.init();
}

/**
 * Download all journal content (with eir.space transfer option)
 */
async function downloadAllJournalContent() {
  if (!activeConnector) {
    alert('No connector available for this page.');
    return;
  }
  
  console.log('Starting journal content download...');
  
  if (uiManager) {
    uiManager.setDownloading(true);
  }
  
  try {
    // Scrape data using active connector
    const rawData = await activeConnector.scrape();
    
    // Normalize data to EIR format
    const normalizedEntries = activeConnector.normalize(rawData);
    
    // Get patient metadata
    const patientMetadata = activeConnector.getPatientMetadata();
    
    // Generate EIR content
    const eirData = EIRFormatter.generateEIRContent(normalizedEntries, {
      source: activeConnector.constructor.providerName,
      patient: patientMetadata
    });
    
    // Initialize data transfer manager if not already done
    if (!dataTransferManager) {
      dataTransferManager = new DataTransferManager();
    }
    
    // Store EIR data for transfer (using the normalized entries and metadata)
    await dataTransferManager.storeEirData(normalizedEntries, {
      source: activeConnector.constructor.providerName,
      patient: patientMetadata
    });
    
    // Convert to YAML
    const eirYAML = EIRFormatter.convertToYAML(eirData);
    
    // Format text content
    const formattedContent = FileDownloader.formatJournalContent(normalizedEntries, eirData.metadata);
    
    // Download both files
    FileDownloader.downloadTextFile(formattedContent, 'journal-content.txt');
    FileDownloader.downloadTextFile(eirYAML, 'journal-content.eir');
    
    console.log('Journal download completed successfully!');
    
    if (uiManager) {
      uiManager.showSuccess('Ready!');
    }
    
  } catch (error) {
    console.error('Error downloading journal content:', error);
    alert('Error downloading journal content. Please try again.');
    
    if (uiManager) {
      uiManager.showError('Error');
    }
  }
}

/**
 * Download files only (without transferring to eir.space)
 */
async function downloadFilesOnly() {
  if (!activeConnector) {
    alert('No connector available for this page.');
    return;
  }
  
  console.log('Downloading files only...');
  
  if (uiManager) {
    uiManager.setDownloading(true);
  }
  
  try {
    // Scrape data using active connector
    const rawData = await activeConnector.scrape();
    
    // Normalize data to EIR format
    const normalizedEntries = activeConnector.normalize(rawData);
    
    // Get patient metadata
    const patientMetadata = activeConnector.getPatientMetadata();
    
    // Generate EIR content
    const eirData = EIRFormatter.generateEIRContent(normalizedEntries, {
      source: activeConnector.constructor.providerName,
      patient: patientMetadata
    });
    
    // Convert to YAML
    const eirYAML = EIRFormatter.convertToYAML(eirData);
    
    // Format text content
    const formattedContent = FileDownloader.formatJournalContent(normalizedEntries, eirData.metadata);
    
    // Download both files
    FileDownloader.downloadTextFile(formattedContent, 'journal-content.txt');
    FileDownloader.downloadTextFile(eirYAML, 'journal-content.eir');
    
    console.log('Files downloaded successfully!');
    
    if (uiManager) {
      uiManager.showSuccess('Files Downloaded!');
      setTimeout(() => {
        if (uiManager) {
          uiManager.setDownloading(false);
        }
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error downloading files:', error);
    alert('Error downloading files. Please try again.');
    
    if (uiManager) {
      uiManager.showError('Error');
    }
  }
}

/**
 * Transfer data to eir.space
 */
async function viewOnEirSpace() {
  console.log('Transferring data to eir.space...');
  
  if (uiManager) {
    uiManager.setDownloading(true);
    const button = uiManager.button;
    if (button) {
      const textElement = button.querySelector('.button-text');
      if (textElement) {
        textElement.textContent = 'Opening eir.space...';
      }
    }
  }
  
  try {
    // Check if data transfer manager is available
    if (!dataTransferManager) {
      throw new Error('No data available. Please download journals first.');
    }
    
    // Transfer data to eir.space
    const eirUrl = await dataTransferManager.transferToEirSpace();
    
    console.log('Data transferred to eir.space successfully!');
    console.log('eir.space URL:', eirUrl);
    
    if (uiManager) {
      uiManager.showSuccess('Opened eir.space!');
      setTimeout(() => {
        if (uiManager) {
          uiManager.setDownloading(false);
        }
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error transferring to eir.space:', error);
    alert(`Error opening eir.space: ${error.message}`);
    
    if (uiManager) {
      uiManager.showError('Error');
    }
  }
}

// Start the extension when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
