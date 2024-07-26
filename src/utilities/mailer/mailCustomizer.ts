import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export async function mailCustomizer(htmlFilePath: string, replacements: any) {
  const filePath = path.join(__dirname, htmlFilePath);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(replacements);
  return htmlToSend;
}

handlebars.registerHelper('check', function(value, comparator) {
  return (value === comparator) ? 'No content' : value;
});

