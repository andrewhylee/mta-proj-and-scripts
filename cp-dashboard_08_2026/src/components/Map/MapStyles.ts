import { Map } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style, Text } from 'ol/style';

export interface FacilityProject {
  point_id: number;
  project_id: number;
  type_x: number;
  name: string;
}

// Utility functions
export const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);

  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const darkenHexColor: (hex: string, percent: number) => string = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max((num >> 16) - amt, 0);
  const g = Math.max(((num >> 8) & 0x00ff) - amt, 0);
  const b = Math.max((num & 0x0000ff) - amt, 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const getCountyLabelStyle: (
  feature: FeatureLike,
  _resolution: number,
  _mapInstanceRef: React.RefObject<Map | null>
) => Style = (feature, _resolution, _mapInstanceRef) => {
  const labelColor = feature.get('label_color') || 'var(--gray-color)';

  return new Style({
    text: new Text({
      text: feature.get('name'),
      font: '900 20px Neue Haas Grotesk Display Pro, sans-serif',
      fill: new Fill({ color: hexToRgba(labelColor, 0.3) }),
      textAlign: 'left',
    }),
  });
};

// Style functions
export const getRailStyle: (
  feature: FeatureLike,
  resolution: number,
  isRegionalRail: boolean,
  mapInstanceRef: React.RefObject<Map | null>
) => Style | Style[] = (feature, resolution, isRegionalRail, mapInstanceRef) => {
  const zoom = mapInstanceRef.current!.getView().getZoomForResolution(resolution)!;
  const lineColor = feature.get('fill_color') || '#000000';

  if (zoom < 13.4 && !isRegionalRail) {
    return new Style({
      stroke: new Stroke({
        color: hexToRgba(lineColor, 0.2),
        width: 0.25,
      }),
    });
  }

  const interpolate = (z: number, z0: number, w0: number, z1: number, w1: number): number =>
    w0 + ((z - z0) / (z1 - z0)) * (w1 - w0);

  let outerWidth, innerWidth;

  if (zoom < 14.5) {
    outerWidth = 3.5;
    innerWidth = 3;
  } else if (zoom < 15.3) {
    outerWidth = interpolate(zoom, 14.5, 3.5, 15.3, 6);
    innerWidth = interpolate(zoom, 14.5, 3, 15.3, 5);
  } else if (zoom < 16.3) {
    outerWidth = interpolate(zoom, 15.3, 6, 16.3, 9);
    innerWidth = interpolate(zoom, 15.3, 5, 16.3, 7);
  } else if (zoom < 17.3) {
    outerWidth = interpolate(zoom, 16.3, 9, 17.3, 17);
    innerWidth = interpolate(zoom, 16.3, 7, 17.3, 15);
  } else {
    outerWidth = 17;
    innerWidth = 15;
  }

  return [
    new Style({
      stroke: new Stroke({
        color: hexToRgba(lineColor, 0.9),
        width: outerWidth,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1)',
        width: innerWidth,
      }),
    }),
  ];
};

export const getStationStyle: (
  feature: FeatureLike,
  resolution: number,
  mapInstanceRef: React.RefObject<Map | null>,
  hasProject: boolean,
  locality: string | undefined
) => Style | Style[] = (feature, resolution, mapInstanceRef, hasProject, locality) => {
  const zoom = mapInstanceRef.current!.getView().getZoomForResolution(resolution)!;
  const fontsize_multiplier =
    zoom < 15.5 ? 1.2 : zoom < 16 ? 1.5 : zoom < 17 ? 1.75 : zoom < 18 ? 2 : 2;
  const stationName = feature.get('name');
  const minimizeBackground = true;
  let showLabel = zoom >= 15.3;
  let offsetX = minimizeBackground
    ? zoom < 18
      ? 10
      : zoom < 19
        ? 15
        : 20
    : zoom < 18
      ? 20
      : zoom < 19
        ? 25
        : 30;

  const typeCode = feature.get('type_code') as number;
  const isStation = [61, 62].includes(typeCode) || !typeCode;

  const styles: Style[] = [];
  
  if (locality === 'Region' && feature.get('view') === 'Region' && zoom >= 13.4) {
    showLabel = true;
  }

  if (!isStation && zoom >= 16) {
    showLabel = true;
  } else if (!isStation && zoom < 16) {
    showLabel = false;
  }
  
  if (locality && zoom < 13.4 && (feature.get('agency') === 'NYCT' || feature.get('view') === 'NYC')) {
      return styles;
  }

  let color = 'rgba(139, 139, 139, 0.2)';

  const stroke_width = zoom < 14.5 ? 2 : zoom < 15.3 ? 2.5 : zoom < 16 ? 3.5 : zoom < 17 ? 5.5 : 6;
  let outerStrokeWidth = stroke_width + 3;
  let innerStrokeWidth = stroke_width + 1;

  if (hasProject === true) {
    color = 'rgb(0, 0, 1)';
    outerStrokeWidth = stroke_width + 5;
    innerStrokeWidth = stroke_width + 0.5;
  }

  const lineCapValue = isStation ? 'round' : 'square';

  styles.push(
    new Style({
      stroke: new Stroke({
        color,
        width: outerStrokeWidth,
        lineCap: lineCapValue,
      }),
    })
  );

  styles.push(
    new Style({
      stroke: new Stroke({
        color: '#FFFFFF',
        width: innerStrokeWidth,
        lineCap: lineCapValue,
      }),
    })
  );

  if (showLabel && stationName) {
    const offset_multiplier =
       zoom > 16 ? zoom : 8;
    const offsetY =
      feature.get('y_offset') === null ? 0 : feature.get('y_offset') * offset_multiplier;
    if (feature.get('x_offset') !== null) {
      offsetX = feature.get('x_offset') * offset_multiplier;
    }
    const textAlign = feature.get('align') || 'left';
    const textBaseline = feature.get('baseline') || 'middle';

    const wrap = Number.parseInt(feature.get('wrap'), 10);
    const labelText = stringDivider(stationName, wrap, '\n');

    styles.push(
      new Style({
        text: new Text({
          font: `bold ${8 * fontsize_multiplier}px Calibri,sans-serif`,
          text: labelText,
          offsetX,
          offsetY,
          textAlign,
          textBaseline,
          fill: new Fill({ color }),
          backgroundFill: new Fill({
            color: 'rgba(255, 255, 255, 0)',
          }),
          padding: [0, 0, 0, 0],
          backgroundStroke: new Stroke({
            color: 'rgba(0, 0, 0, 0)',
            width: 1,
          }),
        }),
        zIndex: 10,
      })
    );
  }

  return styles;
};

const stringDivider = (str: string, width: number, spaceReplacer: string): string => {
  if (str.length > width) {
    let p = width;
    while (p > 0 && str[p] !== ' ' && str[p] !== '-') {
      p--;
    }
    if (p > 0) {
      let left;
      if (str.substring(p, p + 1) === '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      const right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
};

export const getProjectLineStyle: (
  feature: FeatureLike,
  resolution: number,
  mapInstanceRef: React.RefObject<Map | null>
) => Style | Style[] = (feature, resolution, mapInstanceRef) => {
  const zoom = mapInstanceRef.current!.getView().getZoomForResolution(resolution)!;
  const baseColor = feature.get('color') || '#000000';
  const isSelected = feature.get('selected') === true;
  const isLongest = feature.get('isLongest') === true;

  const darkenPercent = feature.get('darkenPercent') || 0;
  const baseOpacity = feature.get('baseOpacity') || 0.7;
  const zIndex = isSelected ? 50000 : feature.get('zIndex') || 1000;

  // const baseWidth = zoom < 14.5 ? 5 : zoom < 15.3 ? 7 : zoom < 16 ? 10 : zoom < 17 ? 13 : 19;
  const finalDarkenPercent = isSelected ? Math.min(80, darkenPercent + 20) : darkenPercent;
  const finalOpacity = isSelected ? Math.min(1.0, baseOpacity + 0.15) : baseOpacity;
  const finalColor =
    isLongest && !isSelected ? baseColor : darkenHexColor(baseColor, finalDarkenPercent);

  const styles: Style[] = [];

  const interpolate = (z: number, z0: number, w0: number, z1: number, w1: number): number =>
    w0 + ((z - z0) / (z1 - z0)) * (w1 - w0);

  let baseWidth;

  if (zoom < 14.5) {
    baseWidth = 3.5;
  } else if (zoom < 15.3) {
    baseWidth = interpolate(zoom, 14.5, 3.5, 15.3, 6);
  } else if (zoom < 16.3) {
    baseWidth = interpolate(zoom, 15.3, 6, 16.3, 9);
  } else if (zoom < 17.3) {
    baseWidth = interpolate(zoom, 16.3, 9, 17.3, 17);
  } else {
    baseWidth = 17;
  }

  styles.push(
    new Style({
      zIndex: isSelected ? 1000 : zIndex,
      stroke: new Stroke({
        color: hexToRgba(finalColor, finalOpacity),
        width: baseWidth,
        lineCap: 'round',
      }),
    })
  );

  return styles;
};

export const getBridgeTunnelStyle: (
  feature: FeatureLike,
  resolution: number,
  mapInstanceRef: React.RefObject<Map | null>
) => Style | Style[] = (feature, resolution, mapInstanceRef) => {
  const zoom = mapInstanceRef.current!.getView().getZoomForResolution(resolution)!;
  const baseColor = feature.get('color') || '#000000';

  const baseWidth = zoom < 14.5 ? 2 : zoom < 15.3 ? 2 : zoom < 16 ? 3 : zoom < 17 ? 3 : 4;

  return new Style({
    stroke: new Stroke({
      color: hexToRgba(baseColor, 1),
      width: baseWidth,
      lineCap: 'round',
      lineDash: [5, 10], // Dashed line for bridges/tunnels
    }),
    zIndex: 1000,
  });
};

export const getStateLinesStyle: (
  feature: FeatureLike,
  resolution: number,
  mapInstanceRef: React.RefObject<Map | null>
) => Style | Style[] = (feature, resolution, mapInstanceRef) => {
  const zoom = mapInstanceRef.current!.getView().getZoomForResolution(resolution)!;
  const baseColor = feature.get('color') || '#c1c3c5';

  const baseWidth = zoom < 14.5 ? 2 : zoom < 15.3 ? 2 : zoom < 16 ? 3 : zoom < 17 ? 3 : 4;

  return new Style({
    stroke: new Stroke({
      color: hexToRgba(baseColor, 1),
      width: baseWidth,
      lineCap: 'round',
      lineDash: [1, 8],
    }),
    zIndex: 1000,
  });
};

export const getLandStyle: (feature: FeatureLike) => Style = (feature) => {
  let color = '#ffffff';

  if (['New Jersey', 'Connecticut'].includes(feature.get('name'))) {
    color = '#E5E5E6';
  }

  return new Style({
    stroke: new Stroke({
      color: color || 'gray',
      width: 1,
    }),
    fill: new Fill({
      color,
    }),
  });
};
