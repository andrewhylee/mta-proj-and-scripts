import { getStore } from '@netlify/blobs';

/**
 *
 * @param filename : name of the static file we want to update in the github repo (e.g. 'buget-overview')
 * @param openDataDatasetCode : code given to the dataset uploaded to openData, by openData (e.g. 6kvv-fcph)
 * @returns
 */
export async function detectChangesInOpenData({
  filename,
  openDataDatasetCode,
}: {
  filename: string;
  openDataDatasetCode: string;
}) {
  /** Check if cache date is more in the past than the most recent change date in the fetched changelog */
  try {
    // 6kvv-fcph
    const res = await fetch(
      `https://data.ny.gov/api/v3/views/${openDataDatasetCode}/query.json?pageSize=1&pageNumber=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.OPENDATA_CREDENTIALS_B64}`,
        },
      }
    );
    const json = await res.json(); // returned as the latest change first from OpenData
    const openDataChangedDateValue = json?.[0]?.[':updated_at'];
    console.log('openDataChangedDateValue:', openDataChangedDateValue);
    if (openDataChangedDateValue === undefined || openDataChangedDateValue === null) {
      console.log(
        'Only one version of the dataset exists on OpenData Portal (i.e. No records in changelog)'
      );
      return respondNoNewDataAvailable();
    }
    const lastUpdatedDate = new Date(openDataChangedDateValue);
    console.log('lastUpdatedDate:', lastUpdatedDate);

    const key = filename;
    const store = getStore('static-files-last-cached-dates');
    const storedValue = await store.get(key); // returns null if theres's no value in store
    const storedValueString = storedValue?.toString() ?? '';
    // If there is no storedValueString, we make lastCachedDate far in the past, automatically triggering a re-build of the cache
    // const lastCachedDate = storedValueString === '' ? new Date(0) : new Date(storedValueString);
    const lastCachedDate = new Date(0);
    console.log('lastCachedDate:', lastCachedDate);
    if (lastCachedDate > lastUpdatedDate) {
      return respondNoNewDataAvailable();
    }
    // At this point: passing all null checks and the cachedDate is earlier than the data update date
    // Therefore, record a new entry of <FILE_NAME>> : <TODAY_DATETIME> in "static-files-last-cached-dates"
    await store.set(key, new Date().toISOString());
    return {
      isNewDataAvailable: true,
    };
  } catch (e: any) {
    throw new Error(
      `Error fetching changelog for this dataset from OpenData portal: ${e?.message}`
    );
  }
}

function respondNoNewDataAvailable() {
  console.log(`No new Data is available on OpenData portal`);
  return {
    isNewDataAvailable: false,
  };
}
