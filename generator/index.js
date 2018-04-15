const fs = require('fs');
const path = require('path');
const { createSource } = require('./create');

const targets = ['js', 'ts'];

const [, , version = 'es2018', dest = 'generated'] = process.argv;
targets.forEach(target => {
    // eslint-disable-next-line no-console
    console.log('Target:', target);
    const targetPath = path.resolve(dest);
    const targetFile = path.join(targetPath, version + '.' + target);

    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath);
    }

    const source = createSource(version, target);
    fs.writeFileSync(targetFile, source);

    // eslint-disable-next-line no-console
    console.log('\t', version, '=>', targetFile, '\n');
});