# Caching

## Session Storage

- All calls to the Open Data Portal outside of Search are cached in session storage to improve performance
- Full list of projects from open data portal

## Local Storage

Items stored in local storage can be expired using the file in /src/data/cache-dates.json.  The application compares the cache date for the item in local storage to the update date in the cache-dates.json file for the appropriate key and determines whether to use the cache or fetch new data. 

- All ArcGIS layers are stored in local storage
- The ACEP lookup data used by Search is stored in there under the key acepData
- The facility projects csv data is also cached here