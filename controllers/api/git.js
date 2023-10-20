const path = require('path')
const git = require('simple-git/promise');
var config = require('../../config');


module.exports = {
  index: async function  (scope) {

  },
  push: async function (scope) {
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return;
    }
    let project = config.projectList[this.query.project];
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return;
    }
    let pathName = project.folder
    let  commitMessage = 'update i18n --auto'

    const GIT_REPOSITORY_ROOT = path.resolve(__dirname, '../../git/'+ pathName)
    simpleGit = git(GIT_REPOSITORY_ROOT );

    //以下的所有命令都是基于这个repository的路径进行操作了
    let mesg = 'suc'
    let code = 0
    let data = null;
    try{
      await simpleGit.pull();  
      await simpleGit.checkout('i18n-system-use');
      await simpleGit.add('./*');
      await simpleGit.commit(commitMessage);
      await simpleGit.push('origin', 'i18n-system-use');
      data = await simpleGit.status();
    }catch(e){
      code = 1;
      mesg = e.message;
    }
    this.renderJSON({code, data, message:mesg})
  },

  pull: async function (scope) {
    let mesg = 'suc'
    let code = 0
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return;
    }
    let project = config.projectList[this.query.project];
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return;
    }
    let pathName = project.folder

    const GIT_REPOSITORY_ROOT = path.resolve(__dirname, '../../git/'+ pathName)
    simpleGit = git(GIT_REPOSITORY_ROOT );
    try{
      await simpleGit.pull();  
      await simpleGit.checkout('i18n-system-use');
    }catch(e){
      code = 1;
      mesg = e.message;
    }
    try{
      this.renderJSON({code, message:mesg})
    }catch(e){
      console.log(e)
    }
  },

  reset: async function (scope) {
    let mesg = 'suc'
    let code = 0
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return;
    }
    let project = config.projectList[this.query.project];
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return;
    }
    let pathName = project.folder

    const GIT_REPOSITORY_ROOT = path.resolve(__dirname, '../../git/'+ pathName)
    simpleGit = git(GIT_REPOSITORY_ROOT );
    try{
      await simpleGit.reset('origin', 'i18n-system-use', ['--hard']);  
    }catch(e){
      code = 1;
      mesg = e.message;
    }
    try{
      this.renderJSON({code, message:mesg})
    }catch(e){
      console.log(e)
    }
  }

}