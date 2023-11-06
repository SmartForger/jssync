const fs = require("fs");
const archiver = require("archiver");

const packagejson = fs.readFileSync("package.json", "utf-8");
const data = JSON.parse(packagejson);
const filename = `${__dirname}/release/${data.name}-${data.version}.zip`;

const output = fs.createWriteStream(filename);

const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

output.on("end", function () {
  console.log("Data has been drained");
});

archive.pipe(output);

const fileList = [
  "package.json",
  "package-lock.json",
  ".nvmrc",
  'keygen.exe'
];

fileList.forEach((filename) => {
  archive.append(fs.createReadStream(filename), { name: filename });
});

archive.directory("dist/", ".");
archive.directory("public/", "public");

archive.finalize();
