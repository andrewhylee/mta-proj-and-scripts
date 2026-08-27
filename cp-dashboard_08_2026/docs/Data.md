# Data used in Dashboard

## NY Open Data Portal

- Project Details: https://data.ny.gov/Transportation/MTA-Capital-Project-Details-Beginning-1982/9hy6-8j6t/about_data
- Project Schedule: https://data.ny.gov/Transportation/MTA-Capital-Project-Schedules-Beginning-1982/nswv-d6bz/about_data
- Project Budget: https://data.ny.gov/Transportation/MTA-Capital-Project-Budgets-Beginning-1982/f6fd-xfps/about_data
- Acep Details: https://data.ny.gov/Transportation/MTA-Capital-Projects-ACEP-Funding-Plans-Beginning-/6kvv-fcph/about_data

** This is a private dataset so you need credentials to access through the browser or API. Credentials for API are stored in environment variables named OPEN_DATA_USERNAME and OPEN_DATA_PASSWORD

## Data in /public/data folder

- YYMMDD_facility_project_final.csv - Facility project list with point_ids to look against station ArcGIS layer (Provided by Kevin C.)
- aceps-lookup.csv - Lookup file used by search and produces using /utilities/extract-aceps.cjs with /data/budget_overview.json as the source

## Data in /src/data folder

- /geojson/project_lines.json - Latest geojson file for the projects which have project lines which are the rail projects. This is a geojson file but was given a json extension so it could be imported. (Provided by Kevin C.)
- budget-overview.json - Nested ACEP data which is used on the budget-overview page and serves as the source for the aceps-lookup.csv file (Provided by Kevin C.)
- cache-dates.json - File for expiring data stored in localstorage
- filters.json - Hard coded array with capital plans
- geography-lookup.json - Mapping of geographic/district codes to readable names
- initiatives.json - List of initiatives and descriptions used on initiatives page. This is also used in the search. 
- services.json - List of transit services and associated information used on the transit services page. This is also used in the search. 
- transit-services.json - List of overarching transit services and their descriptions.

## Data loading for initial load

| order | data | location | source | browser storage | global state (atom) |
|---:|---|---|---|---|---|
| 1 | cache-dates.json | Layout.tsx | static file | None | Yes |
| 2 | Project details | Layout.tsx | open data portal | session storage | Yes |
| 3 | transit-servies.json | Search.tsx | static file | None | No |
| 4 | iniatiatives.json | Search.tsx | static file | None | No |
| 5 | aceps-lookup.json | Search.tsx | static file | local storage | No |
| 6 | geography-lookup.json | FilterGrid.tsx | static file | None | No |
| 7 | filters.json | FilterGrid.tsx | static file | None | No |
| 8 | ArcGIS layers | Map.tsx | ArcGIS server | local storage | No |
| 9 | project_lines.json | Map.tsx | static file | None | No |
| 10 | YYMMDD_facility_project_final.csv | Map.tsx | static file | local storage | No |

