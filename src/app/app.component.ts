import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import MapLibreGL from 'maplibre-gl';

import { MapComponent } from './components/map/map.component';
import { PointEditorComponent } from './components/point-editor/point-editor.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PoiDataService } from './services/poi-data.service';
import { PointFeature } from './models/geojson.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent, PointEditorComponent, FileUploadComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>POI Editor</h1>
        <div class="header-actions">
          <app-file-upload (fileSelected)="onFileSelected($event)"></app-file-upload>
          <button (click)="exportData()" class="btn btn-outline">Export</button>
          <button (click)="clearAll()" class="btn btn-outline">Clear All</button>
        </div>
      </header>

      <div class="app-content">
        <div class="sidebar">
          <div class="stats">
            <h3>Statistics</h3>
            <p>Total Points: {{ features.length }}</p>
            <p *ngIf="importSummary" class="import-summary">{{ importSummary }}</p>
          </div>

          <div class="point-list" *ngIf="features.length > 0">
            <h3>Points</h3>
            <div class="point-item" 
                 *ngFor="let feature of features" 
                 (click)="selectPoint(feature)"
                 [class.selected]="selectedFeature?.id === feature.id">
              <div class="point-info">
                <strong>{{ feature.properties.name }}</strong>
                <span class="category">{{ feature.properties.category }}</span>
              </div>
              <div class="coordinates">
                {{ feature.geometry.coordinates[0].toFixed(4) }}, {{ feature.geometry.coordinates[1].toFixed(4) }}
              </div>
            </div>
          </div>

          <app-point-editor 
            *ngIf="selectedFeature || isAddingNew"
            [feature]="selectedFeature"
            [isEditing]="!!selectedFeature"
            (save)="onPointSave($event)"
            (cancel)="onPointCancel()"
            (delete)="onPointDelete($event)">
          </app-point-editor>

          <button 
            *ngIf="!selectedFeature && !isAddingNew" 
            (click)="startAddingNew()" 
            class="btn btn-primary add-point-btn">
            Add New Point
          </button>
        </div>

        <div class="map-container">
          <app-map 
            [features]="features"
            [allowClickToAdd]="isAddingNew"
            (pointClick)="onPointClick($event)"
            (mapClick)="onMapClick($event)"
            (mapReady)="onMapReady($event)">
          </app-map>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
    }

    .app-header {
      background: white;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .app-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar {
      width: 350px;
      background: white;
      border-right: 1px solid #e2e8f0;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .map-container {
      flex: 1;
      position: relative;
    }

    .stats {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stats h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .stats p {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .import-summary {
      color: #059669 !important;
      font-weight: 500;
    }

    .point-list {
      margin-bottom: 1.5rem;
    }

    .point-list h3 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .point-item {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .point-item:hover {
      background-color: #f8fafc;
      border-color: #3b82f6;
    }

    .point-item.selected {
      background-color: #eff6ff;
      border-color: #3b82f6;
    }

    .point-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .point-info strong {
      color: #1f2937;
      font-size: 0.875rem;
    }

    .category {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .coordinates {
      color: #6b7280;
      font-size: 0.75rem;
      font-family: monospace;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-outline {
      background-color: transparent;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background-color: #f9fafb;
      color: #374151;
    }

    .add-point-btn {
      width: 100%;
      justify-content: center;
    }

    .error-message {
      background-color: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .success-message {
      background-color: #f0fdf4;
      color: #059669;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  features: PointFeature[] = [];
  selectedFeature: PointFeature | null = null;
  isAddingNew = false;
  importSummary: string | null = null;
  private featuresSubscription: Subscription | null = null;
  private map: MapLibreGL.Map | null = null;

  constructor(private poiDataService: PoiDataService) {}

  ngOnInit(): void {
    this.featuresSubscription = this.poiDataService.features$.subscribe(features => {
      this.features = features;
    });
  }

  ngOnDestroy(): void {
    if (this.featuresSubscription) {
      this.featuresSubscription.unsubscribe();
    }
  }

  onFileSelected(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const result = this.poiDataService.importFeatures(data);
        
        if (result.success) {
          this.importSummary = result.summary;
          setTimeout(() => {
            this.importSummary = null;
          }, 5000);
        } else {
          alert(result.summary);
        }
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  exportData(): void {
    this.poiDataService.downloadGeoJson();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all points? This action cannot be undone.')) {
      this.poiDataService.clearAll();
      this.selectedFeature = null;
      this.isAddingNew = false;
    }
  }

  selectPoint(feature: PointFeature): void {
    this.selectedFeature = feature;
    this.isAddingNew = false;
    
    if (this.map) {
      this.map.setCenter(feature.geometry.coordinates);
      this.map.setZoom(15);
    }
  }

  startAddingNew(): void {
    this.isAddingNew = true;
    this.selectedFeature = null;
  }

  onPointClick(feature: PointFeature): void {
    this.selectPoint(feature);
  }

  onMapClick(coords: { lng: number; lat: number }): void {
    if (this.isAddingNew) {
      // Create a temporary feature for editing
      const newFeature: PointFeature = {
        type: 'Feature',
        id: 'temp',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        },
        properties: {
          name: '',
          category: ''
        }
      };
      this.selectedFeature = newFeature;
      this.isAddingNew = false;
    }
  }

  onMapReady(map: MapLibreGL.Map): void {
    this.map = map;
  }

  onPointSave(feature: PointFeature): void {
    if (feature.id === 'temp') {
      // Add new point
      const newFeature = this.poiDataService.addPoint(
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
        feature.properties.name,
        feature.properties.category
      );
      this.selectedFeature = newFeature;
    } else {
      // Update existing point
      this.poiDataService.updatePoint(feature.id!, feature);
      this.selectedFeature = feature;
    }
  }

  onPointCancel(): void {
    this.selectedFeature = null;
    this.isAddingNew = false;
  }

  onPointDelete(id: string): void {
    if (confirm('Are you sure you want to delete this point?')) {
      this.poiDataService.deletePoint(id);
      this.selectedFeature = null;
    }
  }
}
