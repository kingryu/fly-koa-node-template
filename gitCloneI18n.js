//git 提交
const gitp = require('simple-git/promise');
const git = require('simple-git');
const path = require('path');
const config = require('./config');
const ORG_GITREPO = 'https://temp:temp@git.com/Phoenix/FEB-org-platform.git' //替换成你的git私库地址及帐密
const CLASS_GITREPO = 'https://temp:temp@git.com/Phoenix/FE-techedux-class.git'
const SCHOOL_GITREPO = 'https://temp:temp@git.com/Phoenix/teacher-admin-techedux.git'
const RES_GITREPO = 'https://temp:temp@git.com/Phoenix/passport-res-package.git'

const GIT_REPOSITORY_ROOT = path.resolve(__dirname, './git/')
let simpleGit

const projectName =(type)=>{
  let pjName = 'feb-techedux-school'
  if(type == 'org'){
    pjName = 'feb-org-platform'
  }else if(type == 'class'){
    pjName = 'fe-techedux-class'
  }else if(type == 'res'){
    pjName = 'passport-res-package'
  }
  return pjName;
}

const updateRes =  async (type) =>{
  let repo = SCHOOL_GITREPO
  if(type == 'org'){
    repo = ORG_GITREPO
  }else if(type == 'class'){
    repo = CLASS_GITREPO
  }else if(type == 'res'){
    repo = RES_GITREPO
  }
  let pjName = projectName(type)
  try{
    await gitp().clone(repo, GIT_REPOSITORY_ROOT+'/'+pjName)
    console.log('git clone '+type +' success')
    simpleGit = gitp(GIT_REPOSITORY_ROOT+'/'+pjName)
    await simpleGit.checkout('i18n-system-use');
    console.log('checkout '+ type + ' success')
  }catch(e){
    console.error(e)
  }
}

const addConfig = (type) =>{
  let pjName = projectName(type)
  try{
    let simpleGit = git(GIT_REPOSITORY_ROOT+'/'+pjName)
    simpleGit.addConfig('user.name', 'root').addConfig('user.email', 'root@techedux.com')
  }catch(e){
    console.error(e)
  }
}

const cloneProject = async ()=>{
  await updateRes('org')
  await updateRes('class')
  await updateRes('school')
  await updateRes('res')
  addConfig('org')
  addConfig('class')
  addConfig('school')
  addConfig('res')
}

// cloneProject()
module.exports = cloneProject