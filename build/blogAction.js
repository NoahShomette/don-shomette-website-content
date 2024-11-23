// run through all the blogs, parse their front matter, create a new blogs.json with all the blogs listings. 
// Hash the new blogs.json content and the old blogs.json. If they are the same then just cancel. If they are different override the old with the new and commit the changes.
var fs = require('fs');
var path = require('path');
const jsYaml = require('js-yaml');
const grayMatter = require('gray-matter');
const { Remarkable } = require('remarkable');
const { blogContentRenderer } = require('./blogContentRenderer');

var blogsJson = { "config": { version: 1 }, "blogs": [] };
var foldersNeedingRenamed = { "folders": [] };

const md = new Remarkable('commonmark');
md.use(blogContentRenderer);

let blogFolder;
try {
    blogFolder = fs.readdirSync("blogs");
} catch (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
}

blogFolder.forEach(function (folder, index) {
    let folderPath = path.join("blogs/", folder);
    // Read every file in the blog folder
    let blogFolderFiles;
    try {
        blogFolderFiles = fs.readdirSync(folderPath);
    } catch (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }
    let blogsJsonListing = {};
    let goalFolderPath;
    let photoFile;
    blogFolderFiles.forEach(function (file, index) {
        let actualFilePath = path.join(folderPath, file);
        let fileEnding = getFileEnding(actualFilePath);
        console.log(actualFilePath);
        // If its the markdown file then parse it and get the info it needs as well as render the html
        if (fileEnding === "md") {
            let file;
            try {
                file = fs.readFileSync(actualFilePath, "utf8");
            } catch (err) {

            }
            let parsedFile = grayMatter(file)
            let frontmatter = jsYaml.load(parsedFile.matter)
            console.log(frontmatter);
            blogsJsonListing.title = frontmatter.title;
            blogsJsonListing.date = frontmatter.date;
            blogsJsonListing.link = blogLinkName(frontmatter.title);
            goalFolderPath = path.join("blogs/", blogsJsonListing.link)
            // Write the rendered content to a html file
            try { fs.writeFileSync(path.join(folderPath, "blogContent.html"), md.render(parsedFile.content), { flag: 'w' }) }
            catch (err) {
                console.error("failed to write rendered blog to file", err);
                process.exit(1);
            }

            if (file != blogsJsonListing.link) {
                try { fs.renameSync(actualFilePath, path.join(goalFolderPath, blogsJsonListing.link + ".md")) }
                catch (err) {
                    console.error("failed to rename md file rendered blog to file", err);
                    process.exit(1);
                }
            }
        };
        // If its an image then its our blog photos
        if (fileEnding === "png" || fileEnding === "jpg" || fileEnding === "jpeg" || fileEnding === "webp") {
            photoFile = file;
        }
    });
    if (photoFile != null && goalFolderPath != null) {
        blogsJsonListing.photoLink = path.join("https://raw.githubusercontent.com/NoahShomette/don-shomette-website-content/release/", goalFolderPath, photoFile);
    }
    // After we've read all the files go ahead and do whatever we need to
    console.log(blogsJsonListing);
    // verify that the listing has everything we need and then push it to the blogsJson
    if (blogsJsonListing.title != null && blogsJsonListing.date != null && blogsJsonListing.photoLink != null && blogsJsonListing.link != null) {
        blogsJson.blogs.push(blogsJsonListing);
    } else {
        console.error("Listing for blogsJson did not include all required fields for blog", folderPath);
        process.exit(1);
    }

    if (folderPath != goalFolderPath) {
        foldersNeedingRenamed.folders.push({ oldFolderPath: folderPath, goalFolderPath: goalFolderPath });
    }
});

foldersNeedingRenamed.folders.forEach(function (folderInfo, index) {
    fs.rename(folderInfo.oldFolderPath, folderInfo.goalFolderPath, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
});

try { fs.writeFileSync("blogs.json", JSON.stringify(blogsJson), { flag: 'w' }) }
catch (err) {
    console.error("failed to write blogs.json", err);
    process.exit(1);
}

function blogLinkName(title) {
    return title.replace(/[^\w ]/g, ' ').trim().replace(/[^\w]/g, '-').replace(/(-)(?=-{0,}\1)/g, "").toLowerCase()
}

function getFileEnding(filePath) {
    var fileEnding = filePath.split(".");
    fileEnding = fileEnding.at(fileEnding.length - 1);
    return fileEnding
}
//https://raw.githubusercontent.com/NoahShomette/don-shomette-website-content/release/
