const sh = require('shelljs')

const result = sh.exec('npm info react', () => {

})

console.log('===>>result', result);