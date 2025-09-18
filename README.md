# POI Editor

A modern Angular application for managing Points of Interest (POI) with interactive map visualization using MapLibre GL JS.

## Features

### Core Functionality (MVP)
- ✅ **Interactive Map Visualization**: Display points on an interactive map using MapLibre GL JS
- ✅ **GeoJSON Import/Export**: Load and save POI data in GeoJSON format
- ✅ **CRUD Operations**: Add, edit, and delete points of interest
- ✅ **Local Persistence**: Automatically save changes to localStorage
- ✅ **Data Validation**: Robust validation with detailed error reporting
- ✅ **Point Management**: Click-to-add points, edit properties, and visual feedback

### Data Management
- **Import**: Upload GeoJSON files with validation and error reporting
- **Export**: Download current data as GeoJSON file
- **Persistence**: Auto-save to localStorage with restore on page load
- **Validation**: Comprehensive validation of coordinates, properties, and data structure

### User Experience
- **Responsive Design**: Clean, modern interface with sidebar and map layout
- **Real-time Updates**: Immediate visual feedback for all operations
- **Error Handling**: Clear error messages and validation summaries
- **Point Categories**: Predefined categories for better organization

## Prerequisites

- **Node.js**: Version 20.19.0 or higher
- **npm**: Version 10.8.2 or higher
- **Angular CLI**: Latest version

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd poi-editor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:4200`

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/poi-editor` directory.

## Usage

### Adding Points
1. Click the "Add New Point" button
2. Click anywhere on the map to place a point
3. Fill in the name and category in the editor
4. Click "Add" to save

### Editing Points
1. Click on any point in the map or sidebar
2. Modify the name or category
3. Click "Update" to save changes

### Importing Data
1. Click "Import GeoJSON" button
2. Select a valid GeoJSON file
3. View the import summary showing imported/discarded points

### Exporting Data
1. Click "Export" button
2. A GeoJSON file will be downloaded with all current points

## Architecture Decisions

### Technology Stack
- **Angular 20**: Latest stable version with standalone components
- **TypeScript**: Strict typing for better code quality and maintainability
- **MapLibre GL JS**: Open-source map library (Mapbox GL JS fork)
- **SCSS**: Enhanced CSS with variables and nesting

### Project Structure
```
src/app/
├── components/           # Reusable UI components
│   ├── map/             # Map visualization component
│   ├── point-editor/    # Point editing form
│   └── file-upload/     # File import component
├── models/              # TypeScript interfaces and types
│   └── geojson.interface.ts
├── services/            # Business logic and data management
│   ├── geojson-validation.service.ts
│   └── poi-data.service.ts
└── app.component.ts     # Main application component
```

### Design Patterns

#### 1. Service-Based Architecture
- **PoiDataService**: Centralized data management with RxJS observables
- **GeoJsonValidationService**: Separation of validation logic
- **Single Responsibility**: Each service has a clear, focused purpose

#### 2. Component Composition
- **Standalone Components**: Modern Angular approach for better tree-shaking
- **Input/Output Pattern**: Clear data flow between parent and child components
- **Event-Driven Communication**: Loose coupling between components

#### 3. Data Flow
```
User Action → Component → Service → State Update → UI Update
```

#### 4. State Management
- **RxJS Observables**: Reactive state management
- **BehaviorSubject**: Current state with subscription support
- **Immutable Updates**: Always create new state objects

### Data Validation Strategy

#### Validation Layers
1. **Type Safety**: TypeScript interfaces ensure compile-time safety
2. **Runtime Validation**: Service-level validation for data integrity
3. **User Feedback**: Clear error messages and validation summaries

#### Validation Rules
- **Coordinates**: Must be within valid ranges (-180 to 180 for longitude, -90 to 90 for latitude)
- **Required Fields**: Name and category must be non-empty strings
- **Geometry Type**: Only Point geometries are supported
- **Data Structure**: Must be valid GeoJSON FeatureCollection

### Error Handling

#### Graceful Degradation
- **Invalid Data**: Discard invalid features, continue with valid ones
- **Import Errors**: Show detailed summary of what was imported/discarded
- **User Feedback**: Clear error messages and success confirmations

#### Error Categories
- Invalid coordinates
- Missing required properties
- Invalid geometry types
- Malformed JSON structure

## Trade-offs and Decisions

### 1. MapLibre vs Mapbox GL JS
**Decision**: MapLibre GL JS
**Rationale**: 
- Open-source alternative to Mapbox GL JS
- No API key requirements
- Same API and features
- Better for open-source projects

### 2. Local Storage vs Database
**Decision**: localStorage
**Rationale**:
- Simple persistence for MVP
- No backend infrastructure required
- Sufficient for prototype and small datasets
- Easy to implement and test

### 3. Standalone Components vs NgModules
**Decision**: Standalone Components
**Rationale**:
- Modern Angular approach
- Better tree-shaking
- Simpler dependency management
- Future-proof architecture

### 4. Validation Strategy
**Decision**: Client-side validation with detailed reporting
**Rationale**:
- Immediate user feedback
- No server round-trips
- Detailed error categorization
- Graceful handling of partial data

### 5. State Management
**Decision**: RxJS with BehaviorSubject
**Rationale**:
- Built-in Angular solution
- Reactive programming benefits
- Simple for this use case
- No additional dependencies

## Performance Considerations

### Bundle Size
- **MapLibre GL JS**: ~1.2MB (unavoidable for map functionality)
- **Angular**: Optimized with tree-shaking
- **Total Bundle**: ~1.24MB (within acceptable limits)

### Optimization Strategies
- **Lazy Loading**: Ready for future feature modules
- **OnPush Change Detection**: Could be implemented for better performance
- **Virtual Scrolling**: For large point lists (future enhancement)

## Limitations and Future Improvements

### Current Limitations
1. **No Server Persistence**: Data only stored locally
2. **No User Authentication**: Single-user application
3. **No Real-time Collaboration**: No multi-user support
4. **Limited Styling Options**: Basic point visualization
5. **No Search/Filter**: Basic list view only

### Potential Enhancements
1. **Backend Integration**: REST API for data persistence
2. **Advanced Filtering**: Search by name, category, or location
3. **Point Clustering**: Better visualization for many points
4. **Custom Styling**: User-defined point colors and icons
5. **Import/Export Formats**: Support for KML, Shapefile, etc.
6. **Undo/Redo**: Operation history management
7. **Bulk Operations**: Multi-select and batch operations
8. **Geocoding**: Address search and reverse geocoding

## Development Time

**Total Development Time**: ~4 hours
- Project setup and configuration: 30 minutes
- Data models and validation: 45 minutes
- Map integration: 60 minutes
- CRUD operations: 45 minutes
- UI components and styling: 60 minutes
- Testing and bug fixes: 30 minutes
- Documentation: 30 minutes

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.