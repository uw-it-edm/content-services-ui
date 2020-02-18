import { readFile, writeFile } from 'fs';

const files = [
  './src/environments/environment.proxy.template.ts',
  './src/environments/local-proxy.conf.template.json'
];
const vars = {
  'EDM_NETID': process.env.EDM_NETID,
  'EDM_PROFILE_API_PORT': process.env.EDM_PROFILE_API_PORT,
  'EDM_SEARCH_API_PORT': process.env.EDM_SEARCH_API_PORT,
  'EDM_CONTENT_API_PORT': process.env.EDM_CONTENT_API_PORT,
  'EDM_DATA_API_PORT': process.env.EDM_DATA_API_PORT
};

files.forEach(function (filePath) {
  injectVarsInFile(filePath, function (err, newFilePath) {
    if (err) {
      console.error(`Error injecting environment variables to file ${filePath}.`, err);
    } else {
      console.log(`Injected environment variables from '${filePath}' to '${newFilePath}'`);
    }
  });
});

function injectVarsInFile(filePath, callback) {
  readFile(filePath, 'utf8', (readError, data) => {
    if (readError) {
      callback(readError);
      return;
    }

    Object.keys(vars).forEach(key => {
      data = data.replace(key, vars[key]);
    });

    const newFileName = filePath.replace('.template', '');
    writeFile(newFileName, data, 'utf8', (writeError) => {
      if (writeError) {
        callback(writeError);
      } else {
        callback(null, newFileName);
      }
    });
  });
}
