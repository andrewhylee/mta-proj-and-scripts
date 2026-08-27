import process from 'process';
import { detectChangesInOpenData } from './detectChangesInOpenData';
import { githubFileChange } from './githubFileChange';
import { staticFiles } from './staticFiles';
import { transformBudgetOverviewData } from './transformData-budget-overview';
import type { StaticFileNames } from './updateStaticFile-types';

const startTime = performance.now();
let endTime: number;

export const updateStaticFile = async (staticFilename: StaticFileNames) => {
  const { filename, openDataDatasetCode, pathFromProjectRoot } = staticFiles[staticFilename];
  const changesInOpenData = await detectChangesInOpenData({
    filename,
    openDataDatasetCode,
  });

  if (!changesInOpenData.isNewDataAvailable) return;

  let csvString;
  try {
    const response = await fetch(
      `https://data.ny.gov/api/v3/views/${openDataDatasetCode}/query.csv`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'text/csv',
          Authorization: `Basic ${process.env.OPENDATA_CREDENTIALS_B64}`,
        },
      }
    );
    csvString = await response.text();
  } catch (e: any) {
    throw new Error(`Fetching ${filename} Data from NYS OpenData Portal failed: ${e?.message}`);
  }

  const static_file_nested_json = transformBudgetOverviewData(csvString);

  /** Write to github repo to all 3 environments */
  const environments = ['Main', 'QA', 'Test'];
  for (let env of environments) {
    await githubFileChange(
      process.env.GITHUB_PROJECT_OWNER_OCTOKIT_AUTH as string, //   'project-owner',
      'cp-dashboard', //   'your-repo',
      env, //   'your-branch',
      pathFromProjectRoot, //   'path/to/your/file/from/root_of_project/text.txt',
      JSON.stringify(static_file_nested_json, null, 2), //   'New content here',
      `Updated ${filename} file on ${new Date().toISOString()} in ${env} branch via Octokit` //   'Commit message to show on github'
    );

    endTime = performance.now();

    /** Logging */
    console.log(`🎉 Updated ${filename} on ${new Date().toISOString()} in ${env} branch`);
    console.log('Total Time: ', Math.trunc(endTime - startTime) / 1000, ' seconds');
  }
  return;
};
