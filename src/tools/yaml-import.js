/**
 * This script pulls together the different parts of the template.yaml SAM file.
 *
 * To build the full stack for real AWS environments run `node yaml-import.js` from the project root
 *
 * To build for local run `node yaml-import.js NO_LOCAL` from the project root
 *
 */

import { Composer, Parser, visit, parseDocument } from 'yaml';
import { readFileSync, writeFileSync } from 'fs';

const globalSkipFlags = process.argv[2] || '';

const sourceFile = readFileSync('./template-source.yaml', 'utf8');
let parser = new Parser();

let composer = new Composer();
let [document] = composer.compose(parser.parse(sourceFile));

let visitor = (key, node) => {
  if (node.tag === '!YAMLInclude') {
    const files = node.value.split(',');
    let fullContents;
    files.forEach(fileNameWithFlag => {
      const [fileName, skipFlag] = fileNameWithFlag.split('#');
      if(!globalSkipFlags.includes(skipFlag)) {
        const file = readFileSync(`./${fileName.trim()}`, 'utf8');
        const contents = parseDocument(file).contents;
        if (!fullContents) {
          fullContents = contents;
        } else {
          fullContents.items.push(...contents.items);
        }
      }
    })

    return fullContents;
  }
};
visit(document, visitor)

const outputContent = document.toString();
writeFileSync('./template.yaml', outputContent);
