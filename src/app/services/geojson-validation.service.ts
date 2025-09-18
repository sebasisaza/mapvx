import { Injectable } from '@angular/core';
import { PointFeature, FeatureCollection, ValidationResult, ImportSummary } from '../models/geojson.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoJsonValidationService {

  /**
   * Validates if coordinates are within valid ranges
   */
  private isValidCoordinate(lon: number, lat: number): boolean {
    return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
  }

  /**
   * Validates if a string is non-empty
   */
  private isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Validates a single Point feature
   */
  validatePointFeature(feature: any): ValidationResult {
    const errors: string[] = [];

    // Check if it's a Feature
    if (feature.type !== 'Feature') {
      errors.push('Feature type must be "Feature"');
    }

    // Check geometry
    if (!feature.geometry) {
      errors.push('Missing geometry');
    } else {
      if (feature.geometry.type !== 'Point') {
        errors.push('Geometry type must be "Point"');
      }
      
      if (!feature.geometry.coordinates || !Array.isArray(feature.geometry.coordinates)) {
        errors.push('Missing or invalid coordinates');
      } else {
        const [lon, lat] = feature.geometry.coordinates;
        if (typeof lon !== 'number' || typeof lat !== 'number') {
          errors.push('Coordinates must be numbers');
        } else if (!this.isValidCoordinate(lon, lat)) {
          errors.push('Coordinates out of valid range');
        }
      }
    }

    // Check properties
    if (!feature.properties) {
      errors.push('Missing properties');
    } else {
      if (!this.isValidString(feature.properties.name)) {
        errors.push('Missing or invalid name property');
      }
      if (!this.isValidString(feature.properties.category)) {
        errors.push('Missing or invalid category property');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates and filters a FeatureCollection
   */
  validateAndFilterFeatureCollection(data: any): { validFeatures: PointFeature[], summary: ImportSummary } {
    const summary: ImportSummary = {
      imported: 0,
      discarded: 0,
      errors: {
        invalidCoordinates: 0,
        missingName: 0,
        missingCategory: 0,
        invalidGeometry: 0,
        invalidType: 0
      }
    };

    const validFeatures: PointFeature[] = [];

    // Check if it's a FeatureCollection
    if (data.type !== 'FeatureCollection') {
      throw new Error('Invalid GeoJSON: Must be a FeatureCollection');
    }

    if (!Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON: Features must be an array');
    }

    // Process each feature
    data.features.forEach((feature: any) => {
      const validation = this.validatePointFeature(feature);
      
      if (validation.isValid) {
        validFeatures.push(feature as PointFeature);
        summary.imported++;
      } else {
        summary.discarded++;
        
        // Categorize errors for summary
        validation.errors.forEach(error => {
          if (error.includes('coordinates') || error.includes('range')) {
            summary.errors.invalidCoordinates++;
          } else if (error.includes('name')) {
            summary.errors.missingName++;
          } else if (error.includes('category')) {
            summary.errors.missingCategory++;
          } else if (error.includes('geometry') || error.includes('Point')) {
            summary.errors.invalidGeometry++;
          } else if (error.includes('Feature')) {
            summary.errors.invalidType++;
          }
        });
      }
    });

    return { validFeatures, summary };
  }

  /**
   * Generates a human-readable summary of import results
   */
  generateImportSummaryText(summary: ImportSummary): string {
    const { imported, discarded, errors } = summary;
    
    if (discarded === 0) {
      return `Successfully imported ${imported} points.`;
    }

    const errorDetails: string[] = [];
    
    if (errors.invalidCoordinates > 0) {
      errorDetails.push(`${errors.invalidCoordinates} with invalid coordinates`);
    }
    if (errors.missingName > 0) {
      errorDetails.push(`${errors.missingName} without name`);
    }
    if (errors.missingCategory > 0) {
      errorDetails.push(`${errors.missingCategory} without category`);
    }
    if (errors.invalidGeometry > 0) {
      errorDetails.push(`${errors.invalidGeometry} with invalid geometry`);
    }
    if (errors.invalidType > 0) {
      errorDetails.push(`${errors.invalidType} with invalid type`);
    }

    const errorText = errorDetails.length > 0 ? ` (${errorDetails.join(', ')})` : '';
    
    return `Imported ${imported} / Discarded ${discarded}${errorText}`;
  }
}
