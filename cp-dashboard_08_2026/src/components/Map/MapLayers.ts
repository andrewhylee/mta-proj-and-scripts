import { RefObject } from 'react';
import axios from 'axios';
import { CacheItem, isCachedItemExpired } from '@/data/Helpers/CacheHelper';
import Feature from 'ol/Feature';
import EsriJSON from 'ol/format/EsriJSON';
import Group from 'ol/layer/Group';
import Vector from 'ol/layer/Vector';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke } from 'ol/style';
import Style from 'ol/style/Style';
import {
  getBridgeTunnelStyle,
  getCountyLabelStyle,
  getLandStyle,
  getProjectLineStyle,
  getRailStyle,
  getStateLinesStyle,
  getStationStyle,
} from './MapStyles';

// Create sources

// Create layers
export const createSubwayLayer = (
  mapInstanceRef: RefObject<Map | null>,
  subwaySource: VectorSource<Feature>
) =>
  new Vector({
    source: subwaySource,
    style: (feature, resolution) => getRailStyle(feature, resolution, false, mapInstanceRef),
    properties: { title: 'Subway Layer', isRegionalRail: false, clickable: false },
    zIndex: 2,
  });

export const createLirrLayer = (
  mapInstanceRef: RefObject<Map | null>,
  lirrSource: VectorSource<Feature>
) =>
  new Vector({
    source: lirrSource,
    style: (feature, resolution) => getRailStyle(feature, resolution, true, mapInstanceRef),
    properties: { title: 'LIRR Layer', isRegionalRail: true, clickable: false },
    zIndex: 2,
  });

export const createMnrLayer = (
  mapInstanceRef: RefObject<Map | null>,
  mnrSource: VectorSource<Feature>
) =>
  new Vector({
    source: mnrSource,
    style: (feature, resolution) => getRailStyle(feature, resolution, true, mapInstanceRef),
    properties: { title: 'MNR Layer', isRegionalRail: true, clickable: false },
    zIndex: 2,
  });

export const createBridgeTunnelLayer = (
  mapInstanceRef: RefObject<Map | null>,
  bridgeTunnelSource: VectorSource<Feature>
) =>
  new Vector({
    source: bridgeTunnelSource,
    style: (feature, resolution) => getBridgeTunnelStyle(feature, resolution, mapInstanceRef),
    properties: { title: 'Bridge/Tunnel Layer', clickable: false },
    zIndex: 2,
  });

export const createStationLayer = (
  mapInstanceRef: RefObject<Map | null>,
  stationSource: VectorSource<Feature>,
  locality?: string
) =>
  new Vector({
    source: stationSource,
    style: (feature, resolution) =>
      getStationStyle(feature, resolution, mapInstanceRef, false, locality),
    properties: { title: 'Station Layer', clickable: false },
    zIndex: 5,
  });

export const createProjectLineLayer = (
  mapInstanceRef: RefObject<Map | null>,
  projectLineSource: VectorSource<Feature>
) =>
  new Vector({
    source: projectLineSource,
    renderBuffer: 3000,
    style: (feature, resolution) => getProjectLineStyle(feature, resolution, mapInstanceRef),
    properties: { title: 'Project Line Layer', clickable: true },
    zIndex: 3,
  });

export const createProjectPointLayer = (
  mapInstanceRef: RefObject<Map | null>,
  projectPointSource: VectorSource<Feature>,
  locality?: string
) =>
  new Vector({
    source: projectPointSource,
    style: (feature, resolution) =>
      getStationStyle(feature, resolution, mapInstanceRef, true, locality),
    properties: { title: 'Project Point Layer', clickable: true },
    zIndex: 5,
  });

export const createStateLineLayer = (
  mapInstanceRef: RefObject<Map | null>,
  stateLineSource: VectorSource<Feature>
) =>
  new Vector({
    source: stateLineSource,
    style: (feature, resolution) => getStateLinesStyle(feature, resolution, mapInstanceRef),
    properties: { title: 'State Line Layer', clickable: false },
    zIndex: 0,
  });

export const createCountyLinesLayer = (
  mapInstanceRef: RefObject<Map | null>,
  countyLinesSource: VectorSource<Feature>
) =>
  new Vector({
    source: countyLinesSource,
    style: (feature, resolution) => getStateLinesStyle(feature, resolution, mapInstanceRef),
    properties: { title: 'County Line Layer', clickable: false },
    zIndex: 0,
  });

export const createCountyLabelsLayer = (
  mapInstanceRef: RefObject<Map | null>,
  countyLabelsSource: VectorSource<Feature>
) =>
  new Vector({
    source: countyLabelsSource,
    style: (feature, resolution) => getCountyLabelStyle(feature, resolution, mapInstanceRef),
    properties: { title: 'County Labels Layer', clickable: false },
    zIndex: 1,
  });

const addBasemapLayer = async (
  restOfUrl: string,
  token: string | null,
  layerName: string,
  color: string,
  basemapGroup: Group,
  cacheItems: CacheItem[]
) => {
  const source = new VectorSource();
  const defaultStyle = new Style({
    stroke: new Stroke({
      color: color || 'gray',
      width: 1,
    }),
    fill: new Fill({
      color,
    }),
  });

  const style = layerName === 'Land Areas' ? getLandStyle : defaultStyle;

  const layer = new Vector({
    source,
    style,
    opacity: 1.0,
    visible: true,
    properties: {
      title: layerName,
      type: 'basemap',
    },
    zIndex: -1,
  });

  basemapGroup.getLayers().push(layer);
  basemapGroup.changed();

  loadVectorSource(source, restOfUrl, token, cacheItems);

  return layer;
};

export const loadVectorSource = async (
  source: VectorSource<Feature>,
  restOfUrl: string,
  token: string | null = null,
  cacheItems: CacheItem[] 
) => {
  try {
    const storageKey = `layerData_${restOfUrl}`;

    let data = null;
    const cached = localStorage.getItem(storageKey);
    if (cached && cacheItems && !isCachedItemExpired(storageKey, cacheItems)) {
      data = JSON.parse(cached).data;
    } else {

      data = await fetchLayer(restOfUrl, token);

      if (data.error) {
        if (data.error.code === 498) {
          await getToken(true);

          data = await fetchLayer(restOfUrl, token);
        }
      }

      if (!data.error) {
        localStorage.setItem(storageKey, JSON.stringify({ cacheDate: new Date(), data }));
      }
    }

    if (data.features) {
      const esriFormat = new EsriJSON();
      const features = esriFormat.readFeatures(data);
      source.addFeatures(features);
    }
  } catch {
    // Handle errors silently
  }
};

const fetchLayer = async (restOfUrl: string, token: string | null) => {  
  const response = await axios.post(`api/map/get_layer`, { token, restOfUrl });
  return await response.data;
};

export const getToken: any = async () => {
  const tokenResponse = await fetch('/api/map/generate_token');
  const tokenData = await tokenResponse.json();
  return tokenData.token;
};

export const loadBasemapLayers = async (basemapGroup: Group, arcGisToken: string | null, cacheItems: CacheItem[]) => {
  // Add basemap layers (simplified version)
  // if (cacheItems === null) {
  //   return;
  // }

  try {
    // Layer 14: Land Areas
    await addBasemapLayer(
      'Land/FeatureServer/0',
      arcGisToken,
      'Land Areas',
      '#ffffff',
      basemapGroup,      
      cacheItems
    );

    // Layer 13: Parks
    await addBasemapLayer(
      'Parks/FeatureServer/0',
      arcGisToken,
      'Parks and Open Space',
      '#f4f5d5',
      basemapGroup,
      cacheItems
    );
  } catch {
    // Handle errors in loading basemap layers
  }
};
