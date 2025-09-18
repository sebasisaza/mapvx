import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PointFeature, FeatureCollection } from '../models/geojson.interface';
import { GeoJsonValidationService } from './geojson-validation.service';

@Injectable({
  providedIn: 'root'
})
export class PoiDataService {
  private readonly STORAGE_KEY = 'poi_editor_state';
  private featuresSubject = new BehaviorSubject<PointFeature[]>([]);
  public features$ = this.featuresSubject.asObservable();

  constructor(private validationService: GeoJsonValidationService) {
    this.loadFromStorage();
  }

  /**
   * Get current features
   */
  getFeatures(): PointFeature[] {
    return this.featuresSubject.value;
  }

  /**
   * Get features as FeatureCollection
   */
  getFeatureCollection(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this.getFeatures()
    };
  }

  /**
   * Add a new point feature
   */
  addPoint(longitude: number, latitude: number, name: string, category: string): PointFeature {
    const newFeature: PointFeature = {
      type: 'Feature',
      id: this.generateId(),
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      properties: {
        name,
        category
      }
    };

    const currentFeatures = this.getFeatures();
    const updatedFeatures = [...currentFeatures, newFeature];
    this.featuresSubject.next(updatedFeatures);
    this.saveToStorage();
    
    return newFeature;
  }

  /**
   * Update an existing point feature
   */
  updatePoint(id: string, updates: Partial<PointFeature>): boolean {
    const currentFeatures = this.getFeatures();
    const featureIndex = currentFeatures.findIndex(f => f.id === id);
    
    if (featureIndex === -1) {
      return false;
    }

    const updatedFeature = { ...currentFeatures[featureIndex], ...updates };
    const updatedFeatures = [...currentFeatures];
    updatedFeatures[featureIndex] = updatedFeature;
    
    this.featuresSubject.next(updatedFeatures);
    this.saveToStorage();
    
    return true;
  }

  /**
   * Delete a point feature
   */
  deletePoint(id: string): boolean {
    const currentFeatures = this.getFeatures();
    const updatedFeatures = currentFeatures.filter(f => f.id !== id);
    
    if (updatedFeatures.length === currentFeatures.length) {
      return false; // Feature not found
    }

    this.featuresSubject.next(updatedFeatures);
    this.saveToStorage();
    
    return true;
  }

  /**
   * Import features from GeoJSON data
   */
  importFeatures(data: any): { success: boolean; summary: string; features?: PointFeature[] } {
    try {
      const { validFeatures, summary } = this.validationService.validateAndFilterFeatureCollection(data);
      
      // Generate IDs for imported features if they don't have them
      const featuresWithIds = validFeatures.map(feature => ({
        ...feature,
        id: feature.id || this.generateId()
      }));

      this.featuresSubject.next(featuresWithIds);
      this.saveToStorage();

      return {
        success: true,
        summary: this.validationService.generateImportSummaryText(summary),
        features: featuresWithIds
      };
    } catch (error) {
      return {
        success: false,
        summary: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Clear all features
   */
  clearAll(): void {
    this.featuresSubject.next([]);
    this.saveToStorage();
  }

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    try {
      const featureCollection = this.getFeatureCollection();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(featureCollection));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const { validFeatures } = this.validationService.validateAndFilterFeatureCollection(data);
        this.featuresSubject.next(validFeatures);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Generate a unique ID for features
   */
  private generateId(): string {
    return `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export current data as downloadable JSON
   */
  exportAsGeoJson(): string {
    return JSON.stringify(this.getFeatureCollection(), null, 2);
  }

  /**
   * Download current data as GeoJSON file
   */
  downloadGeoJson(): void {
    const data = this.exportAsGeoJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `poi-data-${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
