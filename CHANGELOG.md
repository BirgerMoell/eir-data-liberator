# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Connector-based architecture for easy provider additions
- Support for 1177.se (Sweden)
- EIR format specification and documentation
- Comprehensive contributing guide

## [2.0.0] - 2025-01-XX

### Added
- Scalable connector architecture
- BaseConnector interface for provider implementations
- Core modules: UI Manager, File Downloader, EIR Formatter, Connector Registry
- 1177.se connector with scraper and normalizer
- Documentation for adding new connectors

### Changed
- Refactored from hardcoded 1177 implementation to connector-based system
- Improved code organization and modularity

### Fixed
- Better error handling and user feedback

## [1.0.0] - 2025-01-XX

### Added
- Initial release
- Basic 1177.se support
- EIR format generation
- File download functionality
- eir.space integration

[Unreleased]: https://github.com/BirgerMoell/eir-data-liberator/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/BirgerMoell/eir-data-liberator/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/BirgerMoell/eir-data-liberator/releases/tag/v1.0.0

