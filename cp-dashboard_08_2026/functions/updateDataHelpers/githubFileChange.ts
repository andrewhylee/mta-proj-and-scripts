import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_PAT_FOR_OCTOKIT_AUTH });

/** Performs git add, git commit, git push with payload & user credentails */
export async function githubFileChange(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  fileContent: string,
  commitMessage: string
) {
  // 1. Get latest commit SHA and tree SHA
  const {
    data: {
      object: { sha: latestCommitSha },
    },
  } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const { data: latestCommit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });

  const baseTreeSha = latestCommit.tree.sha;

  // 2. Create a blob for the file content
  const {
    data: { sha: blobSha },
  } = await octokit.git.createBlob({
    owner,
    repo,
    content: fileContent,
    encoding: 'utf-8',
  });

  // 3. Create a new tree with the updated file
  const {
    data: { sha: newTreeSha },
  } = await octokit.git.createTree({
    owner,
    repo,
    tree: [
      {
        path: filePath,
        mode: '100644', // File mode
        type: 'blob',
        sha: blobSha,
      },
    ],
    base_tree: baseTreeSha,
  });

  // 4. Create a new commit
  const {
    data: { sha: newCommitSha },
  } = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [latestCommitSha],
  });

  // 5. Update the branch reference
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitSha,
    force: false, // Set to true to force push (use with caution)
  });
}
