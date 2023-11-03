const path = require('path');
const git = require('simple-git');
//git 同步main qa 分支和develop分支对齐
const GIT_REPOSITORY_ROOT = path.resolve(__dirname);

const updateRes = async () => {
  const simpleGit = git(GIT_REPOSITORY_ROOT);
  await simpleGit.pull('origin', 'develop');
  await simpleGit.checkout('qa');
  await simpleGit.rebase(['--onto',  'develop', 'qa'])
  await simpleGit.push('origin', 'qa');
  await simpleGit.checkout('main');
  await simpleGit.rebase(['--onto',  'develop', 'main'])
  await simpleGit.push('origin', 'main');
  await simpleGit.checkout('develop');
};

updateRes()