# Environment variables used in application

- Environment variables are defined by branch in Netlify here: https://app.netlify.com/projects/mta-cp-dashboard/configuration/env#content
- For local development, use a .env.local file which **should not be checked in**

## Environment Variables
- ARCGIS_DOMAIN - The domain for the MTA ArcGIS server
- ARCGIS_CLIENT_ID - The oAuth client id for ArcGIS authentication
- ARCGIS_SECRET - The oAuth secret for ArcGIS authentication
- OPENDATA_USERNAME - The username setup within open data portal for accessing private datasets
- OPENDATA_PASSWORD - The password setup withing open data portal for accessing private datasets
- NODE_TLS_REJECT_UNAUTHORIZED - Flag which should only be set in non-prod environments or where needed. This tells the server to not do certificate verification when set to 0 and is necessary due to ArcGIS