const fs = require('fs');
const path = require('path');
const { parse, extend } = require('./parse');
const generateSource = require('./generate');

const estreePath = path.resolve(__dirname, '../estree');
const esVersions = {
    es5: path.join(estreePath, 'es5.md'),
    es2015: path.join(estreePath, 'es2015.md'),
    es2016: path.join(estreePath, 'es2016.md'),
    es2017: path.join(estreePath, 'es2017.md'),
    es2018: path.join(estreePath, 'es2018.md')
};

function getDescriptors(version = 'es2018') {
    let allDescriptors = {};

    if (!esVersions.hasOwnProperty(version)) {
        throw new Error('Unknown ES version');
    }

    for (const currentVersion in esVersions) {
        const descriptors = parse(fs.readFileSync(esVersions[currentVersion], 'utf8'));

        extend(allDescriptors, descriptors);

        if (currentVersion === version) {
            break;
        }
    }

    for (const descriptorName in allDescriptors) {
        const descriptor = allDescriptors[descriptorName];

        if (descriptor.base && descriptor.base.length) {
            for (let i = 0; i < descriptor.base.length; i++) {
                const base = descriptor.base[i];

                descriptor.base[i] = { name: base, descriptor: allDescriptors[base] };
            }
        }
    }

    return allDescriptors;
}

exports.createSource = function createSource(version = 'es2018', target='js') {
    return generateSource(getDescriptors(version), target);
}
