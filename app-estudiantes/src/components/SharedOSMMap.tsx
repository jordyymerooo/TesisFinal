import React, { forwardRef } from 'react';
import MapView, { MapViewProps, UrlTile } from 'react-native-maps';

export const SharedOSMMap = forwardRef<MapView, MapViewProps>((props, ref) => {
  return (
    <MapView
      ref={ref}
      {...props}
      mapType="none"
    >
      <UrlTile
        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />
      {props.children}
    </MapView>
  );
});
