/*
Iterate through classes folder. Every folder inside it will represent a year of classes. Each year will get a `year-classes.json` file.

Each class will be in a separate folder inside its year folder. The class folder will hold the flyer pdf.


*/
var fs = require('fs');
var path = require('path');
/**
 * The classes folder which contains each year folder
 */
let classesFolder;
try {
    classesFolder = fs.readdirSync("classes");
} catch (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
}

/** iterates through every year folder in the classes folder */
classesFolder.forEach(function (folder, index) {
    /**
     * The year json which contains the meta information for the classes within that year
     */
    var yearJson = { "months": [] };
    var foldersNeedingRenamed = { "folders": [] };

    let yearFolderPath = path.join("classes/", folder);

    let yearFolder;
    try {
        yearFolder = fs.readdirSync(yearFolderPath);
    } catch (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }
    /** Iterates through every class folder in each year folder */
    yearFolder.forEach(function (file, index) {
        let classFolderPath = path.join(yearFolderPath, file);

        /**
         * The folder which contains the class information
         */
        let classFolder;
        try {
            classFolder = fs.readdirSync(classFolderPath);
        } catch (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }
        let classJsonListing = {};
        let goalClassPath;
        let flyerFile;
        /**
         * Iterates through every file in the class folder
         */
        classFolder.forEach(function (fileName, index) {
            let actualFilePath = path.join(classFolderPath, fileName);
            let fileEnding = getFileEnding(actualFilePath);
            if (fileEnding === "json") {
                let file;
                try {
                    file = fs.readFileSync(actualFilePath, "utf8");
                } catch (err) {

                }
                file = JSON.parse(file);
                verifyClassPropery(file, "class_name", actualFilePath);
                verifyClassPropery(file, "state", actualFilePath);
                verifyClassPropery(file, "public", actualFilePath);
                verifyClassPropery(file, "starting_date", actualFilePath);
                verifyClassPropery(file, "display_date", actualFilePath);
                verifyClassPropery(file, "month", actualFilePath);
                verifyClassPropery(file, "year", actualFilePath);

                // if the class starting date is before the current date or the folder is less than the current year ignore verifying fields that are needed for registration pages.
                // EXCLUDING
                // - Old registration pages are closed and therefore shouldnt ever be available.
                // - Pages with custom registration links wont be generated and therefore dont need this info
                // - Private classes are private and dont generate pages either and therefore dont need anything
                if ((new Date(file.starting_date) >= new Date() || folder > new Date().getFullYear()) && !file.hasOwnProperty("registration_link") && !file.hasOwnProperty("public")) {
                    verifyClassPropery(file, "fee", actualFilePath);
                    verifyClassPropery(file, "form_id", actualFilePath);
                    verifyClassPropery(file, "location_room", actualFilePath);
                    verifyClassPropery(file, "location_address_line_1", actualFilePath);
                    verifyClassPropery(file, "location_address_line_2", actualFilePath);
                }
                classJsonListing.class_name = file.class_name;
                classJsonListing.state = file.state;
                classJsonListing.public = file.public;
                classJsonListing.starting_date = file.starting_date;
                classJsonListing.display_date = file.display_date;
                classJsonListing.link = classLinkName(file, file.month, file.year);
                goalClassPath = path.join(yearFolderPath, classJsonListing.link)
                console.log(goalClassPath)
                // Optional fields
                if (file.hasOwnProperty("sponsered_by")) {
                    classJsonListing.sponsered_by = file.sponsered_by;
                }
                if (file.hasOwnProperty("city")) {
                    classJsonListing.city = file.city;
                }
                if (file.hasOwnProperty("class_subtitle")) {
                    classJsonListing.class_subtitle = file.class_subtitle;
                }
                if (file.hasOwnProperty("registration_link")) {
                    classJsonListing.registration_link = file.registration_link;
                }
                verifyClassPropery(classJsonListing, "class_name", actualFilePath);
                verifyClassPropery(classJsonListing, "state", actualFilePath);
                verifyClassPropery(classJsonListing, "public", actualFilePath);
                verifyClassPropery(classJsonListing, "starting_date", actualFilePath);
                verifyClassPropery(classJsonListing, "display_date", actualFilePath);
                verifyClassPropery(classJsonListing, "link", actualFilePath);

                let monthAlreadyExists = false;
                yearJson.months.forEach(function (month, index) {
                    if (month.month === file.month) {
                        month.classes.push(classJsonListing);
                        monthAlreadyExists = true;
                    }
                });
                if (!monthAlreadyExists) {
                    yearJson.months.push({ "month": file.month, "classes": [classJsonListing] })
                }

                if (fileName != classJsonListing.link + ".json") {
                    try { fs.renameSync(actualFilePath, path.join(classFolderPath, classJsonListing.link + ".json")) }
                    catch (err) {
                        console.error("failed to rename class json file", err);
                        process.exit(1);
                    }
                }
            }

            if (fileEnding === "pdf") {
                flyerFile = fileName;
            }
        });
        if (flyerFile != null && goalClassPath != null) {
            if (flyerFile != classJsonListing.link + ".pdf") {
                try { fs.renameSync(path.join(classFolderPath, flyerFile), path.join(classFolderPath, classJsonListing.link + ".pdf")) }
                catch (err) {
                    console.error("failed to rename flyer", err);
                    process.exit(1);
                }
            }
        }

        sortByMonth(yearJson.months);
        yearJson.months.forEach(function (month, index) {
            month.classes.forEach(function (clas, index) {
                month.classes.sort(function (a, b) {
                    return new Date(a.starting_date) - new Date(b.starting_date)
                });
            });
        });
        // Here we need to write the yearJson out to its `year-classes.json` file
        try { fs.writeFileSync(folder + "-classes.json", JSON.stringify(yearJson), { flag: 'w' }) }
        catch (err) {
            console.error("failed to write year-classes.json", err);
            process.exit(1);
        }

        if (classFolderPath != goalClassPath) {
            foldersNeedingRenamed.folders.push({ classFolderPath: classFolderPath, goalClassPath: goalClassPath });
        }
    });


    foldersNeedingRenamed.folders.forEach(function (folderInfo, index) {
        try { fs.renameSync(folderInfo.classFolderPath, folderInfo.goalClassPath) }
        catch (err) {
            console.error("failed to rename folder", err);
            process.exit(1);
        }
    });

});


function classLinkName(classItem, month, year) {
    let city = "";

    if (classItem.hasOwnProperty("city")) {
        city = "-" + classItem.city.replace(/\s+/g, '-').toLowerCase();
    }
    return month + "-" + classItem.display_date.replace(/[, ]+/g, '-').toLowerCase() + "-" + year + "-" + classItem.class_name.replace(/\s+/g, '-').replace("&", "and").toLowerCase() + city + "-" + classItem.state.replace(/\s+/g, '-').toLowerCase()
}

function getFileEnding(filePath) {
    var fileEnding = filePath.split(".");
    fileEnding = fileEnding.at(fileEnding.length - 1);
    return fileEnding
}

function verifyClassPropery(file, verifyProp, filepath) {
    if (!file.hasOwnProperty(verifyProp)) {
        console.error("Listing for class did not include all required fields - Missing field: {" + verifyProp + "} for file: {" + filepath + "}");
        process.exit(1);
    }
}

function sortByMonth(arr) {
    var months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    arr.sort(function (a, b) {
        return months.indexOf(a.month)
            - months.indexOf(b.month);
    });
}
