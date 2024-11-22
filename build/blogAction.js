// run through all the blogs, parse their front matter, create a new blogs.json with all the blogs listings. 
// Hash the new blogs.json content and the old blogs.json. If they are the same then just cancel. If they are different override the old with the new and commit the changes.
var fs = require('fs');
var path = require('path');
const jsYaml = require('js-yaml');
const grayMatter = require('gray-matter');

var blogsJson = { "config": { version: 1 }, "blogs": [] };

fs.readdir("blogs", function (err, files) {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }

    files.forEach(function (file, index) {

        var filePath = path.join("blogs/", file);

        fs.stat(filePath, function (error, stat) {
            if (error) {
                console.error("Error stating file.", error);
                return;
            }

            if (!stat.isFile()) {
                console.error("Could not open file");
                process.exit(1);
            }

        });

        fs.readFile(filePath, function (error, file) {
            let parsedFile = grayMatter(file)
            let frontmatter = jsYaml.load(parsedFile.matter)
            blogsJson.blogs.push({ title: frontmatter.title, date: frontmatter.date, photoLink: frontmatter.photoLink, link: frontmatter.title.replace(/[^\w ]/g, ' ').trim().replace(/[^\w]/g, '-').replace(/(-)(?=-{0,}\1)/g, "").toLowerCase() })
            fs.writeFile("blogs.json", JSON.stringify(blogsJson), err => {

            });
        });
    });
});
