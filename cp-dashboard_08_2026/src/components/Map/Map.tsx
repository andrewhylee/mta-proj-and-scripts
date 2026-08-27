import React, { useCallback, useEffect, useRef, useState } from 'react';
import { atom, useAtom } from 'jotai';
import * as ol from 'ol';
import { Map, MapBrowserEvent, Overlay } from 'ol';
import Papa from 'papaparse';
import { LoadingOverlay, Tooltip } from '@mantine/core';
import projectLineData from '@/data/geojson/project_lines.json';
import { cacheAtom, CacheItem, isCachedItemExpired, loadCacheItems } from '@/data/Helpers/CacheHelper';
import { filteredProjectsAtom } from '@/data/Helpers/ProjectData';
import { getServiceById, subwayServiceOrder } from '@/data/Helpers/TransitServiceData';
import { activeFiltersAtom } from '../Filters/ActiveFilters';
import { lirrItemsAtom, mnrItemsAtom } from '../TransitServices/RegionalRail/RegionalRail';
import * as olExtent from 'ol/extent';
import { createEmpty } from 'ol/extent';
import Feature, { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { Polygon } from 'ol/geom';
import * as interaction from 'ol/interaction';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import * as olLayer from 'ol/layer';
import { Group, Vector } from 'ol/layer';
import type { Positioning } from 'ol/Overlay';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Style } from 'ol/style';
import { cloneFeature, filterFeaturesByActiveGeographyFilters, findProjectsByPointId, findStationByPointId, getBestPositioning, isBusService, mapBoroughAbbreviationToName } from './MapHelper';
import { createBridgeTunnelLayer, createCountyLabelsLayer, createCountyLinesLayer, createLirrLayer, createMnrLayer, createProjectLineLayer, createProjectPointLayer, createStateLineLayer, createStationLayer, createSubwayLayer, getToken, loadBasemapLayers, loadVectorSource } from './MapLayers';
import { getStationStyle } from './MapStyles';
import ProjectPanel, { ProjectPanelProps } from './ProjectPanel/ProjectPanel';
import styles from './Map.module.css';


type LayerType = olLayer.Vector<VectorSource<Feature>> | olLayer.Group;
type SourcesRefType = {
  subway: VectorSource<Feature> | null;
  station: VectorSource<Feature> | null;
  lirr: VectorSource<Feature> | null;
  mnr: VectorSource<Feature> | null;
  bridgeTunnel: VectorSource<Feature> | null;
  projectLine: VectorSource<Feature> | null;
  projectPoint: VectorSource<Feature> | null;
  stateLine: VectorSource<Feature> | null;
  countyLines: VectorSource<Feature> | null;
  countyLabels: VectorSource<Feature> | null;
  boroughs: VectorSource<Feature> | null;
};
type LayersRefType = {
  subway: LayerType | null;
  station: LayerType | null;
  lirr: LayerType | null;
  mnr: LayerType | null;
  bridgeTunnel: LayerType | null;
  projectLine: LayerType | null;
  projectPoint: LayerType | null;
  basemapGroup: olLayer.Group | null;
  stateLine: LayerType | null;
  countyLines: LayerType | null;
  countyLabels: LayerType | null;
};

interface FacilityProject {
  id: number;
  project_id: number | null;
  type_y: string;
  point_id: number | null;
  services: string | null;
  DIST_CODES: string | null;
}

interface MapComponentProps {
  locality?: string;
  isVisible?: boolean;
  projects?: number[];
  service?: string;
  handleProjectSelected?: (projectId: number) => void;
  shouldZoomToProjects?: boolean;
}

const arcGisTokenAtom = atom('');

const MapComponent: React.FC<MapComponentProps> = ({
  locality,
  isVisible,
  projects,
  service,
  handleProjectSelected,
  shouldZoomToProjects = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14.2);
  const [isNewPanelOpen, setIsNewPanelOpen] = useState<boolean>(false);
  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [currentProjects] = useState<number[]>(projects || []);
  const [projectPanelProps, setProjectPanelProps] = useState<ProjectPanelProps | null>(null);
  const [isStationDataLoaded, setIsStationDataLoaded] = useState<boolean>(false);
  const [activeFilters] = useAtom(activeFiltersAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const [cacheItems, setCacheItems] = useAtom(cacheAtom);
  const [boroughsSource] = useState<VectorSource<Feature>>(new VectorSource());
  const [arcGisToken, setArcGisToken] = useAtom(arcGisTokenAtom);

  // Layer refs
  const layersRef = useRef<LayersRefType>({
    subway: null,
    station: null,
    lirr: null,
    mnr: null,
    projectLine: null,
    bridgeTunnel: null,
    projectPoint: null,
    basemapGroup: null,
    stateLine: null,
    countyLines: null,
    countyLabels: null,
  });

  // Sources refs
  const sourcesRef = useRef<SourcesRefType>({
    subway: null,
    station: null,
    lirr: null,
    mnr: null,
    bridgeTunnel: null,
    projectLine: null,
    projectPoint: null,
    stateLine: null,
    countyLines: null,
    countyLabels: null,
    boroughs: null,
  });

  const lastZoomRef = useRef<number>(14.2);

  // Create water blue background
  const waterBlueBackground = new Vector({
    source: new VectorSource({
      features: [
        new Feature({
          geometry: new Polygon([
            [
              [-20037508.34, -20037508.34],
              [-20037508.34, 20037508.34],
              [20037508.34, 20037508.34],
              [20037508.34, -20037508.34],
              [-20037508.34, -20037508.34],
            ],
          ]),
        }),
      ],
    }),
    style: new Style({
      fill: new Fill({ color: '#c8d7ee' }),
    }),
    zIndex: -100,
  });

  // Create basemap group
  const basemapGroup = new Group({
    layers: [],
    zIndex: -10,
  });

  const subwaySource = new VectorSource();
  const stationSource = new VectorSource();
  const lirrSource = new VectorSource();
  const mnrSource = new VectorSource();
  const bridgeTunnelSource = new VectorSource();
  const projectLineSource = new VectorSource();
  const projectPointSource = new VectorSource();
  const stateLineSource = new VectorSource();
  const countyLinesSource = new VectorSource();
  const countyLabelsSource = new VectorSource();

  const subwayLayer = createSubwayLayer(mapInstanceRef, subwaySource);
  const lirrLayer = createLirrLayer(mapInstanceRef, lirrSource);
  const mnrLayer = createMnrLayer(mapInstanceRef, mnrSource);
  const stationLayer = createStationLayer(mapInstanceRef, stationSource, locality);
  const bridgeTunnelLayer = createBridgeTunnelLayer(mapInstanceRef, bridgeTunnelSource);
  const projectLineLayer = createProjectLineLayer(mapInstanceRef, projectLineSource);
  const projectPointLayer = createProjectPointLayer(mapInstanceRef, projectPointSource, locality);
  const stateLineLayer = createStateLineLayer(mapInstanceRef, stateLineSource);
  const countyLinesLayer = createCountyLinesLayer(mapInstanceRef, countyLinesSource);
  const countyLabelsLayer = createCountyLabelsLayer(mapInstanceRef, countyLabelsSource);

  // Store layers in ref
  layersRef.current = {
    subway: subwayLayer,
    station: stationLayer,
    lirr: lirrLayer,
    mnr: mnrLayer,
    bridgeTunnel: bridgeTunnelLayer,
    projectLine: projectLineLayer,
    projectPoint: projectPointLayer,
    stateLine: stateLineLayer,
    countyLines: countyLinesLayer,
    countyLabels: countyLabelsLayer,
    basemapGroup,
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // Create map
    const map = new ol.Map({
      target: mapRef.current,
      layers: [
        waterBlueBackground,
        basemapGroup,
        stateLineLayer,
        countyLinesLayer,
        subwayLayer,
        lirrLayer,
        mnrLayer,
        stationLayer,
        bridgeTunnelLayer,
        countyLabelsLayer,
        projectLineLayer,
        projectPointLayer,
      ],
      view: new ol.View({
        zoom: 14.2,
        projection: 'EPSG:3857',
        minZoom: 12.5,
        maxZoom: 17.5,
        //Constrain map to the extent of the land area
        extent: [-8652666.695782434, 4873688.682688403, -8596613.121237949, 4896304.2119773375],
      }),
      interactions: interaction.defaults({ mouseWheelZoom: false }),
      controls: [],
    });

    // Store sources in ref
    sourcesRef.current = {
      subway: subwaySource,
      station: stationSource,
      projectLine: projectLineSource,
      projectPoint: projectPointSource,
      lirr: lirrSource,
      mnr: mnrSource,
      bridgeTunnel: bridgeTunnelSource,
      stateLine: stateLineSource,
      countyLines: countyLinesSource,
      countyLabels: countyLabelsSource,
      boroughs: boroughsSource,
    };

    if (!cacheItems || cacheItems.length === 0) {
      loadCacheItems().then((cacheData) => {
        setCacheItems(cacheData);
        loadVectorSources(cacheData);
      });
    } else {
      loadVectorSources(cacheItems);
    }

    mapInstanceRef.current = map;
    stationSource.once('change', () => {
      if (stationSource.getState() === 'ready') {
        setIsStationDataLoaded(true);
        setLoading(false);
      }
    });

    const mouseWheelInt = new MouseWheelZoom();
    map.addInteraction(mouseWheelInt);
    map.getViewport().addEventListener(
      'wheel',
      (evt: WheelEvent) => {
        if (!evt.shiftKey) {
          const zoomToolTip = document.getElementById('zoomToolTip');
          if (zoomToolTip) {
            zoomToolTip.style.display = 'block';
          }
        }
        mouseWheelInt.setActive(evt.shiftKey);
      },
      { passive: true }
    );

    // Add zoom change handler
    map.getView().on('change:resolution', () => {
      const newZoom = map.getView().getZoom()!;
      setZoomLevel(newZoom);

      const lastZoom = lastZoomRef.current;

      // Handle layer changes based on zoom
      if ((lastZoom < 16.5 && newZoom >= 16.5) || (lastZoom >= 16.5 && newZoom < 16.5)) {
        stationLayer.changed();
      }
      if ((lastZoom < 15 && newZoom >= 15) || (lastZoom >= 15 && newZoom < 15)) {
        projectLineLayer.changed();
      }

      lastZoomRef.current = newZoom;
    });

    map.on('click', handleMapClick);

    let tooltipOverlay = new ol.Overlay({});

    const tooltipDiv = document.createElement('div');
    tooltipDiv.id = 'mapTooltip';
    tooltipDiv.className = styles.tooltip;
    document.body.appendChild(tooltipDiv);

    tooltipOverlay = new ol.Overlay({
      element: tooltipDiv,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
    });

    if(!locality){
      map.getView().setMinZoom(11.5);
    }

    map.addOverlay(tooltipOverlay);

    map.on('pointermove', (evt) => handlePointerMove(evt, tooltipOverlay, tooltipDiv));

    return () => {
      map.setTarget(undefined); // Cleanup map instance on unmount
    };
  }, []);

  useEffect(() => {
    const affectedLayers = [layersRef.current.station, layersRef.current.projectPoint];

    affectedLayers.forEach((layer) => {
      if (layer) {
        const vector = layer as Vector<VectorSource<Feature>>;
        vector.setStyle((feature, resolution) =>
          getStationStyle(feature, resolution, mapInstanceRef, layer.get('clickable'), locality)
        );
        vector.changed();
      }
    });
  }, [locality]);

  useEffect(() => {
    if (mapRef && mapRef.current) {
      mapRef.current.style.display = isVisible ? 'flex' : 'none'; //hide and make sure it doesn't take up space when not visible
      if (isVisible && mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(mapRef.current); // Show the map
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    let extent = createEmpty();
    if (locality && locality === 'NYC') {
      extent = sourcesRef.current.subway?.getExtent() || createEmpty();
    } else if (locality && locality === 'Region') {
      extent = sourcesRef.current.lirr?.getExtent() || createEmpty();
      extent = olExtent.extend(extent, sourcesRef.current.mnr?.getExtent() || createEmpty());
    }
    if (extent && !olExtent.isEmpty(extent)) {
      setTimeout(() => {
        mapInstanceRef
          .current!.getView()
          .fit(extent, { size: mapInstanceRef.current!.getSize(), padding: [20, 10, 10, 20] });
      }, 100);
    }
  }, [locality, loading, lirrItemsAtom, mnrItemsAtom]);

  useEffect(() => {
    if (currentProjects.length > 0) {
      loadProjectData(cacheItems);
    }
  }, [currentProjects, isStationDataLoaded, cacheItems]);

  const loadVectorSources = async (cacheData: CacheItem[]) => {
    setLoading(true);
    let tokenData = arcGisToken;
    if(!arcGisToken || arcGisToken === ''){
      tokenData = await getToken();      
      setArcGisToken(tokenData);
    }
    
    await Promise.all([
      loadSubwayData(subwaySource, tokenData, cacheData || []),
      loadVectorSource(lirrSource, 'LIRR_lines/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(stationSource, 'Facilities/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(boroughsSource, 'Boroughs/FeatureServer/0', tokenData, cacheData),
      loadBasemapLayers(basemapGroup, tokenData, cacheData || []),
      loadVectorSource(mnrSource, 'MNR_lines/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(bridgeTunnelSource, 'B_and_T/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(stateLineSource, 'State_Lines/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(countyLinesSource, 'Counties/FeatureServer/0', tokenData, cacheData),
      loadVectorSource(countyLabelsSource, 'County_Labels/FeatureServer/0', tokenData, cacheData),
    ]);

    loadProjectData(cacheData);

    setLoading(false);
  };

  const loadProjectData = useCallback((cacheData: CacheItem[]) => {
    if (filteredProjects.length === 0) {
      return;
    }

    sourcesRef.current.projectLine?.clear();

    let features = new GeoJSON().readFeatures(projectLineData);

    if (service) {
      features = features.filter((feature) => {
        const project = filteredProjects.find(
          (p) => p.project_id === Number(feature.get('project_id'))
        );
        if (!project) {
          return false;
        }

        const serviceValue = feature.get('services')?.trim().toLowerCase();
        return serviceValue && serviceValue === service.trim().toLowerCase();
      });
    } else {
      features = features.filter((feature) => {
        return currentProjects?.includes(feature.get('project_id') as number);
      });
    }

    features = filterFeaturesByActiveGeographyFilters(features, activeFilters) || features;

    sourcesRef.current.projectLine?.addFeatures(features);
    sourcesRef.current.projectLine?.changed();

    loadFacilityProjectData(cacheData).then((data) => {
      if (data) {
        loadFacilityProjectLayer(data);
      }
    });
  }, []);

  const loadFacilityProjectLayer = (data: FacilityProject[]) => {
    sourcesRef.current.projectPoint?.clear();
  
    let pointFeatures: Feature[] = [];
    let facilityProjects = data.filter((facilityProject) => {
      return currentProjects.includes(facilityProject.project_id as number);
    });

    if (service) {
      facilityProjects = facilityProjects.filter((project) => {
        const serviceValue: string[] | undefined = project?.services?.split(',');
        return (
          serviceValue &&
          serviceValue.map((s) => s.toLowerCase().trim()).includes(service.toLowerCase())
        );
      });
    }

    facilityProjects.forEach((facilityProject) => {
      const feature = findStationByPointId(
        facilityProject.point_id as number,
        sourcesRef.current.station!
      );

      if (feature) {
        const newFeature = cloneFeature(feature);
        newFeature.set('hasProject', true);
        newFeature.set('project_id', facilityProject.project_id);
        newFeature.set('districts', facilityProject.DIST_CODES);
        newFeature.set('services', facilityProject.services);
        pointFeatures.push(newFeature);
      }
    });

    pointFeatures =
      filterFeaturesByActiveGeographyFilters(pointFeatures, activeFilters) || pointFeatures;

    sourcesRef.current.projectPoint?.addFeatures(pointFeatures);
    sourcesRef.current.projectPoint?.changed();

    if (shouldZoomToProjects) {
      if (service && isBusService(service)) {
        zoomToBorough(service.split('-')[1]);
      } else {
        zoomToProjects();
      }
    }
  };

  const zoomToProjects = () => {
    let extent = createEmpty();
    sourcesRef.current.projectLine?.getFeatures().forEach((feature) => {
      if (feature instanceof Feature) {
        const geometry = feature.getGeometry();
        if (geometry) {
          extent = olExtent.extend(extent, geometry.getExtent());
        }
      }
    });

    sourcesRef.current.projectPoint?.getFeatures().forEach((feature) => {
      if (feature instanceof Feature) {
        const geometry = feature.getGeometry();
        if (geometry) {
          extent = olExtent.extend(extent, geometry.getExtent());
        }
      }
    });

    if (extent && !olExtent.isEmpty(extent)) {
      mapInstanceRef.current!.getView().fit(extent, {
        size: mapInstanceRef.current!.getSize(),
        padding: [20, 10, 10, 20],
      });
    }
  };

  const zoomToBorough = (boroughAbbr: string) => {
    const boroughName = mapBoroughAbbreviationToName(boroughAbbr);

    boroughsSource.getFeatures().forEach((feature) => {
      const featureBoroughName = feature.get('name');

      if (featureBoroughName === boroughName) {
        // Zoom to the feature's geometry
        
        const geometry = feature.getGeometry();
        if (geometry) {
          mapInstanceRef.current!.getView().fit(geometry.getExtent(), {
            size: mapInstanceRef.current!.getSize(),
            padding: [20, 10, 10, 20],
          });
        }
      }
    });
  };

  const loadFacilityProjectData = async (cacheItems: CacheItem[]) => {
    if (!cacheItems || cacheItems.length === 0) {
      return [];
    }
    const keyName = 'facility_projects_csv';

    let parsedData;

    if (!isCachedItemExpired(keyName, cacheItems)) {
      const lsData = JSON.parse(localStorage.getItem(keyName) as string);
      parsedData = Papa.parse<FacilityProject>(lsData.data, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      return parsedData.data;
    }

    const response = await fetch('/data/250930_facility_projects_final.csv');
    const data = await response.text();

    localStorage.setItem(keyName, JSON.stringify({ cacheDate: new Date(), data }));
    parsedData = Papa.parse<FacilityProject>(data, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    return parsedData.data;
  };

  // Data loading functions
  const loadSubwayData = useCallback(
    async (source: VectorSource<Feature>, tokenData: string | null, cacheItems: CacheItem[]) => {
      await loadVectorSource(source, 'Subway_lines/FeatureServer/0', tokenData, cacheItems);
      // source.once('change', () => {
      //   if (source.getState() === 'ready') {

      //     setSubwayDataLoaded(true);
      //   }
      // });
      const extent = source.getExtent();

      if (!olExtent.isEmpty(extent)) {
        mapInstanceRef.current!.getView().fit(extent, { padding: [50, 50, 50, 50] });
      }
    },
    [cacheItems]
  );

  // Click handler
  const handleMapClick = (event: MapBrowserEvent<any>) => {
    if (event.dragging) {
      return;
    }

    const featuresAtPixel: { feature: Feature; layer: LayerType }[] = [];
    const hitTolerance = 2;

    // Check for point features first
    let foundPoints = false;

    mapInstanceRef.current!.forEachFeatureAtPixel(
      event.pixel,
      (feature: FeatureLike, layer: any) => {
        if (
          layer &&
          (layer as any).get('clickable') &&
          layer.get('title') === 'Project Point Layer'
        ) {
          featuresAtPixel.push({ feature: feature as Feature, layer });
          foundPoints = true;
        }
      },
      { hitTolerance }
    );

    // console.log(featuresAtPixel);

    // Only look for other features if no points were found
    if (featuresAtPixel.length === 0 && !foundPoints) {
      mapInstanceRef.current!.forEachFeatureAtPixel(
        event.pixel,
        (feature: FeatureLike, layer: any) => {
          if (
            layer &&
            (layer as any).get('clickable') &&
            layer.get('title') === 'Project Line Layer'
          ) {
            featuresAtPixel.push({ feature: feature as Feature, layer });
          }
        },
        { hitTolerance }
      );
    }

    if (featuresAtPixel.length === 0) {
      setIsNewPanelOpen(false);
      return;
    }

    // Clear previous selections
    clearSelections();

    // Set selected feature
    featuresAtPixel.forEach(({ feature }) => {
      if (feature instanceof Feature) {
        feature.set('selected', true);
        feature.changed();
      }
    });

    if (handleProjectSelected) {
      if (featuresAtPixel.length === 1) {
        const projectId = featuresAtPixel[0].feature.get('project_id');

        if (projectId) {
          handleProjectSelected(projectId);
          return;
        }
        const facilityProjects = findProjectsByPointId(
          featuresAtPixel[0].feature.get('point_id'),
          sourcesRef.current.projectPoint!
        );

        if (facilityProjects && facilityProjects.length === 1) {
          handleProjectSelected(facilityProjects[0].get('project_id'));
          return;
        }
      }

      const services: string[] = [];
      const projects: Feature[] = [];
      let title = 'Related Projects';

      featuresAtPixel.forEach(({ feature }) => {
        if (feature.get('point_id')) {
          const facilityProjects = findProjectsByPointId(
            feature.get('point_id'),
            sourcesRef.current.projectPoint!
          );
          title = feature.get('name');
          if (facilityProjects) {
            facilityProjects.forEach((fp) => {
              if (!projects.includes(fp)) {
                projects.push(fp);
              }
            });
          }
          services.push(...(feature.get('services') || []));
        } else if (feature.get('project_id')) {
          if (projects.some((p: Feature) => p.get('project_id') === feature.get('project_id'))) {
            if (!services.includes(feature.get('services'))) {
              services.push(feature.get('services') || []);
            }
            // If the project is already in the list, do not add it again
            return;
          }
          if (feature.get('name')) {
            title = feature.get('name') || 'Related Projects';
          }
          if (!services.includes(feature.get('services'))) {
            services.push(feature.get('services') || []);
          }
          if (!projects.includes(feature)) {
            projects.push(feature);
          }
        }
      });

      if (services && services.length > 0) {
        //sort by subwayServiceOrder
        services.sort((a, b) => {
          const aOrder = subwayServiceOrder[a] || 0;
          const bOrder = subwayServiceOrder[b] || 0;
          return aOrder - bOrder;
        });
      }

      if (projects.length > 1) {
        const panelProjects = filteredProjects.filter((proj) =>
          projects.some((fp) => fp.get('project_id') === proj.project_id)
        );

        if (services.some((s) => s.includes('NYCT'))) {
          title = '';
        }

        setProjectPanelProps({
          title,
          projects: panelProjects,
          services: services.join(', '),
        });
        setIsNewPanelOpen(true);
      } else if (projects.length === 1) {
        const projectId = projects[0].get('project_id');
        if (projectId) {
          handleProjectSelected(projectId);
        }
        setIsNewPanelOpen(false);
      } else {
        setIsNewPanelOpen(false);
      }
    }
  };

  const handlePointerMove = (
    evt: MapBrowserEvent<any>,
    tooltipOverlay: Overlay,
    tooltipDiv: HTMLDivElement | null
  ) => {
    if (evt.dragging) {
      tooltipOverlay.setPosition(undefined); // Hide tooltip during drag
      return;
    }
    if (!mapInstanceRef.current) {
      return;
    }
    const map = mapInstanceRef.current;

    const mapSize = map.getSize();
    if (!mapSize) {
      return;
    }

    const features: Feature[] = [];

    mapInstanceRef.current!.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      if (layer.get('clickable')) {
        features.push(feature as Feature);
      }
    });

    if (features && features !== null && features.length > 0) {
      const feature = features[0];

      mapInstanceRef.current!.getTargetElement().style.cursor = 'pointer';
      if (tooltipDiv !== null) {
        let name = feature.get('name') || feature.get('title') || '';

        if (!feature.get('point_id')) {
          const services: string[] = [];
          features.forEach((f) => {
            const fServices = f.get('services');
            if (fServices) {
              if (!services.includes(fServices)) {
                services.push(fServices);
              }
            }
          });

          if (services && services !== null && services.some((s: string) => s.includes('NYCT'))) {
            services.sort();
            name = services.join(', ').replaceAll('NYCT-', '');

            (async () => {
              if (!name || name.length === 0) {
                // contains is true if any subway feature contains/intersects the coordinate
                const service = await getServiceById(feature.get('services'));
                name = service?.name ?? '';
              }
            })();
          }

          if (name.length > 0) {
            setToolTip(name, evt, tooltipDiv, tooltipOverlay);
          }
          return;
        }

        if (!name) {
          tooltipOverlay.setPosition(undefined);
          tooltipDiv.style.display = 'none';
          return;
        }

        setToolTip(name, evt, tooltipDiv, tooltipOverlay);
      }
    } else {
      mapInstanceRef.current!.getTargetElement().style.cursor = '';
      if (tooltipDiv !== null) {
        tooltipOverlay.setPosition(undefined);
        tooltipDiv.style.display = 'none';
      }
    }
  };

  const setToolTip = (
    name: string,
    evt: MapBrowserEvent<any>,
    tooltipDiv: HTMLDivElement | null,
    tooltipOverlay: Overlay
  ) => {
    if (tooltipDiv !== null) {
      tooltipDiv.innerHTML = name;
      tooltipOverlay.setPosition(evt.coordinate);
      tooltipDiv.style.display = 'block';
      const mapSize = mapInstanceRef.current!.getSize();
      if (mapSize) {
        tooltipOverlay.setPositioning(getBestPositioning(evt.pixel, mapSize) as Positioning);
      }
    }
  };

  const clearSelections = useCallback(() => {
    if (sourcesRef.current.projectLine) {
      sourcesRef.current.projectLine.getFeatures().forEach((f) => {
        if (f instanceof Feature) {
          f.set('selected', false);
          f.changed();
        }
      });
    }
    if (sourcesRef.current.projectPoint) {
      sourcesRef.current.projectPoint.getFeatures().forEach((f) => {
        if (f instanceof Feature) {
          f.set('selected', false);
          f.changed();
        }
      });
    }
  }, []);

  return (
    <>
      {/* Map container */}
      <Tooltip label="Hold the shift key to zoom" position="top" id="zoomToolTip" display="block">
        <div id="map" ref={mapRef} className={styles.map}>
          <LoadingOverlay
            visible={loading}
            zIndex={10}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'var(--blue-color)', type: 'bars' }}
          />
          {/* <div id="mapTooltip" className="ol-tooltip ol-tooltip-static"></div> */}
        </div>
      </Tooltip>

      {/* Zoom display */}
      <div className={styles.zoomDisplay}>Zoom: {zoomLevel.toFixed(1)}</div>

      {/* Project Panel */}
      {isNewPanelOpen && (
        <ProjectPanel
          key={projectPanelProps?.title + (projectPanelProps?.projects?.join(', ') ?? '')}
          {...projectPanelProps}
          isOpen={isNewPanelOpen}
          close={() => setIsNewPanelOpen(false)}
          handleProjectSelected={handleProjectSelected}
        />
      )}
    </>
  );
};

export default MapComponent;