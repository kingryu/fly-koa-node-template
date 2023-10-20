// @ts-check
const fs = require('fs')

const fsOption = {
  encoding: 'utf8'
}

module.exports = {
  read (path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err) {
          reject(err)
        } else {
          if (stats.isFile()) {
            fs.readFile(path, fsOption, (err, data) => {
              if (err) {
                reject(err)
              } else {
                try {
                  resolve(JSON.parse(data))
                } catch (ex) {
                  reject(ex)
                }
              }
            })
          } else {
            reject(new Error('cache file is not exist'))
          }
        }
      })
    })
  },
  write (path, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data), fsOption.encoding, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  }
}
