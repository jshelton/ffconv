const { exec } = require('child_process');

exec('md5 -q testData/file_example_MP4_1920_18MG_1.mp4', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }

  let outString = stdout.trim()
  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: "${outString}"`);
  console.log(`stderr: ${stderr}`);
});

//# See https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js