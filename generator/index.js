const fs = require('fs');
const path = require('path');
const { createSource } = require('./create');
const { getCliArgs } = require('./utils');

const args = getCliArgs(process.argv, {
    types: {
        es: Array,
        t: Array,
        o: String
    },
    map: {
        es: 'versions',
        t: 'target',
        o: 'output'
    },
    defaults: {
        es: ['es2018'],
        t: ['js', 'ts'],
        o: 'generated'
    }
});

args.versions.forEach(version => {
    const targetPath = path.resolve(args.output);

    // eslint-disable-next-line no-console
    console.log('Version:', version);
    args.target.forEach(target => {
        const targetFile = path.join(targetPath, version + '.' + target);

        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }

        const source = createSource(version, target);
        fs.writeFileSync(targetFile, source);

        // eslint-disable-next-line no-console
        console.log('\t', target, '=>', targetFile);
    });
});