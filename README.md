# Content for Don Shomette Website

Converts/processes raw content into formats usable by the website and creates meta files.

## Overview

Composed of separate steps

1. Process blogs folder using build/blogAction.js. This parses frontmatter, creates html files of the parsed content, and creates meta files.
2. Process classes folder using build/classAction.js. This parses each class, renaming files, generating links and names, and creating meta files.
3. Verifies the results using basic checks. Make sure we have all the meta files and stuff and there werent any errors. If there were any kill the action and dont proceed
4. Takes the new result and commits it back into the repo. This ensures that the files in the repo are always formatted how they should.


## Todo

- Make sure git installs correct npm modules
  - js-yaml
  - gray-matter