var fs = require("fs/promises");
var path = require("path");
var indexTemplate = "";

async function copy(from, to, isDir) {
  if (await exists(from)) {
    if (isDir || (await fs.stat(from)).isDirectory()) {
      await fs.mkdir(to, { recursive: true })
      let entries = await fs.readdir(from, { withFileTypes: true })

      for (let entry of entries) {
        let fromPath = path.join(from, entry.name)
        let toPath = path.join(to, entry.name)

        entry.isDirectory() ?
          await copy(fromPath, toPath, true) :
          await fs.copyFile(fromPath, toPath)
      }
    } else {
      return await fs.copyFile(from, to)
    }
  }
}

async function exists(path) {
  try {
    await fs.access(path)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

async function makeIndex(dirPath) {
  try {
    await fs.writeFile(
      path.join("dist/", dirPath, "/index.html"),
      indexTemplate.replace(
        "${dirPath}",
        `https://scp-wiki-cn.wikidot.com/${dirPath}`),
      "utf8")
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

!(async ()=>{
  await fs.rm("dist", { recursive: true, force: true });
  await fs.mkdir("dist/");
  indexTemplate = await fs.readFile("index.template.html", "utf8");
  for (const frame of ["index.html"]) {
    await copy(frame, "dist/" + frame);
  }
  for (const frame of ["top-rated-pages-this-month"]) {
    await copy(frame, "dist/" + frame);
    await makeIndex(frame);
  }
})().catch(e=>console.log(e));