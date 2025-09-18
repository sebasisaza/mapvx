import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import MapLibreGL from 'maplibre-gl';
import { PointFeature } from '../../models/geojson.interface';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapContainer class="map"></div>
      <div class="map-attribution">
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .map {
      width: 100%;
      height: 100%;
    }
    
    .map-attribution {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.8);
      padding: 2px 4px;
      font-size: 10px;
      z-index: 1000;
    }
    
    .map-attribution a {
      color: #0066cc;
      text-decoration: none;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  @Input() features: PointFeature[] = [];
  @Input() allowClickToAdd: boolean = true;
  
  @Output() pointClick = new EventEmitter<PointFeature>();
  @Output() mapClick = new EventEmitter<{ lng: number; lat: number }>();
  @Output() mapReady = new EventEmitter<MapLibreGL.Map>();

  private map: MapLibreGL.Map | null = null;
  private isMapReady = false;

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    this.map = new MapLibreGL.Map({
      container: this.mapContainer.nativeElement,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [-70.6483, -33.4569], // Santiago, Chile
      zoom: 12
    });

    this.map.on('load', () => {
      this.isMapReady = true;
      this.mapReady.emit(this.map!);
      this.updatePoints();
    });

    this.map.on('click', (e) => {
      if (this.allowClickToAdd) {
        this.mapClick.emit({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat
        });
      }
    });

    // Add points source and layer
    this.map.on('load', () => {
      this.addPointsLayer();
    });
  }

  private addPointsLayer(): void {
    if (!this.map) return;

    // Add source for points
    this.map.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add circle layer for points
    this.map.addLayer({
      id: 'points-circle',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': 8,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add symbol layer for labels
    this.map.addLayer({
      id: 'points-labels',
      type: 'symbol',
      source: 'points',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-offset': [0, 2],
        'text-anchor': 'top',
        'text-size': 12
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });

    // Add click handler for points
    this.map.on('click', 'points-circle', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as unknown as PointFeature;
        this.pointClick.emit(feature);
      }
    });

    // Change cursor on hover
    this.map.on('mouseenter', 'points-circle', () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
      }
    });

    this.map.on('mouseleave', 'points-circle', () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = '';
      }
    });
  }

  updatePoints(): void {
    if (!this.map || !this.isMapReady) return;

    const source = this.map.getSource('points') as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: this.features
      });
    }
  }

  ngOnChanges(): void {
    if (this.isMapReady) {
      this.updatePoints();
    }
  }

  fitToFeatures(): void {
    if (!this.map || this.features.length === 0) return;

    const bounds = new MapLibreGL.LngLatBounds();
    
    this.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      bounds.extend([lng, lat]);
    });

    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 16
    });
  }

  setCenter(lng: number, lat: number, zoom?: number): void {
    if (!this.map) return;
    
    this.map.setCenter([lng, lat]);
    if (zoom !== undefined) {
      this.map.setZoom(zoom);
    }
  }
}
