# ArcGIS Information

## Environments

The domain to use for ArcGIS requests is stored in an environment variable in Netflify with branch/build specific values

    - Production: gis.mta.info
    - QA: gisqa.mta.info
    - Test: gistest.mta.info

## Authentication

MTA ArcGIS requires oAuth for authentication which means you need to supply both a client_id and a secret with requests to it. Each environment has it's own set of credentials and these are stored as environment variables in Netlify. These credentials are used to get a token which has a fairly short expiration. This token is stored in browser session state and used only for retrieving layers. 

## Layers

The following layers are consumed by the application. Most are mainly used as visuals for the map but a few have additional purposes

| Layer Name            | ArcGIS URL                          | Description                                                                                                                                         |
|-----------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Subway                | Subway_lines/FeatureServer/0        | Used for display and for determining initial extent for NYC view.                                                                                   |
| Long Island Railroad  | LIRR_lines/FeatureServer/0          | Used for display and for determining initial extent for Region view along with Metro-North Railroad (MNR).                                          |
| Metro-North Railroad  | MNR_lines/FeatureServer/0           | Used for display and for determining initial extent for Region view along with Long Island Railroad (LIRR).                                         |
| Facilities            | Facilities/FeatureServer/0          | Used for display and provides metadata for station label positioning. The `point_id` is used to match facility projects loaded from a CSV file.     |
| Boroughs              | Boroughs/FeatureServer/0            | Used to determine extent for bus services on the transit services page, which are broken out by borough.                                            |
| Bridges and Tunnels   | B_and_T/FeatureServer/0             | Used for display purposes.                                                                                                                          |
| State Lines           | State_Lines/FeatureServer/0         | Used for display purposes.                                                                                                                          |
| County Lines          | Counties/FeatureServer/0            | Used for display purposes.                                                                                                                          |
| County Labels         | County_Labels/FeatureServer/0       | Used for display purposes.                                                                                                                          |
| Land Areas            | Land/FeatureServer/0                | Used for display purposes.                                                                                                                          |
| Parks and Open Space  | Parks/FeatureServer/0               | Used for display purposes.                                                                                                                          |


**All ArcGIS layers are cached in local storage in the browser after being retrieved. When layers are updated in ArcGIS, developers can force an update by modifying the `updateDate` for the appropriate entry in the `@data/cache-dates.json` file.**






