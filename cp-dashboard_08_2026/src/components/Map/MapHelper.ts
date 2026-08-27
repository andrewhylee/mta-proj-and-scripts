import { ActiveFilter } from '../Filters/ActiveFilters';
import Feature from 'ol/Feature';
import { Positioning } from 'ol/Overlay';
import { Size } from 'ol/size';
import VectorSource from 'ol/source/Vector';

const mapBoroughAbbreviationToName = (acronym: string) => {
  switch (acronym) {
    case 'MN':
      return 'Manhattan';
    case 'BK':
      return 'Brooklyn';
    case 'QN':
      return 'Queens';
    case 'BX':
      return 'The Bronx';
    case 'SI':
      return 'Staten Island';
    default:
      return acronym;
  }
};

const isBusService = (service: string) => {
  const busServices = ['NYCT-BK', 'NYCT-MN', 'NYCT-QN', 'NYCT-SI', 'NYCT-BX'];
  return busServices.includes(service);
};

const cloneFeature = (existingFeature: Feature) => {
  const existingGeometry = existingFeature.getGeometry();

  const newGeometry = existingGeometry!.clone();

  const newFeature = new Feature({
    geometry: newGeometry,
  });

  existingFeature.getKeys().forEach((key) => {
    if (
      key !== 'id' &&
      key !== 'ol_id' &&
      key !== 'objectid' &&
      key !== existingFeature.getGeometryName()
    ) {
      newFeature.set(key, existingFeature.get(key));
    }
  });

  return newFeature;
};

const findProjectsByPointId = (pointId: number, projectPointSource: VectorSource<Feature>) => {
  return projectPointSource.getFeatures().filter((feature: Feature) => {
    return Number(feature.get('point_id')) === pointId;
  });
};

const findStationByPointId = (pointId: number, stationSource: VectorSource<Feature>) => {
  return stationSource.getFeatures().find((feature) => {
    return Number(feature.get('point_id')) === pointId;
  });
};

const getBestPositioning = (pixel: number[], mapSize: Size) => {
  let positioning: Positioning = 'bottom-left';
  // If closer to right, use right
  if (pixel[0] > mapSize[0] * 0.66) {
    positioning = 'bottom-right';
  } else if (pixel[0] < mapSize[0] * 0.33) {
    positioning = 'bottom-left';
  } else {
    positioning = 'bottom-right';
  }
  // If closer to top, use top
  if (pixel[1] < mapSize[1] * 0.33) {
    positioning = positioning.replace('bottom', 'top') as Positioning;
  }
  return positioning;
};

const filterFeaturesByActiveGeographyFilters = (
  features: Feature[],
  activeFilters: ActiveFilter[]
) => {
  if (activeFilters.length > 0) {
    const geographyFilters = activeFilters.filter((f) => f.filterName === 'geography');
    if (geographyFilters.length === 0) {
      return features;
    }

    return features.filter((feature) => {
      const districts: string | undefined = feature.get('districts');
      return districts && geographyFilters.some((f) => f.value && districts.includes(f.value));
    });
  }
};

export {
  mapBoroughAbbreviationToName,
  isBusService,
  cloneFeature,
  findProjectsByPointId,
  findStationByPointId,
  getBestPositioning,
  filterFeaturesByActiveGeographyFilters,
};
