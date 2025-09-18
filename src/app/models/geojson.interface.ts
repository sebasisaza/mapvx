export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PointProperties {
  name: string;
  category: string;
  [key: string]: any; // Allow additional properties
}

export interface PointFeature {
  type: 'Feature';
  id?: string;
  geometry: PointGeometry;
  properties: PointProperties;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: PointFeature[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ImportSummary {
  imported: number;
  discarded: number;
  errors: {
    invalidCoordinates: number;
    missingName: number;
    missingCategory: number;
    invalidGeometry: number;
    invalidType: number;
  };
}
