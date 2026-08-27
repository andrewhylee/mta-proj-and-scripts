# Automatically Updating & Generating the Static Files that exist within the Repository

## Data Source

- Our data originates several sources: Static Server Files, Open Data Portal, ArcGIS Server Files (ie Layers).
- Some of our static files needs to get periodically updated.
- Some of our static files are transformed representations of the data available in Open Data Portal (eg `budget-overview.json`).

## How it works

- Netlify provides a product called `Scheduled Functions` which are programs that can be run at a specified time.

- We utilize this tool to periodically fetch the updated data from Open Data Portal, transform it, and then store it into our server's static file.

## Where it lives

All of functions related to updating the static files lives in

```
cp-dashboard/functions
```

Top-level Scheduled Functions are named `update` + `<FILE_NAME>` and live in the top level of the folder. This also contains the schedule at which this functions run at.

They utilize helper functions with `updateDataHelpers` subfolder.

## Helper Function / Module Descriptions

`detectChangesInOpenData.ts`

- It queries Open Data Portal to detect if a new dataset has been uploaded
- If no, it does aborts carrying out the update process
- If yes, it stores the current DateTime into the Blob Store (to log the last time the static file cache was updated), and then continues the process

`updateStaticFile.ts`

- As the main orchestrator, it carries out most of the updating process.
- It also fetches data from the Open Data Portal

`transformData-budget-overview.ts`

- It uses `arquero` a numpy like JS library to transform the fetched data

`githubFileChange.ts`

- It uses `Octokit` and Personal Access Token within environment variables to update the static file stored in remote github repository

`staticFiles.ts`

- It consolidates all information about the static file (such as filename, path, Open Data Dataset Code)
- This is important as it enforces right files are linked to the right Open Data Portal Datasets

`updateStaticFile-types.ts`

- It holds types used in this process
